// Theme initialization — prevents flash of wrong theme
(function initTheme() {
    const validThemes = [
        'darryl-cream',
        'darryl-carbon',
        'darryl-cyberpunk',
        'darryl-matrix',
        'darryl-bubblegum',
        'pixel-twilight',
        'pixel-botanical',
        'pixel-lofi',
        'pixel-sakura',
        'pixel-synthdusk'
    ];
    let saved = localStorage.getItem('codedex_theme') || 'darryl-cream';

    // Migrate any legacy themes to the Darryl signature theme
    const legacy = ['codedex-dark', 'codedex-meadow', 'codedex-dungeon', 'theme-gameboy', 'theme-synthwave', 'theme-lava', 'theme-lofi', 'theme-bubblegum', 'pixel-gameboy', 'pixel-nordic'];
    if (legacy.includes(saved) || !validThemes.includes(saved)) {
        saved = 'darryl-cream';
    }

    localStorage.setItem('codedex_theme', saved);
    document.documentElement.setAttribute('data-theme', saved);
})();
