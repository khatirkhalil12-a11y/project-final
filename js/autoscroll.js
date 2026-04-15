/* autoscroll.js — scroll automatique simple, sans interférence avec les clics */
(function() {
  function init() {
    document.querySelectorAll('.horizontal-scroll').forEach(function(strip) {
      if (window.innerWidth <= 760) return;
      if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;

      strip.style.scrollSnapType = 'none';

      var dir = 1, raf = null, lastTs = 0;

      function tick(ts) {
        var max = strip.scrollWidth - strip.clientWidth;
        if (max <= 0) { raf = null; return; }
        var dt = lastTs ? Math.min(ts - lastTs, 60) : 16;
        lastTs = ts;
        var next = strip.scrollLeft + dir * dt * 0.05;
        if (next >= max) { next = max; dir = -1; }
        else if (next <= 0) { next = 0; dir = 1; }
        strip.scrollLeft = next;
        raf = requestAnimationFrame(tick);
      }

      function go()  { if (!raf) { lastTs = 0; raf = requestAnimationFrame(tick); } }
      function stop(){ if (raf) { cancelAnimationFrame(raf); raf = null; } }

      go();

      /* Pause au survol uniquement */
      strip.addEventListener('mouseenter', stop);
      strip.addEventListener('mouseleave', go);

      /* Pause si onglet caché */
      document.addEventListener('visibilitychange', function() {
        document.hidden ? stop() : go();
      });

      /* Reprendre après scroll molette */
      strip.addEventListener('wheel', function() {
        stop();
        setTimeout(go, 1500);
      }, { passive: true });
    });
  }

  if (document.readyState === 'complete') { init(); }
  else { window.addEventListener('load', init); }
})();
