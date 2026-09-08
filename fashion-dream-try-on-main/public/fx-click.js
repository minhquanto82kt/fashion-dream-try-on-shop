/* ==========================================================================
   fx-click.js — Hiệu ứng click toàn trang (SVG + JavaScript)
   --------------------------------------------------------------------------
   Cách dùng:
     <script src="/js/fx-click.js"></script>
     window.FXClick.init(); // hoặc để tự auto-init

   Cơ chế:
     - Tạo một <svg> fixed full-viewport, pointer-events: none, z-index 9999.
     - Mỗi sự kiện pointerdown: đọc tọa độ (clientX/Y), vẽ ngay tại chỗ:
         1. Flash: lưới pixel 4x4 bán trong suốt bùng nổ.
         2. Ring: vòng tròn gold (và orange, lệch pha) giãn nở.
         3. Pixels: 12 mảnh pixel vuông bay tứ phía theo vector ngẫu nhiên.
     - Mọi node tự xoá sau khi animation kết thúc (không rò rỉ DOM).
     - Tôn trọng prefers-reduced-motion.
   ========================================================================== */
(function (global) {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var overlay = null;
  var reduceMotion = false;

  /* Bảng màu đồng bộ với styles.css */
  var COLORS = {
    ink:    '#1B1A17',
    gold:   '#F0A500',
    orange: '#E45826',
    cream:  '#E6D5B8'
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

  /* Vòng tròn giãn nở */
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

  /* Mảnh pixel vuông bay ra */
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

  /* Flash lưới pixel 4x4 */
  function spawnFlash(x, y) {
    var g = el('g', { 'class': 'fx-flash', style: 'transform-origin:' + x + 'px ' + y + 'px' });
    var cell = 7, gap = 2;
    for (var i = -2; i < 2; i++) {
      for (var j = -2; j < 2; j++) {
        if (Math.abs(i) + Math.abs(j) > 2) continue; // hình thoi
        g.appendChild(el('rect', {
          x: x + i * (cell + gap), y: y + j * (cell + gap),
          width: cell, height: cell,
          fill: (i + j) % 2 === 0 ? COLORS.gold : COLORS.orange
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
    spawnRing(x, y, 0,   COLORS.gold,   '',        30);
    spawnRing(x, y, 70,  COLORS.orange, 'fx-ring--orange', 22);
    spawnRing(x, y, 130, COLORS.cream,  '',        16);

    var n = 12;
    for (var i = 0; i < n; i++) {
      var angle = (Math.PI * 2 * i) / n + Math.random() * 0.5;
      var dist  = 46 + Math.random() * 66;
      var size  = 5 + Math.random() * 6;
      var color = i % 3 === 0 ? COLORS.orange : (i % 3 === 1 ? COLORS.gold : COLORS.cream);
      spawnPixel(x, y, angle, dist, size, color, Math.random() * 60);
    }
  }

  function init() {
    reduceMotion = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    ensureOverlay();
    /* pointerdown bắt cả chuột lẫn cảm ứng */
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
  }

  function destroy() {
    document.removeEventListener('pointerdown', onPointerDown);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null;
  }

  global.FXClick = { init: init, destroy: destroy, colors: COLORS };

  /* Auto-init khi DOM sẵn sàng */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
