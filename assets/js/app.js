const UI = {
    navToggle: document.querySelector('.menu-toggle'),
    navCollapse: document.getElementById('navbarContent'),
    mainContent: document.getElementById('main-content'),
    dropdowns: document.querySelectorAll('.dropdown'),
    searchForm: document.getElementById('search-form'),
    searchToggle: document.querySelector('.search-toggle'),
    searchClose: document.querySelector('.search-close'),
    langContainer: document.querySelector('.top-changelang'),
    langToggle: document.querySelector('.lang-toggle')
};

const SETTINGS = {
    breakpoint: 992,
    activeClass: 'open'
};


const updateInertState = (isOpen) => {
    const isMobile = window.innerWidth < SETTINGS.breakpoint;

    if (isMobile) {
        if (isOpen) {
            UI.navCollapse?.removeAttribute('inert');
            UI.mainContent?.setAttribute('inert', '');
            document.body.style.overflow = 'hidden';
        } else {
            UI.navCollapse?.setAttribute('inert', '');
            UI.mainContent?.removeAttribute('inert');
            document.body.style.overflow = '';
        }
    } else {
        UI.navCollapse?.removeAttribute('inert');
        UI.mainContent?.removeAttribute('inert');
        document.body.style.overflow = '';
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

        toggle?.addEventListener('click', (e) => {
            if (window.innerWidth < SETTINGS.breakpoint) {
                const isOpen = dropdown.classList.contains(SETTINGS.activeClass);
                dropdown.classList.toggle(SETTINGS.activeClass, !isOpen);
                toggle.setAttribute('aria-expanded', !isOpen);
            }
        });

        dropdown.addEventListener('mouseenter', () => {
            if (window.innerWidth >= SETTINGS.breakpoint) {
                dropdown.classList.add(SETTINGS.activeClass);
                toggle.setAttribute('aria-expanded', 'true');
            }
        });

        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth >= SETTINGS.breakpoint) {
                dropdown.classList.remove(SETTINGS.activeClass);
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
};

const initSearch = () => {
    const toggleSearch = (state) => {
        UI.searchForm?.classList.toggle(SETTINGS.activeClass, state);
        UI.searchToggle?.setAttribute('aria-expanded', state);
        if (state) UI.searchForm?.querySelector('input')?.focus();
    };

    UI.searchToggle?.addEventListener('click', () => toggleSearch(true));
    UI.searchClose?.addEventListener('click', () => toggleSearch(false));
};

const initLanguageSwitcher = () => {
    UI.langToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = UI.langContainer?.classList.toggle(SETTINGS.activeClass);
        UI.langToggle.setAttribute('aria-expanded', isOpen);
    });
};



document.addEventListener('DOMContentLoaded', () => {
    const expandBtn = document.querySelector('.video-expand-btn');
    const video = document.querySelector('.hero__video');

    if (expandBtn && video) {
        expandBtn.addEventListener('click', () => {
            video.muted = false;

            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen();
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }
        });
    }






    UI.navToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (e) => {
        if (UI.navCollapse?.classList.contains(SETTINGS.activeClass) &&
            !UI.navCollapse.contains(e.target) &&
            !UI.navToggle.contains(e.target)) {
            toggleMenu(false);
        }
        if (UI.langContainer?.classList.contains(SETTINGS.activeClass) &&
            !UI.langContainer.contains(e.target)) {
            UI.langContainer.classList.remove(SETTINGS.activeClass);
            UI.langToggle?.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleMenu(false);
            UI.searchForm?.classList.remove(SETTINGS.activeClass);
        }
    });

    window.addEventListener('resize', () => {
        const isDesktop = window.innerWidth >= SETTINGS.breakpoint;
        if (isDesktop) {
            toggleMenu(false);
        }
        updateInertState(UI.navCollapse?.classList.contains(SETTINGS.activeClass));
    });

    document.addEventListener('fullscreenchange', () => {
        const video = document.querySelector('.hero__video');

        if (!document.fullscreenElement) {
            video.muted = true;
        }
    });

    initDropdowns();
    initSearch();
    initLanguageSwitcher();
    updateInertState(false);

    if (typeof Swiper !== 'undefined') {
        new Swiper(".home-slider", {
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
        });
    }

});