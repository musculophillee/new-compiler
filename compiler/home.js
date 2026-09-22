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

    // ===== 3.1 Interactive Hero Brand Logo (Tactile Pixels, 3D Parallax & Cyber Audio) =====
    const heroWrapper = document.getElementById('heroCenterpieceWrapper');
    const heroLogo = document.getElementById('heroInteractiveLogo');
    const pixelMark = document.getElementById('heroPixelMark');
    const pixelSquares = document.querySelectorAll('.hero-pixel-sq');
    const heroBrandBadge = document.getElementById('heroBrandBadge');
    const heroBrandTitle = document.getElementById('heroBrandTitle');
    const particleCanvas = document.getElementById('heroParticleCanvas');

    // Musical Notes
    const pixelNotes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 (A Major)
    const colorCycle = ['', 'active-lime', 'active-cyan', 'active-pink'];

    function playSynthTone(frequency, type = 'square', duration = 0.12, startGain = 0.05) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, ctx.currentTime);

            gain.gain.setValueAtTime(startGain, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio context safely ignored if restricted
        }
    }

    // Play 808 Sub-bass Drop
    function playBassDrop() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.35);

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) {}
    }

    // Canvas Particle Sparks System
    let particles = [];
    let pCtx = null;
    let animId = null;

    if (particleCanvas) {
        pCtx = particleCanvas.getContext('2d');
        particleCanvas.width = 800;
        particleCanvas.height = 260;

        class PixelSpark {
            constructor(x, y, color = null) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 5 + 3;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.life = 1;
                this.decay = Math.random() * 0.03 + 0.015;
                const palette = ['#d7ff3f', '#00f0ff', '#ff2e88', '#ffffff'];
                this.color = color || palette[Math.floor(Math.random() * palette.length)];
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += 0.08;
                this.vx *= 0.98;
                this.life -= this.decay;
            }
            draw(ctx) {
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.life);
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
                ctx.restore();
            }
        }

        function emitSparks(count = 25, originX = 400, originY = 130, color = null) {
            for (let i = 0; i < count; i++) {
                particles.push(new PixelSpark(originX, originY, color));
            }
            if (!animId) loopParticles();
        }

        function loopParticles() {
            if (!pCtx) return;
            pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw(pCtx);
                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                }
            }
            if (particles.length > 0) {
                animId = requestAnimationFrame(loopParticles);
            } else {
                animId = null;
            }
        }

        // Ambient gentle sparks occasionally
        setInterval(() => {
            if (particles.length < 5 && Math.random() > 0.4) {
                const rx = 350 + Math.random() * 100;
                const ry = 110 + Math.random() * 40;
                emitSparks(2, rx, ry);
            }
        }, 1200);
    }

    // 1. 3D Parallax Tilt with Mouse Tracking
    if (heroWrapper && heroLogo) {
        let isHovered = false;

        heroWrapper.addEventListener('mouseenter', () => { isHovered = true; });
        heroWrapper.addEventListener('mouseleave', () => {
            isHovered = false;
            heroLogo.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
        });

        heroWrapper.addEventListener('mousemove', (e) => {
            if (!isHovered) return;
            const rect = heroWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const tiltX = (y / (rect.height / 2)) * -9;
            const tiltY = (x / (rect.width / 2)) * 9;

            heroLogo.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(${x * 0.03}px, ${y * 0.03}px, 12px)`;
        });
    }

    // 2. Interactive Pixel Squares (Color Cycling + Note Synth + Sparks)
    if (pixelSquares.length > 0) {
        pixelSquares.forEach((sq, idx) => {
            let currentClassIdx = sq.classList.contains('active-lime') ? 1 : 0;

            sq.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                colorCycle.forEach(cls => { if (cls) sq.classList.remove(cls); });
                currentClassIdx = (currentClassIdx + 1) % colorCycle.length;
                if (colorCycle[currentClassIdx]) {
                    sq.classList.add(colorCycle[currentClassIdx]);
                }

                playSynthTone(pixelNotes[idx % pixelNotes.length], 'square', 0.14);

                if (particleCanvas && typeof emitSparks === 'function') {
                    const rect = particleCanvas.getBoundingClientRect();
                    const sqRect = sq.getBoundingClientRect();
                    const sparkX = sqRect.left + sqRect.width / 2 - rect.left;
                    const sparkY = sqRect.top + sqRect.height / 2 - rect.top;
                    emitSparks(14, sparkX, sparkY);
                }

                sq.style.transform = 'scale(0.85)';
                setTimeout(() => { sq.style.transform = ''; }, 120);
            });
        });
    }

    // 3. Kinetic Scatter & Snap Physics for Pixel Matrix
    if (pixelMark) {
        let isScattered = false;
        function triggerScatterBurst() {
            if (isScattered) return;
            isScattered = true;
            pixelMark.classList.add('scattered');
            playSynthTone(1200, 'sawtooth', 0.08, 0.06);

            if (particleCanvas && typeof emitSparks === 'function') {
                const rect = particleCanvas.getBoundingClientRect();
                const pmRect = pixelMark.getBoundingClientRect();
                emitSparks(28, pmRect.left + pmRect.width / 2 - rect.left, pmRect.top + pmRect.height / 2 - rect.top);
            }

            setTimeout(() => {
                pixelMark.classList.remove('scattered');
                playSynthTone(587.33, 'triangle', 0.18, 0.05);
                isScattered = false;
            }, 360);
        }

        pixelMark.addEventListener('dblclick', (e) => {
            e.preventDefault();
            triggerScatterBurst();
        });
    }

    // 4. Cyber Scramble / Decoder on "Zero"
    if (heroBrandTitle) {
        const originalText = heroBrandTitle.dataset.value || 'Zero';
        const glyphs = '01ZΞRØX9#!⚡<>[]{}';
        let scrambleInterval = null;

        function runScramble() {
            let iteration = 0;
            clearInterval(scrambleInterval);
            heroBrandTitle.classList.add('glitching');

            scrambleInterval = setInterval(() => {
                heroBrandTitle.innerText = originalText
                    .split('')
                    .map((char, index) => {
                        if (index < iteration) return originalText[index];
                        return glyphs[Math.floor(Math.random() * glyphs.length)];
                    })
                    .join('');

                if (iteration >= originalText.length) {
                    clearInterval(scrambleInterval);
                    heroBrandTitle.classList.remove('glitching');
                    heroBrandTitle.innerText = originalText;
                }
                iteration += 1 / 3;
            }, 30);
        }

        heroBrandTitle.addEventListener('mouseenter', () => {
            runScramble();
            playSynthTone(750, 'sine', 0.05, 0.02);
        });

        heroBrandTitle.addEventListener('click', () => {
            playBassDrop();
            runScramble();
            if (particleCanvas && typeof emitSparks === 'function') {
                const rect = particleCanvas.getBoundingClientRect();
                const tRect = heroBrandTitle.getBoundingClientRect();
                emitSparks(30, tRect.left + tRect.width / 2 - rect.left, tRect.top + tRect.height / 2 - rect.top, '#d7ff3f');
            }
        });
    }

    // 5. Overclock Mode ("HYPER-DRIVE ⚡") on COMPILER Badge
    let isOverclocked = false;
    if (heroBrandBadge) {
        heroBrandBadge.addEventListener('click', (e) => {
            e.preventDefault();
            if (isOverclocked) return;
            isOverclocked = true;

            if (heroWrapper) heroWrapper.classList.add('overclocked');

            // Power-up triumphant cyber arpeggio
            const arpeggioNotes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 1046.50];
            arpeggioNotes.forEach((freq, idx) => {
                setTimeout(() => {
                    playSynthTone(freq, 'sawtooth', 0.18, 0.045);
                }, idx * 55);
            });

            // Big particle explosion
            if (particleCanvas && typeof emitSparks === 'function') {
                const rect = particleCanvas.getBoundingClientRect();
                const bRect = heroBrandBadge.getBoundingClientRect();
                emitSparks(60, bRect.left + bRect.width / 2 - rect.left, bRect.top + bRect.height / 2 - rect.top);
            }

            // Scatter and pulse pixels
            pixelSquares.forEach((sq, i) => {
                setTimeout(() => {
                    sq.style.transform = 'scale(1.3) rotate(25deg)';
                    setTimeout(() => { sq.style.transform = ''; }, 180);
                }, i * 75);
            });

            // Cool-down after 3.5s
            setTimeout(() => {
                if (heroWrapper) heroWrapper.classList.remove('overclocked');
                playSynthTone(220, 'sine', 0.35, 0.03);
                isOverclocked = false;
            }, 3500);
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

        if (window.google && window.google.accounts && window.google.accounts.id) {
            try {
                window.google.accounts.id.disableAutoSelect();
            } catch (e) {}
        }

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
            } catch (e) {}
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

    function getHomeRedirectUri() {
        return window.location.origin + '/';
    }

    async function getAuth0Client() {
        if (auth0Client) return auth0Client;

        // Wait up to 3.5s if SDK is still initializing
        if (typeof auth0 === 'undefined' || !auth0.createAuth0Client) {
            for (let i = 0; i < 35; i++) {
                if (typeof auth0 !== 'undefined' && auth0.createAuth0Client) break;
                await new Promise(r => setTimeout(r, 100));
            }
        }

        // If still missing, dynamically inject the local bundle or CDN fallback
        if (typeof auth0 === 'undefined' || !auth0.createAuth0Client) {
            await new Promise((resolve) => {
                const s = document.createElement('script');
                s.src = '/auth0-spa-js.production.js';
                s.onload = () => resolve();
                s.onerror = () => {
                    const fallback = document.createElement('script');
                    fallback.src = 'https://cdn.auth0.com/js/auth0-spa-js/2.1/auth0-spa-js.production.js';
                    fallback.onload = () => resolve();
                    fallback.onerror = () => resolve();
                    document.head.appendChild(fallback);
                };
                document.head.appendChild(s);
                setTimeout(resolve, 3000);
            });
        }

        if (typeof auth0 === 'undefined' || !auth0.createAuth0Client) {
            return null;
        }

        try {
            auth0Client = await auth0.createAuth0Client({
                domain: AUTH0_CONFIG.domain,
                clientId: AUTH0_CONFIG.clientId,
                authorizationParams: {
                    redirect_uri: getHomeRedirectUri()
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
                updateAuthUI();
                showToast(`Signed in with Auth0 as ${data.user.name}! 🚀`);
            } else {
                console.error('[Auth0 Sync] Server error:', data);
                openModal('modalAuth');
                showAuthAlert(data.error || 'Failed to authenticate with Auth0.');
            }
        } catch (err) {
            console.error('[Auth0 Sync Error]', err);
            openModal('modalAuth');
            showAuthAlert('Unable to sync Auth0 login with server.');
        }
    }

    async function checkAuth0Session() {
        const query = window.location.search;
        if (query.includes('error=')) {
            const params = new URLSearchParams(window.location.search);
            const errDesc = params.get('error_description') || params.get('error');
            console.error('[Auth0 Error]', errDesc);
            window.history.replaceState({}, document.title, window.location.pathname);
            showToast(`Sign-In: ${errDesc}`);
            openModal('modalAuth');
            showAuthAlert(`Sign-In Error: ${errDesc}`);
            return;
        }

        const client = await getAuth0Client();
        if (!client) return;

        if (query.includes('code=') && query.includes('state=')) {
            try {
                showToast('Finalizing secure sign-in... ⚡');
                await client.handleRedirectCallback();
                const user = await client.getUser();
                if (user) {
                    await syncAuth0User(user);
                    return;
                } else {
                    showToast('Could not load user profile from Auth0.');
                }
            } catch (err) {
                console.error('[Auth0 Callback Error]', err);
                const msg = err.message || String(err);
                if (msg.includes('Unauthorized') || msg.includes('access_denied')) {
                    showToast('Auth0 Error: Unauthorized (Check Token Auth Method in Auth0)');
                    openModal('modalAuth');
                    showAuthAlert('Auth0 Error: Unauthorized. In your Auth0 Dashboard > Applications > Settings, ensure Application Type is "Single Page App" or Token Endpoint Authentication Method is set to "None".');
                } else {
                    showToast(`Auth0 Error: ${msg}`);
                    openModal('modalAuth');
                    showAuthAlert(`Auth0 Error: ${msg}`);
                }
            } finally {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }

        try {
            const isAuth = await client.isAuthenticated();
            if (isAuth && !currentUser) {
                const user = await client.getUser();
                if (user) {
                    await syncAuth0User(user);
                }
            }
        } catch (e) {}
    }
    checkAuth0Session();

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
                await client.loginWithRedirect({
                    authorizationParams: {
                        redirect_uri: getHomeRedirectUri()
                    }
                });
            } catch (err) {
                showAuthAlert(`Auth0 Login Failed: ${err.message || err}`);
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
            btnElement.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Redirecting to ${serviceName}...</span>`;
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
            await client.loginWithRedirect({
                authorizationParams: {
                    connection: connectionName,
                    redirect_uri: getHomeRedirectUri()
                }
            });
        } catch (redirectErr) {
            console.error(`[Auth0 ${serviceName} error]`, redirectErr);
            showAuthAlert(`${serviceName} sign-in failed: ${redirectErr.message || redirectErr}`);
            showToast(`${serviceName} sign-in error`);
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
