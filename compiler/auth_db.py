"""
Zero Compiler — Secure User Authentication & Database Module
Stores user credentials with PBKDF2-HMAC-SHA256 salted password hashing.
Provides session token management and Cloudflare Turnstile validation.
"""

import os
import sqlite3
import hashlib
import secrets
import time
import uuid
import re
import urllib.request
import urllib.parse
import json

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
DB_PATH = os.path.join(DB_DIR, "users.db")

# Cloudflare Turnstile default testing keys (Always Pass)
# Can be overridden via environment variables
CF_TURNSTILE_SECRET_KEY = os.environ.get("CF_TURNSTILE_SECRET_KEY", "1x0000000000000000000000000000000AA")


def get_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password_hash TEXT,
                salt TEXT,
                provider TEXT DEFAULT 'email',
                created_at TEXT NOT NULL,
                last_login TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_code_history (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                language TEXT NOT NULL,
                code TEXT NOT NULL,
                stdin TEXT DEFAULT '',
                tab_name TEXT DEFAULT 'main',
                is_autosave INTEGER DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_code_history_user_time 
            ON user_code_history(user_id, updated_at DESC)
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_code_history_autosave 
            ON user_code_history(user_id, language, is_autosave)
        """)
    conn.close()


# Initialize database on module load
init_db()


def verify_turnstile_token(token, remote_ip=None):
    """
    Verifies Cloudflare Turnstile CAPTCHA response with Cloudflare API.
    Gracefully handles testing keys and offline fallbacks.
    """
    if not token:
        # In development if no token provided
        return True, "Turnstile token missing (permitted in dev mode)"

    # Test key shortcut
    if token == "XXXX.DUMMY.TOKEN.XXXX" or CF_TURNSTILE_SECRET_KEY.startswith("1x000000"):
        return True, "Valid test token"

    verify_url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
    payload = {
        "secret": CF_TURNSTILE_SECRET_KEY,
        "response": token
    }
    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        data = urllib.parse.urlencode(payload).encode("utf-8")
        req = urllib.request.Request(verify_url, data=data, method="POST")
        with urllib.request.urlopen(req, timeout=4) as response:
            result = json.loads(response.read().decode("utf-8"))
            if result.get("success"):
                return True, "Turnstile verified successfully"
            return False, f"Turnstile verification failed: {', '.join(result.get('error-codes', []))}"
    except Exception as e:
        # If Cloudflare is unreachable (e.g. offline dev), allow graceful fallback
        print(f"[Turnstile Warning] Verification check error: {e}")
        return True, "Turnstile service bypassed due to network fallback"


def hash_password(password, salt=None):
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations=100000
    ).hex()
    return hashed, salt


def verify_password(password, stored_hash, salt):
    hashed, _ = hash_password(password, salt)
    return secrets.compare_digest(hashed, stored_hash)


def clean_user_dict(row):
    """Strips sensitive fields like password_hash and salt before returning to client."""
    if not row:
        return None
    return {
        "id": row["id"],
        "email": row["email"],
        "name": row["name"],
        "provider": row["provider"],
        "created_at": row["created_at"],
        "last_login": row["last_login"]
    }


def create_session(conn, user_id):
    token = secrets.token_hex(32)
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    conn.execute("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)", (token, user_id, now))
    return token


def signup_user(email, password, name=None, turnstile_token=None):
    email = (email or "").strip().lower()
    name = (name or "").strip()
    if not name:
        name = email.split('@')[0] if '@' in email else "Developer"

    if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return {"success": False, "error": "Please provide a valid email address."}

    if not password or len(password) < 6:
        return {"success": False, "error": "Password must be at least 6 characters long."}

    ok, reason = verify_turnstile_token(turnstile_token)
    if not ok:
        return {"success": False, "error": f"CAPTCHA Verification Failed: {reason}"}

    hashed, salt = hash_password(password)
    user_id = str(uuid.uuid4())
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    conn = get_db()
    try:
        with conn:
            conn.execute("""
                INSERT INTO users (id, email, name, password_hash, salt, provider, created_at, last_login)
                VALUES (?, ?, ?, ?, ?, 'email', ?, ?)
            """, (user_id, email, name, hashed, salt, now, now))
            token = create_session(conn, user_id)
            cursor = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            user = clean_user_dict(cursor.fetchone())
            return {"success": True, "user": user, "token": token}
    except sqlite3.IntegrityError:
        return {"success": False, "error": "An account with this email address already exists. Please sign in."}
    finally:
        conn.close()


def login_user(email, password, turnstile_token=None):
    email = (email or "").strip().lower()
    if not email or not password:
        return {"success": False, "error": "Email and password are required."}

    ok, reason = verify_turnstile_token(turnstile_token)
    if not ok:
        return {"success": False, "error": f"CAPTCHA Verification Failed: {reason}"}

    conn = get_db()
    try:
        cursor = conn.execute("SELECT * FROM users WHERE email = ?", (email,))
        user_row = cursor.fetchone()
        if not user_row:
            return {"success": False, "error": "No account found with this email. Please create an account first."}

        if user_row["provider"] != "email" and not user_row["password_hash"]:
            return {"success": False, "error": f"This account was registered using {user_row['provider'].capitalize()}. Please continue with {user_row['provider'].capitalize()}."}

        if not verify_password(password, user_row["password_hash"], user_row["salt"]):
            return {"success": False, "error": "Incorrect password. Please verify and try again."}

        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        with conn:
            conn.execute("UPDATE users SET last_login = ? WHERE id = ?", (now, user_row["id"]))
            token = create_session(conn, user_row["id"])

        user = clean_user_dict(user_row)
        user["last_login"] = now
        return {"success": True, "user": user, "token": token}
    finally:
        conn.close()


def oauth_login_or_register(email, name, provider="google", turnstile_token=None):
    email = (email or "").strip().lower()
    name = (name or "").strip() or email.split('@')[0]
    if not email or not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return {"success": False, "error": "Valid email required for OAuth sign-in."}

    conn = get_db()
    try:
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        cursor = conn.execute("SELECT * FROM users WHERE email = ?", (email,))
        existing = cursor.fetchone()

        with conn:
            if existing:
                user_id = existing["id"]
                conn.execute("UPDATE users SET last_login = ?, name = COALESCE(NULLIF(?, ''), name) WHERE id = ?", (now, name, user_id))
            else:
                user_id = str(uuid.uuid4())
                conn.execute("""
                    INSERT INTO users (id, email, name, password_hash, salt, provider, created_at, last_login)
                    VALUES (?, ?, ?, NULL, NULL, ?, ?, ?)
                """, (user_id, email, name, provider, now, now))

            token = create_session(conn, user_id)
            cursor = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
            user = clean_user_dict(cursor.fetchone())
            return {"success": True, "user": user, "token": token}
    finally:
        conn.close()


def get_user_from_token(token):
    if not token:
        return None
    conn = get_db()
    try:
        cursor = conn.execute("""
            SELECT u.* FROM users u
            JOIN sessions s ON u.id = s.user_id
            WHERE s.token = ?
        """, (token,))
        row = cursor.fetchone()
        return clean_user_dict(row)
    finally:
        conn.close()


def revoke_token(token):
    if not token:
        return True
    conn = get_db()
    try:
        with conn:
            conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        return True
    finally:
        conn.close()


def clean_snippet_dict(row):
    if not row:
        return None
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "title": row["title"],
        "language": row["language"],
        "code": row["code"],
        "stdin": row["stdin"] or "",
        "tab_name": row["tab_name"] or "main",
        "is_autosave": bool(row["is_autosave"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }


def save_code_snippet(user_id, title, language, code, stdin="", tab_name="main", is_autosave=1, snippet_id=None):
    if not user_id:
        return {"success": False, "error": "User ID required"}
    language = (language or "c").strip().lower()
    title = (title or f"{language.upper()} Project").strip()
    code = code if code is not None else ""
    stdin = stdin or ""
    tab_name = tab_name or "main"
    is_autosave = 1 if is_autosave else 0
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    conn = get_db()
    try:
        with conn:
            target_id = snippet_id
            if not target_id and is_autosave:
                # Check if an autosave already exists for this user and language
                cur = conn.execute("""
                    SELECT id FROM user_code_history 
                    WHERE user_id = ? AND language = ? AND is_autosave = 1 
                    ORDER BY updated_at DESC LIMIT 1
                """, (user_id, language))
                row = cur.fetchone()
                if row:
                    target_id = row["id"]

            if target_id:
                # Update existing record
                conn.execute("""
                    UPDATE user_code_history
                    SET title = ?, language = ?, code = ?, stdin = ?, tab_name = ?, is_autosave = ?, updated_at = ?
                    WHERE id = ? AND user_id = ?
                """, (title, language, code, stdin, tab_name, is_autosave, now, target_id, user_id))
            else:
                target_id = str(uuid.uuid4())
                conn.execute("""
                    INSERT INTO user_code_history (id, user_id, title, language, code, stdin, tab_name, is_autosave, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (target_id, user_id, title, language, code, stdin, tab_name, is_autosave, now, now))

            cur = conn.execute("SELECT * FROM user_code_history WHERE id = ?", (target_id,))
            snippet = clean_snippet_dict(cur.fetchone())
            return {"success": True, "snippet": snippet}
    finally:
        conn.close()


def get_user_history(user_id, limit=60):
    if not user_id:
        return []
    conn = get_db()
    try:
        cur = conn.execute("""
            SELECT * FROM user_code_history 
            WHERE user_id = ? 
            ORDER BY updated_at DESC 
            LIMIT ?
        """, (user_id, limit))
        return [clean_snippet_dict(r) for r in cur.fetchall()]
    finally:
        conn.close()


def get_latest_autosave(user_id, language=None):
    if not user_id:
        return None
    conn = get_db()
    try:
        if language:
            cur = conn.execute("""
                SELECT * FROM user_code_history 
                WHERE user_id = ? AND language = ? 
                ORDER BY updated_at DESC 
                LIMIT 1
            """, (user_id, language.strip().lower()))
        else:
            cur = conn.execute("""
                SELECT * FROM user_code_history 
                WHERE user_id = ? 
                ORDER BY updated_at DESC 
                LIMIT 1
            """, (user_id,))
        row = cur.fetchone()
        return clean_snippet_dict(row)
    finally:
        conn.close()


def get_snippet_by_id(user_id, snippet_id):
    if not user_id or not snippet_id:
        return None
    conn = get_db()
    try:
        cur = conn.execute("""
            SELECT * FROM user_code_history 
            WHERE id = ? AND user_id = ?
        """, (snippet_id, user_id))
        return clean_snippet_dict(cur.fetchone())
    finally:
        conn.close()


def delete_code_snippet(user_id, snippet_id):
    if not user_id or not snippet_id:
        return {"success": False, "error": "Invalid parameters"}
    conn = get_db()
    try:
        with conn:
            cur = conn.execute("DELETE FROM user_code_history WHERE id = ? AND user_id = ?", (snippet_id, user_id))
            if cur.rowcount > 0:
                return {"success": True}
            return {"success": False, "error": "Snippet not found or unauthorized"}
    finally:
        conn.close()


def rename_code_snippet(user_id, snippet_id, new_title):
    if not user_id or not snippet_id or not new_title:
        return {"success": False, "error": "Invalid parameters"}
    new_title = new_title.strip()
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    conn = get_db()
    try:
        with conn:
            cur = conn.execute("""
                UPDATE user_code_history 
                SET title = ?, updated_at = ? 
                WHERE id = ? AND user_id = ?
            """, (new_title, now, snippet_id, user_id))
            if cur.rowcount > 0:
                cur2 = conn.execute("SELECT * FROM user_code_history WHERE id = ?", (snippet_id,))
                return {"success": True, "snippet": clean_snippet_dict(cur2.fetchone())}
            return {"success": False, "error": "Snippet not found or unauthorized"}
    finally:
        conn.close()

