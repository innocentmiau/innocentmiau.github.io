(function () {
  var field = document.querySelector('.starfield');
  if (!field) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var count = window.innerWidth < 600 ? 60 : 110;
  var narrow = window.innerWidth < 700;

  /* Everything below is added before the .star loop so the small stars,
     appended after, paint on top of the clouds and planets. */

  var fine = document.createElement('div');
  fine.className = 'neb-fine';
  field.appendChild(fine);

  // Placed deliberately rather than randomly: out in the margins, clear of
  // the centred content column.
  // spin is the surface's full rotation in seconds; clouds always outpace it.
  var planets = narrow
    ? [{ x: 88, y: 12, size: 70, spin: 190 }]
    : [{ x: 85, y: 15, size: 132, spin: 240 }, { x: 9, y: 80, size: 66, spin: 170 }];

  planets.forEach(function (p) {
    var el = document.createElement('div');
    el.className = 'planet';
    el.style.left = p.x + '%';
    el.style.top = p.y + '%';
    el.style.width = p.size + 'px';
    el.style.height = p.size + 'px';
    el.style.fontSize = p.size + 'px'; // em-based shadows scale with the planet

    var globe = document.createElement('div');
    globe.className = 'planet-globe';

    var land = document.createElement('div');
    land.className = 'planet-land';
    land.style.animationDuration = p.spin + 's';

    var clouds = document.createElement('div');
    clouds.className = 'planet-clouds';
    clouds.style.animationDuration = Math.round(p.spin / 2.4) + 's';

    globe.appendChild(land);
    globe.appendChild(clouds);

    var shade = document.createElement('div');
    shade.className = 'planet-shade';

    var rim = document.createElement('div');
    rim.className = 'planet-rim';

    el.appendChild(globe);
    el.appendChild(shade);
    el.appendChild(rim);
    field.appendChild(el);
  });

  var bright = narrow ? 4 : 9;
  for (var b = 0; b < bright; b++) {
    var big = document.createElement('div');
    big.className = 'star-bright';
    big.style.left = (4 + Math.random() * 92) + '%';
    big.style.top = (4 + Math.random() * 92) + '%';
    big.style.setProperty('--sb', (2 + Math.random() * 2.4).toFixed(2) + 'px');
    if (!reduceMotion) {
      big.style.setProperty('--dur', (5 + Math.random() * 6) + 's');
      big.style.setProperty('--delay', (Math.random() * 6) + 's');
      big.style.setProperty('--min-o', (0.45 + Math.random() * 0.2).toFixed(2));
      big.style.setProperty('--max-o', (0.85 + Math.random() * 0.15).toFixed(2));
    } else {
      big.style.animation = 'none';
      big.style.opacity = 0.75;
    }
    field.appendChild(big);
  }

  for (var i = 0; i < count; i++) {
    var star = document.createElement('div');
    star.className = 'star';

    var size = Math.random() * 1.6 + 0.6;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';

    if (!reduceMotion) {
      star.style.setProperty('--dur', (3 + Math.random() * 5) + 's');
      star.style.setProperty('--delay', (Math.random() * 5) + 's');
      star.style.setProperty('--min-o', (0.1 + Math.random() * 0.2).toFixed(2));
      star.style.setProperty('--max-o', (0.6 + Math.random() * 0.4).toFixed(2));
    } else {
      star.style.opacity = 0.4 + Math.random() * 0.3;
    }

    field.appendChild(star);
  }
})();

/* ---------- view modes: scroll / grid / list ----------
   Every .list-view on the site shares one mode, stored per visitor.
   The HTML ships with data-mode="scroll" already set, so the shelf
   layout still works with JavaScript disabled - only the arrows and
   the toggle itself are enhancements. */
