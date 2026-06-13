(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
            button.classList.toggle("open");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                var query = input.value.trim();
                if (!query) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                window.location.href = "search.html?q=" + encodeURIComponent(query);
            });
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var previous = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupCardFilters() {
        var list = document.querySelector("[data-filter-list]");
        if (!list) {
            return;
        }
        var input = document.querySelector("[data-card-filter]");
        var year = document.querySelector("[data-filter-year]");
        var type = document.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        function apply() {
            var keyword = normalize(input && input.value);
            var yearValue = normalize(year && year.value);
            var typeValue = normalize(type && type.value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-keywords"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }
                if (typeValue && cardType.indexOf(typeValue) === -1) {
                    matched = false;
                }
                card.classList.toggle("hidden", !matched);
            });
        }

        [input, year, type].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
    }

    function createSearchCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "" +
            "<a class=\"movie-card card-hover silver-border\" href=\"" + escapeHtml(movie.url) + "\">" +
            "<figure class=\"poster-frame\">" +
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + " 封面\" loading=\"lazy\">" +
            "<figcaption>" + escapeHtml(movie.displayCategory || movie.type || "影视") + "</figcaption>" +
            "</figure>" +
            "<div class=\"movie-card-body\">" +
            "<h3>" + escapeHtml(movie.title) + "</h3>" +
            "<p>" + escapeHtml(movie.oneLine || "") + "</p>" +
            "<div class=\"movie-meta-line\">" +
            "<span>" + escapeHtml(movie.year || "") + "</span>" +
            "<span>" + escapeHtml(movie.type || "") + "</span>" +
            "<span>" + escapeHtml(movie.region || "") + "</span>" +
            "</div>" +
            "<div class=\"tag-row\">" + tags + "</div>" +
            "</div>" +
            "</a>";
    }

    function escapeHtml(value) {
        return (value || "").toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");
        var input = document.querySelector("#search-page-input");
        if (!results || !summary || !input || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        input.value = initialQuery;

        function render(query) {
            var normalized = normalize(query);
            if (!normalized) {
                results.innerHTML = "";
                summary.textContent = "请输入关键词开始搜索。";
                return;
            }
            var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
                return normalize(movie.searchText).indexOf(normalized) !== -1;
            }).slice(0, 240);
            summary.textContent = "关键词 “" + query + "” 找到 " + matched.length + " 条结果" + (matched.length >= 240 ? "，已显示前 240 条。" : "。") ;
            results.innerHTML = matched.map(createSearchCard).join("\n");
        }

        render(initialQuery);

        input.addEventListener("input", function () {
            render(input.value.trim());
        });
    }

    function setupPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var button = player.querySelector("[data-player-start]");
            var video = player.querySelector("[data-video-element]");
            var status = player.querySelector("[data-player-status]");
            var hlsInstance = null;

            if (!button || !video) {
                return;
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function startPlayback() {
                var source = button.getAttribute("data-video-src");
                if (!source) {
                    setStatus("播放源暂不可用");
                    return;
                }

                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo(video, player, setStatus);
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            setStatus("播放加载异常，正在尝试直接播放");
                            video.src = source;
                            playVideo(video, player, setStatus);
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    playVideo(video, player, setStatus);
                } else {
                    video.src = source;
                    playVideo(video, player, setStatus);
                }
            }

            button.addEventListener("click", startPlayback);
            video.addEventListener("play", function () {
                player.classList.add("playing");
                setStatus("正在播放");
            });
            video.addEventListener("pause", function () {
                setStatus("已暂停");
            });
        });
    }

    function playVideo(video, player, setStatus) {
        var playPromise = video.play();
        player.classList.add("playing");
        setStatus("正在播放");
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                setStatus("请再次点击播放器开始播放");
            });
        }
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHeroSlider();
        setupCardFilters();
        setupSearchPage();
        setupPlayers();
    });
}());
