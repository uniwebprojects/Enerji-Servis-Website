const UI = {
    navbar: document.querySelector('.navbar'),
    navToggle: document.querySelector('.menu-toggle'),
    navCollapse: document.getElementById('navbarCollapse'),
    navOverlay: document.querySelector('.nav-overlay'),
    mainContent: document.getElementById('main-content'),
    video: document.querySelector('.hero__video'),
    expandBtn: document.querySelector('.video-expand-btn'),
    navLinks: document.querySelectorAll('.nav-link'),
    animationLine: document.querySelector('.nav-line'),
    navParent: document.querySelector('.navbar-nav'),
    langContainer: document.querySelector('.top-changelang'),
    langToggle: document.querySelector('.lang-toggle')
};

const SETTINGS = { breakpoint: 992, active: 'open' };

const updateInert = (open) => {
    const isMobile = window.innerWidth < SETTINGS.breakpoint;

    if (isMobile) {
        if (open) {
            UI.navCollapse?.removeAttribute('inert');
            UI.mainContent?.setAttribute('inert', '');
            document.body.style.overflow = 'hidden';
        } else {
            UI.navCollapse?.setAttribute('inert', '');
            UI.mainContent?.removeAttribute('inert');
            document.body.style.overflow = '';
        }

        UI.navOverlay?.classList.toggle('active', open);
    } else {
        UI.navCollapse?.removeAttribute('inert');
        UI.mainContent?.removeAttribute('inert');
        document.body.style.overflow = '';
        UI.navOverlay?.classList.toggle('active', false);
    }
};

const toggleMenu = (state) => {
    if (!UI.navCollapse) return;
    const isOpen = typeof state === 'boolean' ? state : !UI.navCollapse.classList.contains(SETTINGS.active);

    UI.navCollapse.classList.toggle(SETTINGS.active, isOpen);
    UI.navToggle?.classList.toggle(SETTINGS.active, isOpen);
    UI.navToggle?.setAttribute('aria-expanded', isOpen);

    if (!isOpen) {
        document.querySelectorAll('.dropdown').forEach(d => updateDropdown(d, false));
    }

    updateInert(isOpen);
};

const updateDropdown = (container, state) => {
    if (!container) return;
    const toggle = container.querySelector('.dropdown-toggle');
    container.classList.toggle(SETTINGS.active, state);
    toggle?.setAttribute('aria-expanded', state);

    if (!state) {
        container.querySelectorAll('.dropdown').forEach(n => updateDropdown(n, false));
    }
};

const initDropdowns = () => {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = dropdown.classList.contains(SETTINGS.active);

            const parentMenu = dropdown.parentElement.closest('.dropdown-menu');
            const siblings = parentMenu
                ? parentMenu.querySelectorAll(':scope > .dropdown')
                : document.querySelectorAll('.dropdown:not(.dropdown-submenu):not(.dropdown-menu .dropdown)');

            siblings.forEach(s => s !== dropdown && updateDropdown(s, false));
            updateDropdown(dropdown, !isOpen);
        });

        const handleHover = (state) => window.innerWidth >= SETTINGS.breakpoint && updateDropdown(dropdown, state);
        dropdown.addEventListener('mouseenter', () => handleHover(true));
        dropdown.addEventListener('mouseleave', () => handleHover(false));
    });
};

const initNavLine = () => {
    if (!UI.animationLine || !UI.navParent) return;
    const move = (el) => {
        const r = el.getBoundingClientRect(), p = UI.navParent.getBoundingClientRect();
        UI.animationLine.style.width = `${r.width}px`;
        UI.animationLine.style.left = `${r.left - p.left}px`;
    };
    const reset = () => {
        const active = document.querySelector('.nav-link.active');
        active ? move(active) : UI.animationLine.style.width = '0px';
    };
    UI.navLinks.forEach(l => l.addEventListener('mouseenter', (e) => !e.target.classList.contains('dropdown-item') && move(e.target)));
    UI.navParent.addEventListener('mouseleave', reset);
    reset();
};

document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    initNavLine();
    updateInert(false);

    window.addEventListener('scroll', () => UI.navbar?.classList.toggle('scrolled', window.scrollY > 300));

    if (UI.expandBtn && UI.video) {
        UI.expandBtn.addEventListener('click', () => {
            UI.video.muted = false;
            ['requestFullscreen', 'webkitRequestFullscreen', 'msRequestFullscreen'].some(m => UI.video[m] && (UI.video[m](), true));
        });
        document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) UI.video.muted = true; });
    }

    UI.navToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (e) => {
        if (UI.navCollapse?.classList.contains(SETTINGS.active) && !UI.navCollapse.contains(e.target)) {
            toggleMenu(false);
        }
        document.querySelectorAll('.dropdown').forEach(d => {
            if (!d.contains(e.target)) updateDropdown(d, false);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleMenu(false);
            document.querySelectorAll('.dropdown').forEach(d => updateDropdown(d, false));
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= SETTINGS.breakpoint) toggleMenu(false);
        updateInert(UI.navCollapse?.classList.contains(SETTINGS.active));
    });
});