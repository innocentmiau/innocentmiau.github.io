/* ==========================================================================
   ICON LIBRARY - the one place icons are defined.

   Add an entry here and it becomes available everywhere at once: as a badge
   icon, as a card platform icon (data-platforms="..."), and as a news entry
   type in news.json.

     key    the name you refer to it by
     label  the accessible name, and the label shown on news entries
     match  extra spellings that resolve to this icon. Matching ignores case,
            spaces, dots and dashes, so "Play in browser", "playinbrowser"
            and "PLAY IN BROWSER" are all the same thing.
     svg    the markup. Outline icons inherit their colour automatically.
            Give solid shapes class="icon-solid" so they fill instead.

   Badges pick up icons in two ways:

     1. Automatically, when the badge text matches a key or a match entry.
        <span class="badge">Unity</span>          ->  (unity icon) Unity
        <span class="badge">Level design</span>   ->  Level design, unchanged

     2. Explicitly, with a %TOKEN% placeholder anywhere in the text. Use this
        when the label does not match the icon name.
        <span class="badge">%WINDOWS% Win64</span>  ->  (windows icon) Win64

   An unknown %TOKEN% is dropped rather than printed, so a typo degrades
   quietly instead of showing raw text on the page.
   ========================================================================== */

var SITE_ICONS = {

  /* ---- platforms and brands ---- */

  web: {
    label: 'Playable in browser',
    match: ['browser', 'html5', 'play in browser', 'playable in browser'],
    svg: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z"/></svg>'
  },

  windows: {
    label: 'Windows',
    match: ['win', 'win64'],
    svg: '<svg viewBox="0 0 24 24" class="icon-solid"><path d="M3 5.7 10.2 4.7v6.6H3zM11.4 4.5 21 3.2v8.1h-9.6zM3 12.7h7.2v6.6L3 18.3zM11.4 12.7H21v8.1l-9.6-1.3z"/></svg>'
  },

  linux: {
    label: 'Linux',
    svg: '<svg viewBox="0 0 24 24" class="icon-solid"><path d="M12 2.5c1.9 0 3.2 1.5 3.2 3.6 0 1.3.4 2.1 1.2 3.3 1.2 1.9 2.1 3.4 2.1 5.4 0 3-2.7 4.7-6.5 4.7s-6.5-1.7-6.5-4.7c0-2 .9-3.5 2.1-5.4.8-1.2 1.2-2 1.2-3.3C8.8 4 10.1 2.5 12 2.5zm-1.6 3.1a.85.85 0 1 0 0 1.7.85.85 0 0 0 0-1.7zm3.2 0a.85.85 0 1 0 0 1.7.85.85 0 0 0 0-1.7zM12 8.6c-.8 0-1.5.4-1.5.9s.7.8 1.5.8 1.5-.3 1.5-.8-.7-.9-1.5-.9z"/></svg>'
  },

  unity: {
    label: 'Unity',
    match: ['unity3d'],
    svg: '<svg viewBox="0 0 24 24"><path d="M12 2.6 20.5 7.3v9.4L12 21.4 3.5 16.7V7.3z"/><path d="M12 12V2.6M12 12l8.5 4.7M12 12l-8.5 4.7"/></svg>'
  },

  github: {
    label: 'GitHub',
    svg: '<svg viewBox="0 0 24 24" class="icon-solid"><path d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.3-1.3-3.3-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.4 4.6-4.6 4.9.3.3.7 1 .7 1.9v2.8c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2z"/></svg>'
  },

  itch: {
    label: 'itch.io',
    match: ['itchio'],
    svg: '<svg viewBox="0 0 24 24"><path d="M3.5 8.6 6 4.9h12l2.5 3.7v1.2a2.2 2.2 0 0 1-4.4 0 2.2 2.2 0 0 1-2.2 2.2h-3.8a2.2 2.2 0 0 1-2.2-2.2 2.2 2.2 0 0 1-4.4 0z"/><path d="M5.3 12.1v6.3c0 .5.4.8.9.8h11.6c.5 0 .9-.3.9-.8v-6.3"/><path d="M9.7 19.2v-3.5h4.6v3.5"/></svg>'
  },

  discord: {
    label: 'Discord',
    match: ['discord bot'],
    svg: '<svg viewBox="0 0 24 24" class="icon-solid"><path d="M18.9 6a14.4 14.4 0 0 0-3.6-1.1l-.2.4a13.2 13.2 0 0 1 3.2 1.6 15.3 15.3 0 0 0-12.6 0 13.2 13.2 0 0 1 3.2-1.6l-.2-.4A14.4 14.4 0 0 0 5.1 6C2.8 9.5 2.2 12.9 2.5 16.2a15.9 15.9 0 0 0 4.8 2.4l.9-1.4a10.3 10.3 0 0 1-1.6-.8l.4-.3a11.2 11.2 0 0 0 9.6 0l.4.3a10.3 10.3 0 0 1-1.6.8l.9 1.4a15.9 15.9 0 0 0 4.8-2.4c.4-3.8-.6-7.2-2.2-10.2zM9.2 14c-.9 0-1.7-.9-1.7-1.9s.7-1.9 1.7-1.9 1.7.9 1.7 1.9-.7 1.9-1.7 1.9zm5.6 0c-.9 0-1.7-.9-1.7-1.9s.7-1.9 1.7-1.9 1.7.9 1.7 1.9-.7 1.9-1.7 1.9z"/></svg>'
  },

  minecraft: {
    label: 'Minecraft',
    match: ['minecraft plugin'],
    svg: '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M3.5 9.6h17M9.2 3.5v6.1M14.8 3.5v6.1"/><path d="M6.8 13.2h3M13.4 16.3h3.4"/></svg>'
  },

  blender: {
    label: 'Blender',
    match: ['blender pipeline'],
    svg: '<svg viewBox="0 0 24 24"><circle cx="13.4" cy="13.8" r="6.3"/><circle cx="13.4" cy="13.8" r="2.2"/><path d="M3.2 9.9h7.3M3.2 9.9 9 6.2"/></svg>'
  },

  collab: {
    label: 'Collaboration',
    match: ['collaboration'],
    svg: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.4" r="3.2"/><path d="M3.2 19.4a5.8 5.8 0 0 1 11.6 0"/><path d="M16.2 5.6a3.2 3.2 0 0 1 0 5.6M17.5 14.2a5.8 5.8 0 0 1 3.3 5.2"/></svg>'
  },

  /* ---- news entry types, also usable as badge icons ---- */

  release: {
    label: 'Release',
    svg: '<svg viewBox="0 0 24 24"><path d="M21 8.4v7.2a1.4 1.4 0 0 1-.75 1.24l-7.5 3.9a1.6 1.6 0 0 1-1.5 0l-7.5-3.9A1.4 1.4 0 0 1 3 15.6V8.4a1.4 1.4 0 0 1 .75-1.24l7.5-3.9a1.6 1.6 0 0 1 1.5 0l7.5 3.9A1.4 1.4 0 0 1 21 8.4z"/><path d="M3.3 7.7 12 12.2l8.7-4.5M12 12.2V21"/></svg>'
  },

  tool: {
    label: 'Tool',
    match: ['editor tool', 'editor tools', 'pipeline tool'],
    svg: '<svg viewBox="0 0 24 24"><path d="M15.6 3.5a5.5 5.5 0 0 0-5 8.7L3.9 18.9a1.7 1.7 0 0 0 2.4 2.4l6.7-6.7a5.5 5.5 0 0 0 6.9-7.2l-3 3-2.4-2.4 3-3a5.5 5.5 0 0 0-1.9-1.5z"/></svg>'
  },

  game: {
    label: 'Game',
    svg: '<svg viewBox="0 0 24 24"><rect x="2.5" y="7" width="19" height="10.5" rx="4"/><path d="M7 10.5v3.5M5.25 12.25h3.5M15.6 11.4h.01M18 13.6h.01"/></svg>'
  },

  shader: {
    label: 'Shader',
    match: ['shaderlab', 'urp', 'hlsl'],
    svg: '<svg viewBox="0 0 24 24"><path d="m12 3 8.5 4.6L12 12.2 3.5 7.6z"/><path d="m3.5 12.2 8.5 4.6 8.5-4.6M3.5 16.4 12 21l8.5-4.6"/></svg>'
  },

  video: {
    label: 'Video',
    svg: '<svg viewBox="0 0 24 24"><rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="m10 9.2 5 2.8-5 2.8z"/></svg>'
  },

  jam: {
    label: 'Game jam',
    match: ['game jam'],
    svg: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M9.5 2.5h5M12 2.5v3"/></svg>'
  },

  post: {
    label: 'Post',
    svg: '<svg viewBox="0 0 24 24"><path d="M6 2.5h8l5 5v14H6z"/><path d="M14 2.5v5h5M9 12h6M9 15.5h6M9 8.5h2"/></svg>'
  },

  update: {
    label: 'Update',
    svg: '<svg viewBox="0 0 24 24"><path d="M20.5 12a8.5 8.5 0 1 1-2.5-6"/><path d="M20.5 4.5V10h-5.5"/></svg>'
  }

};

