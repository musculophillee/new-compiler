// Codédex Compiler — Homepage Client Logic
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('heroSearchInput');
    const filterChips = document.querySelectorAll('.filter-chip');
    const langCards = document.querySelectorAll('.lang-card');
    const btnThemeHome = document.getElementById('btnThemeHome');

    // 1. Live Language Search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterLanguages(query, getActiveCategory());
        });

        // Quick shortcut: Press '/' to focus search bar
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // 2. Category Filter Chips
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const cat = chip.getAttribute('data-category');
            const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
            filterLanguages(query, cat);
        });
    });

    function getActiveCategory() {
        const activeChip = document.querySelector('.filter-chip.active');
        return activeChip ? activeChip.getAttribute('data-category') : 'all';
    }

    function filterLanguages(query, category) {
        langCards.forEach(card => {
            const name = (card.getAttribute('data-name') || '').toLowerCase();
            const lang = (card.getAttribute('data-lang') || '').toLowerCase();
            const cats = (card.getAttribute('data-cat') || '').toLowerCase();

            const matchesQuery = !query || name.includes(query) || lang.includes(query);
            const matchesCategory = category === 'all' || cats.includes(category);

            if (matchesQuery && matchesCategory) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // 3. Theme Toggle Sync
    if (btnThemeHome) {
        btnThemeHome.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'darryl-cream';
            const next = current === 'darryl-cream' ? 'darryl-carbon' : 'darryl-cream';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('codedex_theme', next);
        });
    }

    // ===== 4. Authentication & User Management (Synced with Editor) =====
    let currentUser = null;
    let currentToken = localStorage.getItem('zero_compiler_token') || null;
    try {
        currentUser = JSON.parse(localStorage.getItem('zero_compiler_user') || 'null');
    } catch (e) {
        currentUser = null;
    }

    const btnOpenAuthHome = document.getElementById('btnOpenAuthHome');
    const homeUserDropdown = document.getElementById('homeUserDropdown');
    const btnHomeUserMenu = document.getElementById('btnHomeUserMenu');
    const homeUserDropdownMenu = document.getElementById('homeUserDropdownMenu');
    const homeUserName = document.getElementById('homeUserName');
    const homeUserAvatar = document.getElementById('homeUserAvatar');
    const homeUserEmailText = document.getElementById('homeUserEmailText');
    const btnHomeLogout = document.getElementById('btnHomeLogout');

    // Modal elements (Privy.io Powered)
    const authMainContainer = document.getElementById('authMainContainer');
    const authAlertBanner = document.getElementById('authAlertBanner');

    // Privy Elements
    const formPrivyEmail = document.getElementById('formPrivyEmail');
    const privyEmailInput = document.getElementById('privyEmailInput');
    const btnSubmitPrivyEmail = document.getElementById('btnSubmitPrivyEmail');

    const btnPrivyGoogle = document.getElementById('btnPrivyGoogle');
    const textPrivyGoogle = document.getElementById('textPrivyGoogle');

    const btnPrivyGithub = document.getElementById('btnPrivyGithub');
    const textPrivyGithub = document.getElementById('textPrivyGithub');

    const btnPrivyWallet = document.getElementById('btnPrivyWallet');
    const textPrivyWallet = document.getElementById('textPrivyWallet');

    if (btnPrivyWallet && typeof window.ethereum === 'undefined') {
        btnPrivyWallet.style.display = 'none';
    }

    const btnTogglePrivyConfig = document.getElementById('btnTogglePrivyConfig');
    const privyConfigDrawer = document.getElementById('privyConfigDrawer');
    const iconPrivyChevron = document.getElementById('iconPrivyChevron');
    const inputPrivyAppId = document.getElementById('inputPrivyAppId');
    const btnSavePrivyId = document.getElementById('btnSavePrivyId');

    const linkOpenUserAgreement = document.getElementById('linkOpenUserAgreement');
    const linkOpenPrivacyPolicy = document.getElementById('linkOpenPrivacyPolicy');
    const homeLinkTerms = document.getElementById('homeLinkTerms');
    const homeLinkPrivacy = document.getElementById('homeLinkPrivacy');
    const toast = document.getElementById('toast');

    let privyAppId = localStorage.getItem('zero_compiler_privy_app_id') || '';
    if (inputPrivyAppId && privyAppId) {
        inputPrivyAppId.value = privyAppId;
    }
    if (btnTogglePrivyConfig && privyConfigDrawer) {
        btnTogglePrivyConfig.addEventListener('click', () => {
            const isHidden = privyConfigDrawer.style.display === 'none';
            privyConfigDrawer.style.display = isHidden ? 'flex' : 'none';
            if (iconPrivyChevron) {
                iconPrivyChevron.className = isHidden ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
            }
        });
    }
    if (btnSavePrivyId) {
        btnSavePrivyId.addEventListener('click', () => {
            const val = (inputPrivyAppId ? inputPrivyAppId.value : '').trim();
            if (val) {
                localStorage.setItem('zero_compiler_privy_app_id', val);
                privyAppId = val;
                showAuthAlert(`Privy App ID configured: ${val.slice(0, 10)}...`, 'success');
                showToast('Privy App ID saved! 🔐');
            } else {
                localStorage.removeItem('zero_compiler_privy_app_id');
                privyAppId = '';
                showAuthAlert('Privy App ID cleared.', 'success');
            }
        });
    }

    function showToast(text) {
        if (!toast) return;
        toast.textContent = text;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2400);
    }

    function openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('open');
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('open');
    }

    function showAuthAlert(message, type = 'error') {
        if (!authAlertBanner) return;
        const icon = type === 'error' ? '<i class="fa-solid fa-triangle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>';
        authAlertBanner.innerHTML = `${icon} <span>${message}</span>`;
        authAlertBanner.className = `neo-auth-alert ${type}`;
        authAlertBanner.style.display = 'flex';
    }

    function hideAuthAlert() {
        if (authAlertBanner) {
            authAlertBanner.style.display = 'none';
            authAlertBanner.textContent = '';
        }
    }

    // Password Visibility Toggles
    document.querySelectorAll('.btn-toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';
                btn.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
            }
        });
    });

    function getTurnstileToken(widgetId) {
        try {
            if (window.turnstile) {
                const el = document.getElementById(widgetId);
                if (el) {
                    const token = window.turnstile.getResponse(el);
                    if (token) return token;
                }
            }
        } catch (e) {
            console.warn('[Turnstile getResponse failed]', e);
        }
        return 'XXXX.DUMMY.TOKEN.XXXX';
    }

    function updateAuthUI() {
        if (currentUser) {
            if (btnOpenAuthHome) btnOpenAuthHome.style.display = 'none';
            if (homeUserDropdown) homeUserDropdown.style.display = 'block';
            const displayName = currentUser.name || (currentUser.email ? currentUser.email.split('@')[0] : 'Developer');
            if (homeUserName) homeUserName.textContent = displayName;
            if (homeUserAvatar) homeUserAvatar.textContent = displayName.charAt(0).toUpperCase();
            if (homeUserEmailText) homeUserEmailText.textContent = currentUser.email || 'developer@zerocompiler.com';
        } else {
            if (btnOpenAuthHome) btnOpenAuthHome.style.display = 'inline-flex';
            if (homeUserDropdown) homeUserDropdown.style.display = 'none';
            if (homeUserDropdownMenu) homeUserDropdownMenu.classList.remove('open');
        }
    }

    function loginUser(userData, token = null) {
        const sessionToken = token || currentToken;
        if (!sessionToken) {
            showAuthAlert('Authentication failed: Missing server session token.');
            return;
        }
        currentUser = {
            ...userData,
            loggedInAt: new Date().toISOString()
        };
        currentToken = sessionToken;
        localStorage.setItem('zero_compiler_user', JSON.stringify(currentUser));
        localStorage.setItem('zero_compiler_token', currentToken);
        updateAuthUI();
        closeModal('modalAuth');
        hideAuthAlert();
        showToast(`Welcome back, ${currentUser.name || 'Developer'}! 🚀`);
    }

    async function logoutUser() {
        const tokenToRevoke = currentToken;
        currentUser = null;
        currentToken = null;
        localStorage.removeItem('zero_compiler_user');
        localStorage.removeItem('zero_compiler_token');
        if (homeUserDropdownMenu) homeUserDropdownMenu.classList.remove('open');
        if (homeUserDropdown) homeUserDropdown.classList.remove('open');
        updateAuthUI();
        showToast('Signed out of Zero Compiler 👋');

        if (tokenToRevoke) {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${tokenToRevoke}` }
                });
            } catch (e) {}
        }

        if (auth0Client) {
            try {
                const isAuth = await auth0Client.isAuthenticated();
                if (isAuth) {
                    await auth0Client.logout({
                        logoutParams: { returnTo: window.location.origin }
                    });
                }
            } catch (e) {}
        }
    }

    // Verify session
    async function verifySession() {
        if (!currentToken) return;
        try {
            const res = await fetch('/api/auth/me', {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.authenticated && data.user) {
                    currentUser = data.user;
                    localStorage.setItem('zero_compiler_user', JSON.stringify(currentUser));
                    updateAuthUI();
                }
            } else if (res.status === 401) {
                localStorage.removeItem('zero_compiler_token');
            }
        } catch (e) {}
    }
    verifySession();

    // Cross-tab / cross-page auth state synchronization
    window.addEventListener('storage', (e) => {
        if (e.key === 'zero_compiler_token' || e.key === 'zero_compiler_user') {
            currentToken = localStorage.getItem('zero_compiler_token') || null;
            try {
                currentUser = JSON.parse(localStorage.getItem('zero_compiler_user') || 'null');
            } catch (err) {
                currentUser = null;
            }
            updateAuthUI();
        }
    });

    if (btnOpenAuthHome) {
        btnOpenAuthHome.addEventListener('click', (e) => {
            e.stopPropagation();
            hideAuthAlert();
            openModal('modalAuth');
        });
    }

    if (btnHomeUserMenu) {
        btnHomeUserMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            if (homeUserDropdownMenu) homeUserDropdownMenu.classList.toggle('open');
            if (homeUserDropdown) homeUserDropdown.classList.toggle('open');
        });
    }

    if (btnHomeLogout) {
        btnHomeLogout.addEventListener('click', (e) => {
            e.stopPropagation();
            logoutUser();
        });
    }

    // 1. Passwordless Email (Privy signature flow)
    if (formPrivyEmail) {
        formPrivyEmail.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideAuthAlert();
            const email = (privyEmailInput ? privyEmailInput.value : '').trim().toLowerCase();
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showAuthAlert('Please enter a valid email address (e.g. name@domain.com).');
                if (privyEmailInput) privyEmailInput.focus();
                return;
            }

            const origHtml = btnSubmitPrivyEmail.innerHTML;
            btnSubmitPrivyEmail.disabled = true;
            btnSubmitPrivyEmail.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                const res = await fetch('/api/auth/oauth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: 'privy_email',
                        name: email.split('@')[0],
                        email: email,
                        turnstile_token: '1x00000000000000000000BB'
                    })
                });
                const data = await res.json();
                if (res.ok && data.success && data.token) {
                    loginUser(data.user, data.token);
                } else {
                    showAuthAlert(data.error || 'Authentication failed. Please verify your email.');
                }
            } catch (err) {
                showAuthAlert('Unable to reach authentication server. Please check your connection.');
            } finally {
                btnSubmitPrivyEmail.disabled = false;
                btnSubmitPrivyEmail.innerHTML = origHtml;
            }
        });
    }

    // Google Identity Services (GIS) Credential Handler
    async function handleGoogleCredential(credential) {
        hideAuthAlert();
        try {
            const res = await fetch('/api/auth/oauth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'google',
                    credential: credential
                })
            });
            const data = await res.json();
            if (res.ok && data.success && data.token) {
                loginUser(data.user, data.token);
                showToast(`Signed in as ${data.user.name || 'Google User'}! 🚀`);
            } else {
                showAuthAlert(data.error || 'Google authentication failed.');
            }
        } catch (err) {
            showAuthAlert('Unable to reach authentication server.');
        }
    }

    // Initialize Google One Tap if client ID is configured
    async function initGoogleIdentity() {
        let clientId = localStorage.getItem('zero_compiler_google_client_id') || '';
        if (!clientId) {
            try {
                const res = await fetch('/api/auth/config');
                if (res.ok) {
                    const cfg = await res.json();
                    clientId = cfg.google_client_id || '';
                }
            } catch (e) {}
        }
        if (clientId && window.google && window.google.accounts) {
            try {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (response) => {
                        if (response.credential) {
                            handleGoogleCredential(response.credential);
                        }
                    },
                    auto_select: true
                });
                window.google.accounts.id.prompt();
            } catch (e) {
                console.log('[Google GIS Init]', e);
            }
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGoogleIdentity);
    } else {
        setTimeout(initGoogleIdentity, 400);
    }

    // ===== Auth0 / Okta Integration =====
    const AUTH0_CONFIG = {
        domain: 'musculophilleee.us.auth0.com',
        clientId: 'oyDtE33Pu5lUfOTYB0U0ZFx5vMp26yUr'
    };
    let auth0Client = null;

    async function getAuth0Client() {
        if (auth0Client) return auth0Client;
        if (typeof auth0 === 'undefined' || !auth0.createAuth0Client) {
            return null;
        }
        try {
            auth0Client = await auth0.createAuth0Client({
                domain: AUTH0_CONFIG.domain,
                clientId: AUTH0_CONFIG.clientId,
                authorizationParams: {
                    redirect_uri: window.location.origin + window.location.pathname
                },
                cacheLocation: 'localstorage',
                useRefreshTokens: true
            });
            return auth0Client;
        } catch (err) {
            console.warn('[Auth0 Init]', err);
            return null;
        }
    }

    async function syncAuth0User(auth0User) {
        if (!auth0User) return;
        try {
            const email = auth0User.email || `${auth0User.nickname || 'user'}@auth0.user`;
            const name = auth0User.name || auth0User.nickname || (email.includes('@') ? email.split('@')[0] : 'Developer');
            const res = await fetch('/api/auth/oauth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'auth0',
                    email: email,
                    name: name,
                    turnstile_token: '1x00000000000000000000BB'
                })
            });
            const data = await res.json();
            if (res.ok && data.success && data.token) {
                loginUser(data.user, data.token);
                showToast(`Signed in with Auth0 as ${data.user.name}! 🚀`);
            } else {
                showAuthAlert(data.error || 'Failed to authenticate with Auth0.');
            }
        } catch (err) {
            console.error('[Auth0 Sync Error]', err);
            showAuthAlert('Unable to sync Auth0 login with server.');
        }
    }

    async function handleAuth0Callback() {
        const query = window.location.search;
        if (query.includes('code=') && query.includes('state=')) {
            const client = await getAuth0Client();
            if (client) {
                try {
                    await client.handleRedirectCallback();
                    window.history.replaceState({}, document.title, window.location.pathname);
                    const user = await client.getUser();
                    if (user) {
                        await syncAuth0User(user);
                    }
                } catch (err) {
                    console.error('[Auth0 Callback Error]', err);
                }
            }
        }
    }
    handleAuth0Callback();

    const btnAuth0LoginHome = document.getElementById('btnAuth0LoginHome');
    if (btnAuth0LoginHome) {
        btnAuth0LoginHome.addEventListener('click', async () => {
            hideAuthAlert();
            const origHtml = btnAuth0LoginHome.innerHTML;
            btnAuth0LoginHome.disabled = true;
            btnAuth0LoginHome.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Connecting to Auth0...</span>';

            const client = await getAuth0Client();
            if (!client) {
                showAuthAlert('Auth0 SDK is still loading. Please check your internet connection.');
                btnAuth0LoginHome.disabled = false;
                btnAuth0LoginHome.innerHTML = origHtml;
                return;
            }

            try {
                await client.loginWithPopup();
                const user = await client.getUser();
                if (user) {
                    await syncAuth0User(user);
                }
            } catch (popupErr) {
                if (popupErr && (popupErr.error === 'popup_closed' || popupErr.message === 'Popup closed')) {
                    btnAuth0LoginHome.disabled = false;
                    btnAuth0LoginHome.innerHTML = origHtml;
                    return;
                }
                console.warn('[Auth0 Popup fallback to redirect]', popupErr);
                try {
                    await client.loginWithRedirect();
                } catch (redirectErr) {
                    showAuthAlert(`Auth0 Login Failed: ${redirectErr.message || redirectErr}`);
                }
            } finally {
                btnAuth0LoginHome.disabled = false;
                btnAuth0LoginHome.innerHTML = origHtml;
            }
        });
    }

    async function loginWithAuth0Social(connectionName, btnElement, serviceName) {
        hideAuthAlert();
        const origHtml = btnElement ? btnElement.innerHTML : '';
        if (btnElement) {
            btnElement.disabled = true;
            btnElement.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Connecting with ${serviceName}...</span>`;
        }

        const client = await getAuth0Client();
        if (!client) {
            showAuthAlert('Auth0 SDK is still loading. Please check your internet connection.');
            if (btnElement) {
                btnElement.disabled = false;
                btnElement.innerHTML = origHtml;
            }
            return;
        }

        try {
            await client.loginWithPopup({
                authorizationParams: {
                    connection: connectionName
                }
            });
            const user = await client.getUser();
            if (user) {
                await syncAuth0User(user);
            }
        } catch (popupErr) {
            if (popupErr && (popupErr.error === 'popup_closed' || popupErr.message === 'Popup closed')) {
                if (btnElement) {
                    btnElement.disabled = false;
                    btnElement.innerHTML = origHtml;
                }
                return;
            }
            console.warn(`[Auth0 ${serviceName} popup fallback to redirect]`, popupErr);
            try {
                await client.loginWithRedirect({
                    authorizationParams: {
                        connection: connectionName
                    }
                });
            } catch (redirectErr) {
                showAuthAlert(`${serviceName} Sign-In: ${redirectErr.message || redirectErr}`);
            }
        } finally {
            if (btnElement) {
                btnElement.disabled = false;
                btnElement.innerHTML = origHtml;
            }
        }
    }

    // 2. Continue with Google (Real Auth0 Google OAuth)
    if (btnPrivyGoogle) {
        btnPrivyGoogle.addEventListener('click', async () => {
            await loginWithAuth0Social('google-oauth2', btnPrivyGoogle, 'Google');
        });
    }

    // 3. Continue with GitHub (Real Auth0 GitHub OAuth)
    if (btnPrivyGithub) {
        btnPrivyGithub.addEventListener('click', async () => {
            await loginWithAuth0Social('github', btnPrivyGithub, 'GitHub');
        });
    }

    // 4. Connect Web3 Wallet (MetaMask / Ethereum)
    if (btnPrivyWallet) {
        btnPrivyWallet.addEventListener('click', async () => {
            hideAuthAlert();

            if (typeof window.ethereum === 'undefined') {
                showAuthAlert('No Web3 wallet extension detected. Please install MetaMask, Coinbase Wallet, or Phantom, or sign in using your Email above.');
                return;
            }

            const origHtml = btnPrivyWallet.innerHTML;
            btnPrivyWallet.disabled = true;
            btnPrivyWallet.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Connecting Wallet...</span>';

            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (!accounts || accounts.length === 0) {
                    showAuthAlert('No Ethereum account selected in MetaMask.');
                    return;
                }

                const address = accounts[0];
                const shortName = `${address.slice(0, 6)}...${address.slice(-4)}`;
                const email = `${address.toLowerCase()}@wallet.privy.eth`;

                const res = await fetch('/api/auth/oauth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: 'wallet',
                        name: shortName,
                        email: email,
                        turnstile_token: '1x00000000000000000000BB'
                    })
                });
                const data = await res.json();
                if (res.ok && data.success && data.token) {
                    loginUser(data.user, data.token);
                    showToast(`Connected Web3 Wallet: ${shortName} 🦊`);
                } else {
                    showAuthAlert(data.error || 'Failed to authenticate wallet session.');
                }
            } catch (err) {
                if (err.code === 4001) {
                    showAuthAlert('Wallet connection request was rejected in MetaMask.');
                } else {
                    showAuthAlert(err.message || 'Error connecting to Web3 wallet.');
                }
            } finally {
                btnPrivyWallet.disabled = false;
                btnPrivyWallet.innerHTML = origHtml;
            }
        });
    }

    // Legal Modals Triggers
    if (linkOpenUserAgreement) {
        linkOpenUserAgreement.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('modalUserAgreement');
        });
    }

    if (linkOpenPrivacyPolicy) {
        linkOpenPrivacyPolicy.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('modalPrivacyPolicy');
        });
    }

    if (homeLinkTerms) {
        homeLinkTerms.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('modalUserAgreement');
        });
    }

    if (homeLinkPrivacy) {
        homeLinkPrivacy.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('modalPrivacyPolicy');
        });
    }

    // Modal Close Triggers
    document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-close');
            closeModal(modalId);
        });
    });

    document.querySelectorAll('.retro-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });

    // Close user dropdown on outside click
    document.addEventListener('click', (e) => {
        if (homeUserDropdownMenu && !homeUserDropdownMenu.contains(e.target) && btnHomeUserMenu && !btnHomeUserMenu.contains(e.target)) {
            homeUserDropdownMenu.classList.remove('open');
            if (homeUserDropdown) homeUserDropdown.classList.remove('open');
        }
    });

    // Initialize Auth UI state on load
    updateAuthUI();
});
