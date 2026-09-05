/**
 * Liquid Glass — Apple-style liquid glass refraction effect.
 * Drop-in, no dependencies. Returns { supported, refresh, destroy }.
 *
 * @param {HTMLElement} el - Target element
 * @param {Object} opts - Configuration
 * @param {number} opts.scale - Refraction strength (default: -112, range: -180 to -40)
 * @param {number} opts.chroma - Chromatic fringe (default: 6)
 * @param {number} opts.border - Border inset for refraction (default: 12)
 * @param {number} opts.mapBlur - Displacement map blur (default: 20)
 * @param {number} opts.blur - Backdrop blur (default: 40)
 * @param {number} opts.saturate - Saturation boost (default: 1.5)
 * @param {number} opts.radius - Border radius (default: 24)
 * @param {number} opts.fallbackBlur - Fallback blur for non-Chromium (default: 30)
 */
export function liquidGlass(el, opts = {}) {
  const config = {
    scale: opts.scale ?? -112,
    chroma: opts.chroma ?? 6,
    border: opts.border ?? 12,
    mapBlur: opts.mapBlur ?? 20,
    blur: opts.blur ?? 40,
    saturate: opts.saturate ?? 1.5,
    radius: opts.radius ?? 24,
    fallbackBlur: opts.fallbackBlur ?? 30,
  };

  // Detect Chromium (refraction only works there)
  const isChromium = /chrome|chromium|edg/i.test(navigator.userAgent) && !/firefox|safari/i.test(navigator.userAgent);
  const supported = isChromium;

  const svgNS = 'http://www.w3.org/2000/svg';
  let filterEl = null;
  let svgEl = null;
  let observer = null;
  let destroyed = false;

  function createFilter() {
    // Remove old filter if any
    destroy();

    const w = el.offsetWidth || 400;
    const h = el.offsetHeight || 300;

    // Create SVG filter
    svgEl = document.createElementNS(svgNS, 'svg');
    svgEl.setAttribute('width', '0');
    svgEl.setAttribute('height', '0');
    svgEl.style.position = 'absolute';
    svgEl.style.pointerEvents = 'none';

    filterEl = document.createElementNS(svgNS, 'filter');
    const filterId = `lg-${Math.random().toString(36).slice(2, 8)}`;
    filterEl.setAttribute('id', filterId);
    filterEl.setAttribute('color-interpolation-filters', 'sRGB');
    filterEl.setAttribute('x', '-20%');
    filterEl.setAttribute('y', '-20%');
    filterEl.setAttribute('width', '140%');
    filterEl.setAttribute('height', '140%');

    if (supported) {
      // === Refraction pipeline ===

      // 1. Generate displacement map from the element's own shape
      // Source graphic → blur the map
      const feBlur = document.createElementNS(svgNS, 'feGaussianBlur');
      feBlur.setAttribute('in', 'SourceGraphic');
      feBlur.setAttribute('stdDeviation', String(config.mapBlur));
      feBlur.setAttribute('result', 'mapBlur');
      filterEl.appendChild(feBlur);

      // 2. Create rim-weighted displacement: edges bend more than center
      // Use feComponentTransfer to create a radial-like falloff
      const feOffset1 = document.createElementNS(svgNS, 'feOffset');
      feOffset1.setAttribute('in', 'mapBlur');
      feOffset1.setAttribute('dx', String(config.chroma));
      feOffset1.setAttribute('dy', String(Math.round(config.chroma * 0.5)));
      feOffset1.setAttribute('result', 'mapR');
      filterEl.appendChild(feOffset1);

      const feOffset2 = document.createElementNS(svgNS, 'feOffset');
      feOffset2.setAttribute('in', 'mapBlur');
      feOffset2.setAttribute('dx', String(-config.chroma));
      feOffset2.setAttribute('dy', String(-Math.round(config.chroma * 0.5)));
      feOffset2.setAttribute('result', 'mapB');
      filterEl.appendChild(feOffset2);

      // 3. Displace the backdrop content using the map
      // First, blur the backdrop for the glass effect
      const feBG = document.createElementNS(svgNS, 'feGaussianBlur');
      feBG.setAttribute('in', 'BackgroundImage');
      feBG.setAttribute('stdDeviation', String(config.blur));
      feBG.setAttribute('result', 'bgBlur');
      filterEl.appendChild(feBG);

      // 4. Saturate the blurred backdrop
      const feSaturate = document.createElementNS(svgNS, 'feColorMatrix');
      feSaturate.setAttribute('in', 'bgBlur');
      feSaturate.setAttribute('type', 'saturate');
      feSaturate.setAttribute('values', String(config.saturate));
      feSaturate.setAttribute('result', 'bgSaturate');
      filterEl.appendChild(feSaturate);

      // 5. Displace with the rim map (chromatic offset for fringe)
      const feDisplace = document.createElementNS(svgNS, 'feDisplacementMap');
      feDisplace.setAttribute('in', 'bgSaturate');
      feDisplace.setAttribute('in2', 'mapR');
      feDisplace.setAttribute('scale', String(config.scale));
      feDisplace.setAttribute('xChannelSelector', 'R');
      feDisplace.setAttribute('yChannelSelector', 'G');
      feDisplace.setAttribute('result', 'displaced');
      filterEl.appendChild(feDisplace);

      // 6. Composite the original source graphic on top (so text/content stays crisp)
      const feBlend = document.createElementNS(svgNS, 'feBlend');
      feBlend.setAttribute('in', 'displaced');
      feBlend.setAttribute('in2', 'SourceGraphic');
      feBlend.setAttribute('mode', 'normal');
      feBlend.setAttribute('result', 'blended');
      filterEl.appendChild(feBlend);

    } else {
      // === Fallback: frosted blur for Safari/Firefox ===
      const feBG = document.createElementNS(svgNS, 'feGaussianBlur');
      feBG.setAttribute('in', 'BackgroundImage');
      feBG.setAttribute('stdDeviation', String(config.fallbackBlur));
      feBG.setAttribute('result', 'bgBlur');
      filterEl.appendChild(feBG);

      const feSaturate = document.createElementNS(svgNS, 'feColorMatrix');
      feSaturate.setAttribute('in', 'bgBlur');
      feSaturate.setAttribute('type', 'saturate');
      feSaturate.setAttribute('values', String(config.saturate));
      feSaturate.setAttribute('result', 'bgSaturate');
      filterEl.appendChild(feSaturate);

      const feBlend = document.createElementNS(svgNS, 'feBlend');
      feBlend.setAttribute('in', 'bgSaturate');
      feBlend.setAttribute('in2', 'SourceGraphic');
      feBlend.setAttribute('mode', 'normal');
      filterEl.appendChild(feBlend);
    }

    svgEl.appendChild(filterEl);
    document.body.appendChild(svgEl);

    // Apply filter to element
    el.style.backdropFilter = 'none';
    el.style.WebkitBackdropFilter = 'none';
    el.style.filter = `url(#${filterId})`;
    el.classList.add('liquid-glass');

    return filterId;
  }

  function refresh() {
    if (!destroyed) {
      createFilter();
    }
  }

  function destroy() {
    destroyed = true;
    if (svgEl && svgEl.parentNode) {
      svgEl.parentNode.removeChild(svgEl);
    }
    svgEl = null;
    filterEl = null;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (el) {
      el.style.filter = '';
      el.classList.remove('liquid-glass');
    }
  }

  // Initial creation
  createFilter();

  // Auto-refresh when element resizes
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => {
      if (!destroyed) {
        refresh();
      }
    });
    observer.observe(el);
  }

  return { supported, refresh, destroy };
}
