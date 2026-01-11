const UI = {
    navbar: document.querySelector('.navbar'),
    navToggle: document.querySelector('.menu-toggle'),
    navCollapse: document.getElementById('navbarCollapse'),
    mainContent: document.getElementById('main-content'),
    dropdowns: document.querySelectorAll('.dropdown'),
    langContainer: document.querySelector('.top-changelang'),
    langToggle: document.querySelector('.lang-toggle'),
    video: document.querySelector('.hero__video'),
    expandBtn: document.querySelector('.video-expand-btn'),
    navLinks: document.querySelectorAll('.nav-link'),
    animationLine: document.querySelector('.nav-line'),
    navParent: document.querySelector('.navbar-nav')
};

const SETTINGS = {
    breakpoint: 992,
    activeClass: 'open'
};

const updateInertState = (isOpen) => {
    const isMobile = window.innerWidth < SETTINGS.breakpoint;

    if (isMobile && isOpen) {
        UI.navCollapse?.removeAttribute('inert');
        UI.mainContent?.setAttribute('inert', '');
        document.body.style.overflow = 'hidden';
    } else {
        UI.navCollapse?.setAttribute('inert', '');
        UI.mainContent?.removeAttribute('inert');
        document.body.style.overflow = '';
        if (!isMobile) UI.navCollapse?.removeAttribute('inert');
    }
};

const toggleMenu = (forceState) => {
    if (!UI.navCollapse || !UI.navToggle) return;

    const isOpen = typeof forceState === 'boolean'
        ? forceState
        : !UI.navCollapse.classList.contains(SETTINGS.activeClass);

    UI.navCollapse.classList.toggle(SETTINGS.activeClass, isOpen);
    UI.navToggle.classList.toggle(SETTINGS.activeClass, isOpen);
    UI.navToggle.setAttribute('aria-expanded', isOpen);

    updateInertState(isOpen);
};

const initDropdowns = () => {
    UI.dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (!toggle) return;

        const updateState = (state) => {
            dropdown.classList.toggle('open', state);
            toggle.setAttribute('aria-expanded', state);
        };

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            updateState(!dropdown.classList.contains('open'));
        });

        toggle.addEventListener('focus', () => updateState(true));

        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth >= SETTINGS.breakpoint) updateState(false);
        });

        dropdown.addEventListener('focusout', (e) => {
            if (!dropdown.contains(e.relatedTarget)) updateState(false);
        });
    });
};

const initLanguageSwitcher = () => {
    UI.langToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = UI.langContainer?.classList.toggle(SETTINGS.activeClass);
        UI.langToggle.setAttribute('aria-expanded', !!isOpen);
    });
};

const initScrollNavbar = () => {
    window.addEventListener('scroll', () => {
        UI.navbar?.classList.toggle('scrolled', window.scrollY > 50);
    });
};

const initVideoLogic = () => {
    if (!UI.expandBtn || !UI.video) return;

    UI.expandBtn.addEventListener('click', () => {
        UI.video.muted = false;
        const methods = ['requestFullscreen', 'webkitRequestFullscreen', 'msRequestFullscreen'];
        const method = methods.find(m => UI.video[m]);
        if (method) UI.video[method]();
    });

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && UI.video) UI.video.muted = true;
    });
};

const initNavLine = () => {
    if (!UI.animationLine || !UI.navParent) return;

    const moveLine = (element) => {
        const linkRect = element.getBoundingClientRect();
        const parentRect = UI.navParent.getBoundingClientRect();
        UI.animationLine.style.width = `${linkRect.width}px`;
        UI.animationLine.style.left = `${linkRect.left - parentRect.left}px`;
    };

    const resetLine = () => {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            moveLine(activeLink);
        } else {
            UI.animationLine.style.width = '0px';
        }
    };

    UI.navLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            if (!e.target.classList.contains('dropdown-item')) {
                moveLine(e.target);
            }
        });
    });

    UI.navParent.addEventListener('mouseleave', () => {
        resetLine();
    });

    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) moveLine(activeLink);
};

document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    initLanguageSwitcher();
    initScrollNavbar();
    initVideoLogic();
    initNavLine();
    updateInertState(false);

    UI.navToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (e) => {
        if (UI.navCollapse?.classList.contains(SETTINGS.activeClass) &&
            !UI.navCollapse.contains(e.target) && !UI.navToggle.contains(e.target)) {
            toggleMenu(false);
        }
        if (UI.langContainer?.classList.contains(SETTINGS.activeClass) && !UI.langContainer.contains(e.target)) {
            UI.langContainer.classList.remove(SETTINGS.activeClass);
            UI.langToggle?.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleMenu(false);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= SETTINGS.breakpoint) toggleMenu(false);
        updateInertState(UI.navCollapse?.classList.contains(SETTINGS.activeClass));
    });
});