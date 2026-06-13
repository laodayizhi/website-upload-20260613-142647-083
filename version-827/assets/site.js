(function () {
  function toggleMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHeroCarousel() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-hero-dot"));
        show(nextIndex);
        restart();
      });
    });

    start();
  }

  function initCategoryFilters() {
    var root = document.querySelector("[data-filter-root]");
    if (!root) {
      return;
    }
    var titleInput = root.querySelector("[data-filter-input]");
    var yearInput = root.querySelector("[data-year-filter]");
    var regionInput = root.querySelector("[data-region-filter]");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var title = normalize(titleInput && titleInput.value);
      var year = normalize(yearInput && yearInput.value);
      var region = normalize(regionInput && regionInput.value);

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category")
        ].join(" "));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var matched = true;

        if (title && text.indexOf(title) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (region && cardRegion.indexOf(region) === -1) {
          matched = false;
        }
        card.classList.toggle("hidden-card", !matched);
      });
    }

    [titleInput, yearInput, regionInput].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });
  }

  function createSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\" data-title=\"" + escapeHtml(item.title) + "\" data-year=\"" + escapeHtml(item.year) + "\" data-region=\"" + escapeHtml(item.region) + "\" data-genre=\"" + escapeHtml(item.genre) + "\">" +
      "<a href=\"" + escapeHtml(item.url) + "\">" +
      "<figure class=\"movie-poster\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span>" +
      "</figure>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta\">" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</div>" +
      "<h2>" + escapeHtml(item.title) + "</h2>" +
      "<p>" + escapeHtml(item.description) + "</p>" +
      "<div class=\"tag-row small-tags\">" + tags + "</div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.SEARCH_INDEX) {
      return;
    }
    var form = page.querySelector(".big-search");
    var input = page.querySelector("[data-search-box]");
    var results = page.querySelector("[data-search-results]");
    var title = page.querySelector("[data-search-title]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input) {
      input.value = initialQuery;
    }

    function search(query) {
      var words = String(query || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) {
        return window.SEARCH_INDEX.slice(0, 36);
      }
      return window.SEARCH_INDEX.filter(function (item) {
        var haystack = [
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.category,
          item.description,
          (item.tags || []).join(" ")
        ].join(" ").toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 80);
    }

    function render(query) {
      var matched = search(query);
      if (title) {
        title.textContent = query ? "搜索结果" : "精选影片";
      }
      if (results) {
        results.innerHTML = matched.map(createSearchCard).join("");
      }
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : "";
        var nextUrl = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
        window.history.replaceState(null, "", nextUrl);
        render(query);
      });
    }

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }

    render(initialQuery);
  }

  document.addEventListener("DOMContentLoaded", function () {
    toggleMobileMenu();
    initHeroCarousel();
    initCategoryFilters();
    initSearchPage();
  });
})();
