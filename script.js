(function () {
  var field = document.querySelector('.starfield');
  if (!field) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var count = window.innerWidth < 600 ? 60 : 110;

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
