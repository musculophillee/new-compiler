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

    const btnAuthGoogle = document.getElementById('btnAuthGoogle');
    const btnToggleEmailAuth = document.getElementById('btnToggleEmailAuth');
    const authEmailForm = document.getElementById('authEmailForm');
    const authEmailInput = document.getElementById('authEmailInput');
    const authNameInput = document.getElementById('authNameInput');
    const btnAuthGithub = document.getElementById('btnAuthGithub');

    const linkOpenUserAgreement = document.getElementById('linkOpenUserAgreement');
    const linkOpenPrivacyPolicy = document.getElementById('linkOpenPrivacyPolicy');
    const homeLinkTerms = document.getElementById('homeLinkTerms');
    const homeLinkPrivacy = document.getElementById('homeLinkPrivacy');
    const toast = document.getElementById('toast');

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

    function loginUser(userData) {
        currentUser = {
            ...userData,
            loggedInAt: new Date().toISOString()
        };
        localStorage.setItem('zero_compiler_user', JSON.stringify(currentUser));
        updateAuthUI();
        closeModal('modalAuth');
        showToast(`Welcome back, ${currentUser.name || 'Developer'}! 🚀`);
    }

    function logoutUser() {
        currentUser = null;
        localStorage.removeItem('zero_compiler_user');
        updateAuthUI();
        showToast('Signed out of Zero Compiler 👋');
    }

    if (btnOpenAuthHome) {
        btnOpenAuthHome.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal('modalAuth');
        });
    }

    if (btnHomeUserMenu) {
        btnHomeUserMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            if (homeUserDropdownMenu) homeUserDropdownMenu.classList.toggle('open');
        });
    }

    if (btnHomeLogout) {
        btnHomeLogout.addEventListener('click', () => {
            logoutUser();
        });
    }

    // Provider 1: Continue with Google
    if (btnAuthGoogle) {
        btnAuthGoogle.addEventListener('click', () => {
            const name = prompt('Sign in with Google - Enter your name or email:', currentUser ? currentUser.name : 'Ritik Soni');
            if (name && name.trim()) {
                const trimmed = name.trim();
                const email = trimmed.includes('@') ? trimmed : `${trimmed.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
                const cleanName = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
                loginUser({
                    provider: 'google',
                    name: cleanName,
                    email: email
                });
            }
        });
    }

    // Provider 2: Continue with Email
    if (btnToggleEmailAuth) {
        btnToggleEmailAuth.addEventListener('click', (e) => {
            e.stopPropagation();
            if (authEmailForm) {
                const isHidden = authEmailForm.style.display === 'none';
                authEmailForm.style.display = isHidden ? 'flex' : 'none';
                if (isHidden && authEmailInput) {
                    setTimeout(() => authEmailInput.focus(), 100);
                }
            }
        });
    }

    if (authEmailForm) {
        authEmailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = (authEmailInput.value || '').trim();
            const name = (authNameInput.value || '').trim() || email.split('@')[0];
            if (email) {
                loginUser({
                    provider: 'email',
                    name: name,
                    email: email
                });
            }
        });
    }

    // Provider 3: Continue with GitHub
    if (btnAuthGithub) {
        btnAuthGithub.addEventListener('click', () => {
            const githubUser = prompt('Sign in with GitHub - Enter your GitHub username:', 'musculophillee');
            if (githubUser && githubUser.trim()) {
                const cleanUser = githubUser.trim();
                loginUser({
                    provider: 'github',
                    name: cleanUser,
                    email: `${cleanUser}@users.noreply.github.com`
                });
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
        }
    });

    // Initialize Auth UI state on load
    updateAuthUI();
});
