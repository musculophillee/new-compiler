// Theme initialization — prevents flash of wrong theme
(function initTheme() {
    const validThemes = [
        'darryl-cream',
        'darryl-carbon'
    ];
    let saved = localStorage.getItem('codedex_theme') || 'darryl-cream';

    // Only allow white ('darryl-cream') and black ('darryl-carbon') themes
    if (!validThemes.includes(saved)) {
        saved = 'darryl-cream';
    }

    localStorage.setItem('codedex_theme', saved);
    document.documentElement.setAttribute('data-theme', saved);
})();
