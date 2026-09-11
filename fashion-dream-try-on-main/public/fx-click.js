/* ========================================================================
   fx-click.js — Hiệu ứng click toàn trang (SVG + JavaScript)
   ======================================================================== */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var overlay = null;
  var reduceMotion = false;

  /* UPTHINK global palette */
  var COLORS = {
    olive:  '#2E2910',
    green:  '#2C5745',
    cream:  '#EBE3A7',
    orange: '#EB7D00',
    black:  '#0B0909'
  };

  function ensureOverlay() {
    if (overlay && document.body.contains(overlay)) return overlay;
    overlay = document.createElementNS(NS, 'svg');
    overlay.setAttribute('id', 'fx-click-overlay');
    overlay.setAttribute('width', '100%');
    overlay.setAttribute('height', '100%');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
    return overlay;
  }

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function spawnRing(x, y, delay, color, extraClass, r) {
    var ring = el('circle', {
      cx: x, cy: y, r: r || 26,
      'class': 'fx-ring' + (extraClass ? ' ' + extraClass : ''),
      'style': 'animation-delay:' + delay + 'ms;transform-origin:' + x + 'px ' + y + 'px'
    });
    ring.style.stroke = color;
    overlay.appendChild(ring);
    cleanup(ring, 900 + delay);
  }

  function spawnPixel(x, y, angle, dist, size, color, delay) {
    var dx = Math.cos(angle) * dist;
    var dy = Math.sin(angle) * dist;
    var p = el('rect', {
      x: x - size / 2, y: y - size / 2,
      width: size, height: size,
      'class': 'fx-pixel',
      fill: color,
      style: '--dx:' + dx.toFixed(1) + 'px;--dy:' + dy.toFixed(1) +
            'px;animation-delay:' + delay + 'ms;transform-origin:' + x + 'px ' + y + 'px'
    });
    overlay.appendChild(p);
    cleanup(p, 800 + delay);
  }

  function spawnFlash(x, y) {
    var g = el('g', { 'class': 'fx-flash', style: 'transform-origin:' + x + 'px ' + y + 'px' });
    var cell = 7, gap = 2;
    for (var i = -2; i < 2; i++) {
      for (var j = -2; j < 2; j++) {
        if (Math.abs(i) + Math.abs(j) > 2) continue;
        g.appendChild(el('rect', {
          x: x + i * (cell + gap), y: y + j * (cell + gap),
          width: cell, height: cell,
          fill: (i + j) % 2 === 0 ? COLORS.orange : COLORS.cream
        }));
      }
    }
    overlay.appendChild(g);
    cleanup(g, 450);
  }

  function cleanup(node, ms) {
    setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, ms);
  }

  function onPointerDown(e) {
    if (reduceMotion) return;
    ensureOverlay();
    var x = e.clientX, y = e.clientY;

    spawnFlash(x, y);
    spawnRing(x, y, 0,   COLORS.orange, '',             30);
    spawnRing(x, y, 70,  COLORS.green,  'fx-ring--green', 22);
    spawnRing(x, y, 130, COLORS.cream,  '',             16);

    var n = 12;
    for (var i = 0; i < n; i++) {
      var angle = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      var dist  = 46 + Math.random() * 66;
      var size  = 5 + Math.random() * 6;
      var color = i % 3 === 0 ? COLORS.orange : (i % 3 === 1 ? COLORS.cream : COLORS.green);
      spawnPixel(x, y, angle, dist, size, color, Math.random() * 60);
    }
  }

  function init() {
    reduceMotion = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ensureOverlay();
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
  }

  function destroy() {
    document.removeEventListener('pointerdown', onPointerDown);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  global.FXClick = { init: init, destroy: destroy, colors: COLORS };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
