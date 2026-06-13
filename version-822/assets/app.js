(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      var parent = img.closest('.poster, .hero-poster, .rank-row, .ranking-table-row, .side-poster-card');
      if (parent) {
        parent.classList.add('image-missing');
      }
    });
  });

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.SEARCH_INDEX) {
    var form = searchPage.querySelector('[data-filter-form]');
    var results = searchPage.querySelector('[data-search-results]');
    var count = searchPage.querySelector('[data-result-count]');
    var params = new URLSearchParams(window.location.search);

    ['q', 'type', 'region', 'genre'].forEach(function (name) {
      var field = form.elements[name];
      if (field && params.get(name)) {
        field.value = params.get(name);
      }
    });

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function card(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster" href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-shade"></span>',
        '    <span class="play-float"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg></span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="meta-line"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.year) + '</span><strong>' + escapeHtml(movie.rating) + '</strong></div>',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[char];
      });
    }

    function applySearch() {
      var q = normalize(form.elements.q.value);
      var type = form.elements.type.value;
      var region = form.elements.region.value;
      var genre = form.elements.genre.value;

      var matched = window.SEARCH_INDEX.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.type,
          movie.region,
          movie.genre,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' '));

        return (!q || haystack.indexOf(q) !== -1) &&
          (!type || movie.type === type) &&
          (!region || movie.region === region) &&
          (!genre || movie.genre === genre);
      });

      count.textContent = '找到 ' + matched.length + ' 部影片';
      results.innerHTML = matched.slice(0, 120).map(card).join('') || '<p class="empty-state">没有找到匹配影片，请尝试更换关键词或筛选条件。</p>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextParams = new URLSearchParams(new FormData(form));
      window.history.replaceState(null, '', 'search.html?' + nextParams.toString());
      applySearch();
    });

    form.addEventListener('input', applySearch);
    form.addEventListener('change', applySearch);
    applySearch();
  }
})();
