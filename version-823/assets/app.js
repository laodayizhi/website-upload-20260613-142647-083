(function () {
    var base = document.body.getAttribute("data-base") || "./";

    function resolveUrl(url) {
        if (!url) {
            return "#";
        }
        if (/^(https?:|mailto:|tel:|#)/.test(url)) {
            return url;
        }
        if (base === "../" && url.indexOf("../") !== 0) {
            return "../" + url;
        }
        return url;
    }

    function resolveAsset(file) {
        if (!file) {
            return "";
        }
        if (/^(https?:|data:)/.test(file)) {
            return file;
        }
        return base + file.replace(/^\.\//, "");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearch() {
        var inputs = document.querySelectorAll("[data-search-input]");
        var index = window.siteSearchIndex || [];
        inputs.forEach(function (input) {
            var box = input.parentElement.querySelector("[data-search-results]");
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                if (!query) {
                    box.classList.remove("is-open");
                    box.innerHTML = "";
                    return;
                }
                var words = query.split(/\s+/).filter(Boolean);
                var results = index.filter(function (item) {
                    var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(" ").toLowerCase();
                    return words.every(function (word) {
                        return haystack.indexOf(word) !== -1;
                    });
                }).slice(0, 10);
                if (!results.length) {
                    box.innerHTML = '<div class="search-empty">未找到匹配影片</div>';
                    box.classList.add("is-open");
                    return;
                }
                box.innerHTML = results.map(function (item) {
                    return '<a class="search-result-item" href="' + resolveUrl(item.url) + '">' +
                        '<img src="' + resolveAsset(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
                        '<span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</small></span>' +
                        '</a>';
                }).join("");
                box.classList.add("is-open");
            });
        });
        document.addEventListener("click", function (event) {
            if (!event.target.closest(".site-search")) {
                document.querySelectorAll("[data-search-results]").forEach(function (box) {
                    box.classList.remove("is-open");
                });
            }
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var grid = document.querySelector("[data-card-grid]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var input = document.querySelector("[data-filter-input]");
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-field]"));
        var reset = document.querySelector("[data-filter-reset]");
        var empty = document.querySelector("[data-filter-empty]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var query = normalize(input && input.value);
            var activeFilters = {};
            selects.forEach(function (select) {
                activeFilters[select.getAttribute("data-filter-field")] = normalize(select.value);
            });
            var visibleCount = 0;
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year, card.dataset.genre, card.textContent].join(" ").toLowerCase();
                var visible = !query || text.indexOf(query) !== -1;
                Object.keys(activeFilters).forEach(function (field) {
                    var value = activeFilters[field];
                    if (value && normalize(card.dataset[field]).indexOf(value) === -1) {
                        visible = false;
                    }
                });
                card.hidden = !visible;
                if (visible) {
                    visibleCount += 1;
                }
            });
            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                selects.forEach(function (select) {
                    select.value = "";
                });
                apply();
            });
        }
    }

    function setupDetailScroll() {
        var button = document.querySelector("[data-scroll-player]");
        var player = document.querySelector("[data-player]");
        if (!button || !player) {
            return;
        }
        button.addEventListener("click", function (event) {
            event.preventDefault();
            player.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupSearch();
        setupHero();
        setupFilters();
        setupDetailScroll();
    });
})();
