import { useEffect, useRef } from 'react';
import './MagicBento.css';

// Effets de la MagicBento de React Bits (éclairage qui suit le curseur,
// bordure réactive, onde au clic, entrée en cascade) appliqués aux cartes
// existantes passées en children. Le rendu et la mise en page restent ceux de
// l'aperçu : seules les variables --bento-* sont animées sur chaque carte.

const SPOTLIGHT_MARGIN = 0.5;

const MagicBento = ({
  children,
  className = '',
  spotlightRadius = 300,
  enableBorderGlow = true,
  enableSpotlight = true,
  clickEffect = true,
  intro = true,
  disableAnimations = false,
}) => {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (disableAnimations || reduced.matches) return undefined;

    const cards = Array.from(root.children);
    if (!cards.length) return undefined;

    const states = cards.map(() => ({ hot: 0, written: {} }));
    const pointer = { x: -1e5, y: -1e5, inside: false };
    const light = { x: -1e5, y: -1e5, near: 0, ready: false };
    const wave = { x: 0, y: 0, t: -1, duration: 1.1, reach: 0 };

    let rects = [];
    let bounds = null;
    let dirty = true;
    let visible = false;
    let raf = 0;
    let last = 0;

    const measure = () => {
      dirty = false;
      bounds = root.getBoundingClientRect();
      rects = cards.map((card) => card.getBoundingClientRect());
    };

    // N'écrit une variable que si sa valeur a changé : le moteur tourne à
    // chaque frame, mais le style n'est recalculé que lorsque c'est utile.
    const write = (card, state, name, value) => {
      if (state.written[name] === value) return;
      state.written[name] = value;
      card.style.setProperty(name, value);
    };

    const frame = (now) => {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      if (dirty) measure();
      let busy = false;

      const margin = spotlightRadius * SPOTLIGHT_MARGIN;
      const near =
        pointer.inside &&
        bounds &&
        pointer.x > bounds.left - margin &&
        pointer.x < bounds.right + margin &&
        pointer.y > bounds.top - margin &&
        pointer.y < bounds.bottom + margin
          ? 1
          : 0;

      if (!light.ready && near) {
        light.x = pointer.x;
        light.y = pointer.y;
        light.ready = true;
      }

      const follow = 1 - Math.exp(-dt / 0.05);
      light.x += (pointer.x - light.x) * follow;
      light.y += (pointer.y - light.y) * follow;
      const fade = 1 - Math.exp(-dt / (near > light.near ? 0.12 : 0.4));
      light.near += (near - light.near) * fade;
      if (Math.abs(near - light.near) < 0.002) light.near = near;
      else busy = true;
      if (Math.abs(pointer.x - light.x) + Math.abs(pointer.y - light.y) > 0.3) busy = true;

      let waveRadius = 0;
      let waveAlpha = 0;
      if (wave.t >= 0) {
        wave.t += dt;
        const progress = Math.min(1, wave.t / wave.duration);
        waveRadius = wave.reach * (1 - Math.pow(1 - progress, 2.2));
        waveAlpha = Math.pow(1 - progress, 1.3);
        if (progress >= 1) {
          wave.t = -1;
          waveAlpha = 0;
        } else busy = true;
      }

      cards.forEach((card, index) => {
        const rect = rects[index];
        if (!rect) return;
        const state = states[index];
        const lx = light.x - rect.left;
        const ly = light.y - rect.top;
        const px = pointer.x - rect.left;
        const py = pointer.y - rect.top;
        const inside = pointer.inside && px >= 0 && py >= 0 && px <= rect.width && py <= rect.height;

        const hotTarget = inside && enableSpotlight ? 1 : 0;
        state.hot +=
          (hotTarget - state.hot) * (1 - Math.exp(-dt / (hotTarget > state.hot ? 0.14 : 0.32)));
        if (Math.abs(hotTarget - state.hot) < 0.002) state.hot = hotTarget;
        else busy = true;

        write(card, state, '--bento-x', `${lx.toFixed(1)}px`);
        write(card, state, '--bento-y', `${ly.toFixed(1)}px`);
        write(card, state, '--bento-hot', state.hot.toFixed(3));
        write(card, state, '--bento-near', (enableBorderGlow ? light.near : 0).toFixed(3));
        write(card, state, '--bento-wx', `${(wave.x - rect.left).toFixed(1)}px`);
        write(card, state, '--bento-wy', `${(wave.y - rect.top).toFixed(1)}px`);
        write(card, state, '--bento-wr', `${waveRadius.toFixed(1)}px`);
        write(card, state, '--bento-wa', waveAlpha.toFixed(3));
      });

      if (busy && visible) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    // Le moteur ne tourne que lorsque le curseur approche de la grille : le
    // reste du temps, aucune frame n'est demandée.
    const withinRange = () => {
      if (!bounds) return false;
      const margin = spotlightRadius * SPOTLIGHT_MARGIN;
      return (
        pointer.x > bounds.left - margin &&
        pointer.x < bounds.right + margin &&
        pointer.y > bounds.top - margin &&
        pointer.y < bounds.bottom + margin
      );
    };

    const onPointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (dirty) measure();
      const was = pointer.inside;
      pointer.inside = withinRange();
      // Entrée dans la zone : on cale la lumière sur le curseur pour éviter
      // un balayage depuis sa dernière position connue.
      if (pointer.inside && !was) {
        light.x = pointer.x;
        light.y = pointer.y;
        light.ready = true;
      }
      if (pointer.inside || was) wake();
    };

    const onPointerOut = (event) => {
      if (event.relatedTarget) return;
      pointer.inside = false;
      wake();
    };

    const onClick = (event) => {
      if (!clickEffect) return;
      if (dirty) measure();
      if (!bounds) return;
      wave.x = event.clientX;
      wave.y = event.clientY;
      wave.t = 0;
      wave.reach =
        Math.max(
          Math.hypot(wave.x - bounds.left, wave.y - bounds.top),
          Math.hypot(wave.x - bounds.right, wave.y - bounds.top),
          Math.hypot(wave.x - bounds.left, wave.y - bounds.bottom),
          Math.hypot(wave.x - bounds.right, wave.y - bounds.bottom)
        ) + 140;
      wake();
    };

    const onScroll = () => {
      dirty = true;
      wake();
    };

    const visibility = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible) {
        dirty = true;
        wake();
      }
    });
    visibility.observe(root);

    // Entrée en cascade : les cartes montent une à une au premier passage
    // dans le viewport (le CSS gère le décalage et le mouvement réduit).
    let gate = null;
    if (intro) {
      gate = new IntersectionObserver(
        (entries, observer) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          root.dataset.bentoIn = '';
        },
        { threshold: 0.15 }
      );
      gate.observe(root);
    } else {
      root.dataset.bentoIn = '';
    }

    const resizeObserver = new ResizeObserver(() => {
      dirty = true;
      wake();
    });
    resizeObserver.observe(root);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('pointerout', onPointerOut);
    root.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      gate?.disconnect();
      visibility.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('pointerout', onPointerOut);
      root.removeEventListener('click', onClick);
      delete root.dataset.bentoIn;
      cards.forEach((card) => {
        for (const name of [
          '--bento-x',
          '--bento-y',
          '--bento-hot',
          '--bento-near',
          '--bento-wx',
          '--bento-wy',
          '--bento-wr',
          '--bento-wa',
        ]) {
          card.style.removeProperty(name);
        }
      });
    };
  }, [
    clickEffect,
    disableAnimations,
    enableBorderGlow,
    enableSpotlight,
    intro,
    spotlightRadius,
  ]);

  return (
    <div
      ref={rootRef}
      className={`magic-bento ${className}`.trim()}
      data-intro={intro && !disableAnimations ? '' : undefined}
    >
      {children}
    </div>
  );
};

export default MagicBento;
