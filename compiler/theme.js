// Theme initialization — prevents flash of wrong theme
(function initTheme() {
    const validThemes = [
        'pixel-twilight',
        'pixel-botanical',
        'pixel-lofi',
        'pixel-sakura',
        'pixel-synthdusk',
        'pixel-nordic',
        'pixel-gameboy'
    ];
    let saved = localStorage.getItem('codedex_theme') || 'pixel-twilight';
    // Legacy theme migrations
    if (saved === 'codedex-dark') saved = 'pixel-twilight';
    else if (saved === 'codedex-meadow') saved = 'pixel-sakura';
    else if (saved === 'codedex-dungeon') saved = 'pixel-synthdusk';
    else if (saved === 'theme-lofi') saved = 'pixel-lofi';
    else if (saved === 'theme-gameboy') saved = 'pixel-gameboy';
    else if (saved === 'theme-synthwave') saved = 'pixel-synthdusk';
    else if (saved === 'theme-lava') saved = 'pixel-lofi';
    else if (saved === 'theme-bubblegum') saved = 'pixel-sakura';

    if (!validThemes.includes(saved)) {
        saved = 'pixel-twilight';
    }
    localStorage.setItem('codedex_theme', saved);
    document.documentElement.setAttribute('data-theme', saved);
})();
