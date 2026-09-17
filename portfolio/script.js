/* ============================================
   AL-FOLIO INSPIRED PORTFOLIO — JavaScript
   Clean, Minimal, Purposeful Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ===== Theme Toggle =====
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        updateThemeIcon(next);
    });

    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // ===== Reading Progress Bar =====
    const readingProgress = document.getElementById('readingProgress');

    function updateProgress() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
            readingProgress.style.width = ((scrollY / docHeight) * 100) + '%';
        }
    }

    // ===== Navbar Active Link =====
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section, .about-section');

    function updateActiveNav() {
        const scrollY = window.scrollY + 100;
        let currentId = '';

        sections.forEach(section => {
            if (scrollY >= section.offsetTop) {
                currentId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            const href = item.getAttribute('href');
            if (href === '#' + currentId) {
                item.classList.add('active');
            }
        });
    }

    // ===== Back to Top =====
    const backTop = document.getElementById('backTop');

    function updateBackTop() {
        backTop.classList.toggle('visible', window.scrollY > 400);
    }

    backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ===== Scroll handler (throttled) =====
    let ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateProgress();
                updateActiveNav();
                updateBackTop();
                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Init state

    // ===== Mobile Hamburger =====
    const hamburger = document.getElementById('navHamburger');
    const navMenu = document.getElementById('navMenu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('open');
    });

    // Close menu when clicking a link
    navMenu.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('open');
        });
    });

    // ===== Smooth Scroll =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 70;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ===== Scroll Reveal Animations =====
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ===== Skill Bar Animations =====
    const skillChips = document.querySelectorAll('.skill-chip');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    skillChips.forEach(chip => skillObserver.observe(chip));

    // ===== Contact Form =====
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector('.form-submit');
        const originalHTML = btn.innerHTML;

        btn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
        btn.style.background = '#059669';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.disabled = false;
            contactForm.reset();
        }, 3000);
    });

    // ===== Keyboard Navigation Enhancement =====
    document.addEventListener('keydown', (e) => {
        // Toggle theme with 't' key when not in input
        if (e.key === 't' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            themeToggle.click();
        }
    });

});
