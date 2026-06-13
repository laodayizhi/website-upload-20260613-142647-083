(function() {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (navButton && nav) {
    navButton.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-slide-dot]'));
    var prev = hero.querySelector('[data-slide-prev]');
    var next = hero.querySelector('[data-slide-next]');
    var index = 0;
    var timer = null;
    function show(target) {
      if (!slides.length) return;
      index = (target + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
    }
    if (prev) prev.addEventListener('click', function() { show(index - 1); start(); });
    if (next) next.addEventListener('click', function() { show(index + 1); start(); });
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() { show(i); start(); });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('.js-card'));
  var searchInput = document.querySelector('[data-search-input]');
  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var sortSelect = document.querySelector('[data-sort-select]');
  var emptyState = document.querySelector('[data-empty-state]');
  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }
  function cardVisible(card) {
    var query = normalize(searchInput ? searchInput.value : '');
    var searchText = normalize(card.getAttribute('data-search'));
    if (query && searchText.indexOf(query) === -1) return false;
    for (var i = 0; i < filters.length; i += 1) {
      var filter = filters[i];
      var key = filter.getAttribute('data-filter');
      var value = normalize(filter.value);
      if (value && normalize(card.getAttribute('data-' + key)) !== value) return false;
    }
    return true;
  }
  function applySearch() {
    if (!cards.length) return;
    var visible = 0;
    cards.forEach(function(card) {
      var showCard = cardVisible(card);
      card.style.display = showCard ? '' : 'none';
      if (showCard) visible += 1;
    });
    if (emptyState) emptyState.classList.toggle('is-visible', visible === 0);
  }
  function applySort() {
    if (!sortSelect || !cards.length) return;
    var mode = sortSelect.value;
    var groups = [];
    cards.forEach(function(card) {
      var parent = card.parentElement;
      if (parent && groups.indexOf(parent) === -1) groups.push(parent);
    });
    groups.forEach(function(parent) {
      var children = Array.prototype.slice.call(parent.children).filter(function(item) {
        return item.classList && item.classList.contains('js-card');
      });
      children.sort(function(a, b) {
        if (mode === 'year-desc') return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        if (mode === 'title-asc') return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-Hans-CN');
        return 0;
      });
      children.forEach(function(item) { parent.appendChild(item); });
    });
    applySearch();
  }
  if (searchInput) searchInput.addEventListener('input', applySearch);
  filters.forEach(function(filter) { filter.addEventListener('change', applySearch); });
  if (sortSelect) sortSelect.addEventListener('change', applySort);
  applySearch();
})();