(function () {
  var lists = [].slice.call(document.querySelectorAll('.list-view'));
  if (!lists.length) return;

  var STORE_KEY = 'preferredViewMode';
  var MODES = ['scroll', 'grid', 'list'];
  var LABELS = { scroll: 'Scroll', grid: 'Grid', list: 'List' };
  var smooth = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  var ICONS = {
    web: {
      label: 'Playable in browser',
      svg: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z"/></svg>'
    },
    windows: {
      label: 'Windows download',
      svg: '<svg viewBox="0 0 24 24" class="icon-solid"><path d="M3 5.7 10.2 4.7v6.6H3zM11.4 4.5 21 3.2v8.1h-9.6zM3 12.7h7.2v6.6L3 18.3zM11.4 12.7H21v8.1l-9.6-1.3z"/></svg>'
    },
    linux: {
      label: 'Linux download',
      svg: '<svg viewBox="0 0 24 24" class="icon-solid"><path d="M12 2.5c1.9 0 3.2 1.5 3.2 3.6 0 1.3.4 2.1 1.2 3.3 1.2 1.9 2.1 3.4 2.1 5.4 0 3-2.7 4.7-6.5 4.7s-6.5-1.7-6.5-4.7c0-2 .9-3.5 2.1-5.4.8-1.2 1.2-2 1.2-3.3C8.8 4 10.1 2.5 12 2.5zm-1.6 3.1a.85.85 0 1 0 0 1.7.85.85 0 0 0 0-1.7zm3.2 0a.85.85 0 1 0 0 1.7.85.85 0 0 0 0-1.7zM12 8.6c-.8 0-1.5.4-1.5.9s.7.8 1.5.8 1.5-.3 1.5-.8-.7-.9-1.5-.9z"/></svg>'
    },
    unity: {
      label: 'Unity package',
      svg: '<svg viewBox="0 0 24 24"><path d="M12 2.6 20.5 7.3v9.4L12 21.4 3.5 16.7V7.3z"/><path d="M12 12V2.6M12 12l8.5 4.7M12 12l-8.5 4.7"/></svg>'
    },
    github: {
      label: 'Source on GitHub',
      svg: '<svg viewBox="0 0 24 24" class="icon-solid"><path d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.3-1.3-3.3-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.4 4.6-4.6 4.9.3.3.7 1 .7 1.9v2.8c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2z"/></svg>'
    },
    itch: {
      label: 'On itch.io',
      svg: '<svg viewBox="0 0 24 24"><path d="M3.5 8.6 6 4.9h12l2.5 3.7v1.2a2.2 2.2 0 0 1-4.4 0 2.2 2.2 0 0 1-2.2 2.2h-3.8a2.2 2.2 0 0 1-2.2-2.2 2.2 2.2 0 0 1-4.4 0z"/><path d="M5.3 12.1v6.3c0 .5.4.8.9.8h11.6c.5 0 .9-.3.9-.8v-6.3"/><path d="M9.7 19.2v-3.5h4.6v3.5"/></svg>'
    }
  };

  function readStored() {
    try {
      var v = localStorage.getItem(STORE_KEY);
      return MODES.indexOf(v) > -1 ? v : null;
    } catch (e) { return null; }
  }

  function writeStored(mode) {
    try { localStorage.setItem(STORE_KEY, mode); } catch (e) { /* private mode */ }
  }

  /* Which icons a card earns is derived from what is already in its markup,
     so most cards need no new attributes. data-platforms adds the rest. */
  function iconsFor(card) {
    var names = [];
    function add(n) { if (ICONS[n] && names.indexOf(n) < 0) names.push(n); }

    if (card.querySelector('.badge-play')) add('web');

    var declared = (card.getAttribute('data-platforms') || '').split(/[\s,]+/);
    for (var i = 0; i < declared.length; i++) { if (declared[i]) add(declared[i]); }

    var link = card.querySelector('.card-link');
    var href = link ? link.getAttribute('href') || '' : '';
    if (href.indexOf('github.com') > -1) add('github');
    if (href.indexOf('itch.io') > -1) add('itch');

    return names;
  }

  function addIcons(card) {
    var names = iconsFor(card);
    if (!names.length) return;

    var wrap = document.createElement('span');
    wrap.className = 'card-icons';
    for (var i = 0; i < names.length; i++) {
      var icon = ICONS[names[i]];
      wrap.insertAdjacentHTML(
        'beforeend',
        '<span class="card-icon" data-tip="' + icon.label + '">' +
          icon.svg.replace('<svg', '<svg role="img" aria-label="' + icon.label + '"') +
        '</span>'
      );
    }
    card.appendChild(wrap);
  }

  var shelves = [];
  var current = readStored() || 'scroll';

  function updateEdges(entry) {
    var list = entry.list;
    if (current !== 'scroll') {
      entry.shelf.classList.remove('can-prev', 'can-next');
      entry.prev.disabled = true;
      entry.next.disabled = true;
      return;
    }
    var max = list.scrollWidth - list.clientWidth;
    var atStart = list.scrollLeft <= 2;
    var atEnd = list.scrollLeft >= max - 2;
    var scrollable = max > 4;

    entry.shelf.classList.toggle('can-prev', scrollable && !atStart);
    entry.shelf.classList.toggle('can-next', scrollable && !atEnd);
    entry.prev.disabled = !scrollable || atStart;
    entry.next.disabled = !scrollable || atEnd;
  }

  function makeArrow(dir, entry) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'shelf-arrow ' + (dir < 0 ? 'shelf-prev' : 'shelf-next');
    b.innerHTML = dir < 0 ? '&lsaquo;' : '&rsaquo;';
    b.setAttribute('aria-label', dir < 0 ? 'Scroll left' : 'Scroll right');
    b.addEventListener('click', function () {
      entry.list.scrollBy({ left: dir * entry.list.clientWidth * 0.8, behavior: smooth });
    });
    return b;
  }

  /* Rows only become expandable in list mode, so the button semantics are
     added and removed with the mode rather than left on permanently. */
  function syncCards(entry) {
    var cards = entry.cards;
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      if (current === 'list') {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-expanded', card.classList.contains('is-open') ? 'true' : 'false');
      } else {
        card.removeAttribute('tabindex');
        card.removeAttribute('role');
        card.removeAttribute('aria-expanded');
        card.classList.remove('is-open');
      }
    }
  }

  function toggleCard(card) {
    var open = card.classList.toggle('is-open');
    card.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function setMode(mode, persist) {
    if (MODES.indexOf(mode) < 0) return;
    current = mode;
    if (persist) writeStored(mode);

    for (var i = 0; i < shelves.length; i++) {
      var entry = shelves[i];
      entry.list.setAttribute('data-mode', mode);

      var buttons = entry.bar.querySelectorAll('button[data-view]');
      for (var b = 0; b < buttons.length; b++) {
        buttons[b].setAttribute('aria-pressed', buttons[b].getAttribute('data-view') === mode ? 'true' : 'false');
      }

      if (mode === 'scroll') entry.list.scrollLeft = 0;
      syncCards(entry);
      updateEdges(entry);
    }
  }

  function buildBar() {
    var bar = document.createElement('div');
    bar.className = 'view-bar';

    var group = document.createElement('div');
    group.className = 'view-toggle';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'View mode');

    for (var i = 0; i < MODES.length; i++) {
      (function (mode) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = LABELS[mode];
        b.setAttribute('data-view', mode);
        b.addEventListener('click', function () { setMode(mode, true); });
        group.appendChild(b);
      })(MODES[i]);
    }

    bar.appendChild(group);
    return bar;
  }

  lists.forEach(function (list) {
    var cards = [].slice.call(list.querySelectorAll(':scope > .card'));
    cards.forEach(addIcons);

    var shelf = document.createElement('div');
    shelf.className = 'shelf';
    list.parentNode.insertBefore(shelf, list);
    shelf.appendChild(list);

    var bar = buildBar();
    shelf.parentNode.insertBefore(bar, shelf);

    var entry = { list: list, shelf: shelf, bar: bar, cards: cards };
    entry.prev = makeArrow(-1, entry);
    entry.next = makeArrow(1, entry);
    shelf.appendChild(entry.prev);
    shelf.appendChild(entry.next);

    list.addEventListener('scroll', function () { updateEdges(entry); }, { passive: true });

    list.addEventListener('click', function (e) {
      if (current !== 'list') return;
      var card = e.target.closest('.card');
      if (!card || cards.indexOf(card) < 0) return;

      var link = e.target.closest('a');
      // The thumbnail is a link in grid mode; in list mode the row owns the click.
      if (link && !link.classList.contains('card-media')) return;
      if (link) e.preventDefault();
      toggleCard(card);
    });

    list.addEventListener('keydown', function (e) {
      if (current !== 'list') return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var card = e.target.closest('.card');
      if (!card || cards.indexOf(card) < 0 || e.target !== card) return;
      e.preventDefault();
      toggleCard(card);
    });

    shelves.push(entry);
  });

  window.addEventListener('resize', function () {
    for (var i = 0; i < shelves.length; i++) updateEdges(shelves[i]);
  });

  setMode(current, false);
})();
