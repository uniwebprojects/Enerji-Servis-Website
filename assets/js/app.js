const UI = {
    navbar: document.querySelector('.navbar'),
    navToggle: document.querySelector('.menu-toggle'),
    navCollapse: document.getElementById('navbarCollapse'),
    navOverlay: document.querySelector('.nav-overlay'),
    mainContent: document.getElementById('main-content'),
    videoWrapper: document.querySelector('.about-main__video-wrapper'),
    video: document.querySelector('.about-main__video'),
    expandBtn: document.querySelector('.about-main__video-expand-btn'),
    navLinks: document.querySelectorAll('.nav-link'),
    animationLine: document.querySelector('.nav-line'),
    navParent: document.querySelector('.navbar-nav'),
};

const SETTINGS = {
    query: window.matchMedia("(min-width: 992px)"),
    active: 'open'
};

const updateInert = (open) => {
    const isDesktop = SETTINGS.query.matches;

    if (!isDesktop) {
        UI.navCollapse?.toggleAttribute('inert', !open);
        UI.mainContent?.toggleAttribute('inert', open);
        document.body.style.overflow = open ? 'hidden' : '';
        UI.navOverlay?.classList.toggle('active', open);
    } else {
        [UI.navCollapse, UI.mainContent].forEach(el => el?.removeAttribute('inert'));
        document.body.style.overflow = '';
        UI.navOverlay?.classList.toggle('active', false);
    }
};

const updateDropdown = (container, state, method = 'none') => {
    if (!container) return;
    const toggle = container.querySelector('.dropdown-toggle');
    container.classList.toggle(SETTINGS.active, state);
    toggle?.setAttribute('aria-expanded', state);
    container.dataset.method = state ? method : 'none';

    if (!state) {
        container.querySelectorAll('.dropdown').forEach(n => updateDropdown(n, false));
    }
};

const toggleMenu = (state) => {
    if (!UI.navCollapse) return;
    const isOpen = typeof state === 'boolean' ? state : !UI.navCollapse.classList.contains(SETTINGS.active);

    UI.navCollapse.classList.toggle(SETTINGS.active, isOpen);
    UI.navToggle?.classList.toggle(SETTINGS.active, isOpen);
    UI.navToggle?.setAttribute('aria-expanded', isOpen);

    if (!isOpen) {
        document.querySelectorAll(`.dropdown.${SETTINGS.active}`).forEach(d => updateDropdown(d, false));
    }

    updateInert(isOpen);
};

const initDropdowns = () => {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', (e) => {
            if (SETTINGS.query.matches) e.preventDefault();
            e.stopPropagation();

            const isOpen = dropdown.classList.contains(SETTINGS.active);
            const isManual = dropdown.dataset.method === 'click';

            if (isOpen && isManual) {
                updateDropdown(dropdown, false);
            } else {
                // Sibling management
                const parent = dropdown.parentElement.closest('.dropdown-menu') || document;
                parent.querySelectorAll(`:scope > .dropdown.${SETTINGS.active}, .dropdown.${SETTINGS.active}`).forEach(s => {
                    if (s !== dropdown) updateDropdown(s, false);
                });
                updateDropdown(dropdown, true, 'click');
            }
        });

        dropdown.addEventListener('mouseenter', () => {
            if (SETTINGS.query.matches && dropdown.dataset.method !== 'click') {
                updateDropdown(dropdown, true, 'hover');
            }
        });

        dropdown.addEventListener('mouseleave', () => {
            if (SETTINGS.query.matches && dropdown.dataset.method !== 'click') {
                updateDropdown(dropdown, false);
            }
        });
    });
};

const initNavLine = () => {
    if (!UI.animationLine || !UI.navParent) return;

    const move = (el) => {
        requestAnimationFrame(() => {
            const r = el.getBoundingClientRect();
            const p = UI.navParent.getBoundingClientRect();
            UI.animationLine.style.width = `${r.width}px`;
            UI.animationLine.style.left = `${r.left - p.left}px`;
        });
    };

    const reset = () => {
        const active = document.querySelector('.nav-link.active');
        if (active) move(active);
        else UI.animationLine.style.width = '0px';
    };

    UI.navLinks.forEach(l => {
        l.addEventListener('mouseenter', (e) => {
            if (!e.target.classList.contains('dropdown-item')) move(e.target);
        });
    });

    UI.navParent.addEventListener('mouseleave', reset);
    window.addEventListener('resize', reset, { passive: true });
    reset();
};

const initVideo = () => {
    if (UI.expandBtn && UI.video) {
        UI.expandBtn.addEventListener('click', () => {
            UI.video.muted = false;
            ['requestFullscreen', 'webkitRequestFullscreen', 'msRequestFullscreen'].some(m => UI.video[m] && (UI.video[m](), true));
            UI.video.style.objectFit = 'contain';
        });
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                UI.video.muted = true;
                UI.video.style.objectFit = 'cover';
            }
        });
    }

    const options = {
        root: null,
        rootMargin: '-100px 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                UI.video.currentTime = 0;

                const playPromise = UI.video.play();

                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                    });
                }
            } else {
                if (!UI.video.paused) {
                    UI.video.pause();
                }
            }
        });
    }, options);

    if (UI.videoWrapper) {
        observer.observe(UI.videoWrapper);
    }
}

const initMap = () => {

    const locations = {
        "map": [[40.3988998, 49.918191], "EnergyServis"],
    };


    Object.entries(locations).forEach(([mapId, mapInfo]) => {
        let myMap = new ymaps.Map(mapId, {
            center: mapInfo[0],
            zoom: 12,
            controls: ['zoomControl', 'fullscreenControl'],
        });

        if (window.innerWidth <= 1024) {
            myMap.behaviors.disable('scrollZoom');
            myMap.behaviors.disable('drag');
        }

        let myPlacemark = new ymaps.Placemark(mapInfo[0], {
            balloonContent: mapInfo[1],
            hintContent: 'EnergyServis'
        }, {
            iconLayout: 'default#image',
            iconImageHref: 'assets/images/location.png',
            iconImageSize: [90, 90],
            iconImageOffset: [-45, -90]
        });


        myMap.geoObjects.add(myPlacemark);
    })

}

const initProducts = () => {

}

document.addEventListener('DOMContentLoaded', () => {
    new Splide('.hero__slider', {
        rewind: true,
        autoplay: false,
        interval: 5000,
        speed: 300,
        pauseOnHover: false,
        arrows: true,
        pagination: true,
    }).mount();

    initDropdowns();
    initNavLine();
    updateInert(false);
    initVideo();
    initProducts();

    window.addEventListener('scroll', () => {
        UI.navbar?.classList.toggle('scrolled', window.scrollY > 300);
    }, { passive: true });

    UI.navToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (e) => {
        if (UI.navCollapse?.classList.contains(SETTINGS.active) && !UI.navCollapse.contains(e.target)) {
            toggleMenu(false);
        }
        document.querySelectorAll(`.dropdown.${SETTINGS.active}`).forEach(d => {
            if (!d.contains(e.target)) updateDropdown(d, false);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleMenu(false);
            document.querySelectorAll(`.dropdown.${SETTINGS.active}`).forEach(d => updateDropdown(d, false));
        }
    });

    SETTINGS.query.addEventListener('change', (e) => {
        if (e.matches) toggleMenu(false);
        updateInert(UI.navCollapse?.classList.contains(SETTINGS.active));
    });

    if (typeof ymaps !== "undefined") {
        ymaps.ready(initMap);
    }
});