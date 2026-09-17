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
});
