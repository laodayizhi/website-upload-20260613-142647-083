import { H as Hls } from './hls-vendor-dru42stk.js';

function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

function initMobileMenu() {
    const toggle = document.querySelector('[data-mobile-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
        return;
    }
    toggle.addEventListener('click', () => {
        panel.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
}

function initHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
        return;
    }
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
        return;
    }
    let active = 0;
    let timer = null;

    function show(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    }

    function start() {
        timer = window.setInterval(() => show(active + 1), 5200);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            window.clearInterval(timer);
            show(index);
            start();
        });
    });

    show(0);
    start();
}

function initVideoPlayers() {
    document.querySelectorAll('[data-player]').forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('.play-overlay');
        const src = video ? video.getAttribute('data-src') : '';
        let initialized = false;

        if (!video || !src) {
            return;
        }

        function attachSource() {
            if (initialized) {
                return;
            }
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (Hls && Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function play() {
            attachSource();
            if (button) {
                button.classList.add('is-hidden');
            }
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        video.addEventListener('click', attachSource, { once: true });
        video.addEventListener('play', () => {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
    });
}

function initFilters() {
    const page = document.querySelector('[data-filter-page]');
    if (!page) {
        return;
    }
    const input = page.querySelector('[data-filter-keyword]');
    const region = page.querySelector('[data-filter-region]');
    const type = page.querySelector('[data-filter-type]');
    const year = page.querySelector('[data-filter-year]');
    const count = page.querySelector('[data-result-count]');
    const cards = Array.from(page.querySelectorAll('[data-movie-card]'));
    const params = new URLSearchParams(window.location.search);
    const initialKeyword = params.get('q') || '';

    if (input && initialKeyword) {
        input.value = initialKeyword;
    }

    function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : '';
    }

    function applyFilter() {
        const keyword = valueOf(input);
        const regionValue = valueOf(region);
        const typeValue = valueOf(type);
        const yearValue = valueOf(year);
        let visible = 0;

        cards.forEach((card) => {
            const haystack = (card.getAttribute('data-search') || '').toLowerCase();
            const cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
            const cardType = (card.getAttribute('data-type') || '').toLowerCase();
            const cardYear = (card.getAttribute('data-year') || '').toLowerCase();
            const ok = (!keyword || haystack.includes(keyword))
                && (!regionValue || cardRegion.includes(regionValue))
                && (!typeValue || cardType.includes(typeValue))
                && (!yearValue || cardYear === yearValue);
            card.classList.toggle('hidden-card', !ok);
            if (ok) {
                visible += 1;
            }
        });

        if (count) {
            count.textContent = `共找到 ${visible} 部影片`;
        }
    }

    [input, region, type, year].forEach((element) => {
        if (!element) {
            return;
        }
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
    });

    applyFilter();
}

ready(() => {
    initMobileMenu();
    initHeroSlider();
    initVideoPlayers();
    initFilters();
});
