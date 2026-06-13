(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function setupNavigation() {
        var button = document.querySelector('.menu-button');
        var nav = document.querySelector('.site-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHeroCarousel() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var previous = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (slides.length === 0) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
        panels.forEach(function (panel) {
            var scopeId = panel.getAttribute('data-scope');
            var scope = scopeId ? document.getElementById(scopeId) : document;
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
            var input = panel.querySelector('.movie-search-input');
            var genre = panel.querySelector('.genre-filter');
            var year = panel.querySelector('.year-filter');
            var region = panel.querySelector('.region-filter');

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var genreValue = genre ? genre.value : '';
                var yearValue = year ? year.value : '';
                var regionValue = region ? region.value : '';
                cards.forEach(function (card) {
                    var searchable = (card.getAttribute('data-search') || '').toLowerCase();
                    var genreText = card.getAttribute('data-genre') || '';
                    var yearText = card.getAttribute('data-year') || '';
                    var regionText = card.getAttribute('data-region') || '';
                    var matched = true;
                    if (keyword && searchable.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (genreValue && genreText.indexOf(genreValue) === -1) {
                        matched = false;
                    }
                    if (yearValue && yearText !== yearValue) {
                        matched = false;
                    }
                    if (regionValue && regionText !== regionValue) {
                        matched = false;
                    }
                    card.style.display = matched ? '' : 'none';
                });
            }

            [input, genre, year, region].forEach(function (field) {
                if (field) {
                    field.addEventListener('input', apply);
                    field.addEventListener('change', apply);
                }
            });
        });
    }

    function setupBackTop() {
        var button = document.querySelector('.back-top');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 500);
        });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    window.initStaticPlayer = function (streamUrl) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.querySelector('.play-overlay');
        var hlsInstance = null;
        if (!video || !streamUrl) {
            return;
        }

        function attach() {
            if (video.getAttribute('data-ready') === 'yes') {
                return;
            }
            video.setAttribute('data-ready', 'yes');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.getAttribute('data-ready') !== 'yes') {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHeroCarousel();
        setupFilters();
        setupBackTop();
    });
}());