/* ---------- lookup and rendering helpers ---------- */

function normaliseIconName(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9#+]/g, '');
}

/* Built once from every key and every match spelling. */
var ICON_LOOKUP = (function () {
  var map = {};
  for (var key in SITE_ICONS) {
    if (!Object.prototype.hasOwnProperty.call(SITE_ICONS, key)) continue;
    map[normaliseIconName(key)] = key;
    var alt = SITE_ICONS[key].match || [];
    for (var i = 0; i < alt.length; i++) map[normaliseIconName(alt[i])] = key;
  }
  return map;
})();

function resolveIcon(text) {
  return ICON_LOOKUP[normaliseIconName(text)] || null;
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* aria-hidden because the badge text already says the same thing - without it
   a screen reader announces the label twice. */
function iconMarkup(key, cls) {
  var icon = SITE_ICONS[key];
  if (!icon) return '';
  return '<span class="' + (cls || 'tag-icon') + '" aria-hidden="true">' + icon.svg + '</span>';
}

/* Puts an icon in front of any .badge whose text names one, and swaps any
   %TOKEN% placeholder for its icon. Safe to call more than once: each badge
   is flagged when handled, so re-rendered content can be passed through
   again without doubling up. */
function decorateBadges(root) {
  var scope = root && root.querySelectorAll ? root : document;
  var badges = scope.querySelectorAll('.badge');

  for (var i = 0; i < badges.length; i++) {
    var badge = badges[i];
    if (badge.getAttribute('data-icon-done')) continue;
    badge.setAttribute('data-icon-done', '1');

    var text = badge.textContent;

    if (/%[^%\s]+%/.test(text)) {
      var html = '';
      var last = 0;
      var re = /%([^%\s]+)%/g;
      var m;
      while ((m = re.exec(text)) !== null) {
        html += escapeHtml(text.slice(last, m.index));
        var key = resolveIcon(m[1]);
        html += key ? iconMarkup(key) : '';
        last = m.index + m[0].length;
      }
      html += escapeHtml(text.slice(last));
      badge.innerHTML = html.trim();
      continue;
    }

    var auto = resolveIcon(text);
    if (auto) badge.innerHTML = iconMarkup(auto) + escapeHtml(text.trim());
  }
}

window.SITE_ICONS = SITE_ICONS;
window.decorateBadges = decorateBadges;
