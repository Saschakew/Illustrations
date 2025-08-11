(function(){
  function randNorm() {
    // Box-Muller transform for Gaussian distribution (mean 0, std ~1)
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  function initScatterLoader() {
    const container = document.querySelector('#loading-screen .loader');
    if (!container) return;

    const w = container.clientWidth || 160;
    const h = container.clientHeight || 160;
    const cx = w / 2;
    const cy = h / 2;

    const DOTS = 56; // pleasant density
    const maxR = Math.min(w, h) * 0.45;

    for (let i = 0; i < DOTS; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot';

      // Scatter: bivariate normal for clustered look
      const x = randNorm() * 0.35; // ~35% of maxR std
      const y = randNorm() * 0.35;
      const px = cx + Math.max(-1, Math.min(1, x)) * maxR;
      const py = cy + Math.max(-1, Math.min(1, y)) * maxR;

      // Gentle motion deltas
      const tx = (Math.random() * 14 - 7).toFixed(2); // -7..7 px
      const ty = (Math.random() * 14 - 7).toFixed(2);

      // Size and timing variety
      const size = 4 + Math.random() * 4; // 4..8 px
      const dur = 2200 + Math.random() * 1400; // 2200..3600 ms
      const delay = -Math.random() * 1800; // negative to desync starts
      const alphaDelay = -Math.random() * 1200;

      dot.style.left = px + 'px';
      dot.style.top = py + 'px';
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.setProperty('--tx', tx + 'px');
      dot.style.setProperty('--ty', ty + 'px');
      dot.style.setProperty('--dur', dur + 'ms');
      dot.style.setProperty('--delay', delay + 'ms');
      dot.style.setProperty('--alphaDelay', alphaDelay + 'ms');

      // Slight color variation for depth (brand + end)
      if (Math.random() < 0.25) {
        dot.style.background = 'var(--brand-grad-end)';
        dot.style.opacity = '0.75';
      }

      container.appendChild(dot);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScatterLoader);
  } else {
    initScatterLoader();
  }
})();
