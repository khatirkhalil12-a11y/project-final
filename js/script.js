document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('[data-menu-btn]');
  const nav = document.querySelector('[data-mobile-nav]');
  if (btn && nav) {
    btn.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const form = document.querySelector('[data-ajax-form]');
  if (form) {
    const submitBtn = form.querySelector('[data-submit-btn]');
    const status = form.querySelector('[data-form-status]');
    const defaultBtnLabel = submitBtn ? submitBtn.textContent : '';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
      }
      if (status) {
        status.textContent = 'Envoi en cours...';
        status.className = 'form-status is-loading';
      }

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: new FormData(form),
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          window.location.href = form.dataset.successUrl || 'merci.html';
          return;
        }

        let message = 'Une erreur est survenue. Merci de réessayer.';
        try {
          const data = await response.json();
          if (data && Array.isArray(data.errors) && data.errors.length) {
            message = data.errors.map((item) => item.message).join(' ');
          }
        } catch (e) {}

        throw new Error(message);
      } catch (error) {
        if (status) {
          status.textContent = error.message || 'Une erreur est survenue. Merci de réessayer.';
          status.className = 'form-status is-error';
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = defaultBtnLabel;
        }
      }
    });
  }

  const revealTargets = document.querySelectorAll(`
    .hero-copy,
    .hero-visual,
    .offers-showcase,
    .offer-card,
    .section.soft .box-card,
    .section .custom-card,
    .final-cta,
    .contact-info,
    .contact-form,
    .price-card,
    .thank-you
  `);

  if ('IntersectionObserver' in window) {
    revealTargets.forEach((item, index) => {
      item.classList.add('reveal-on-scroll', `reveal-delay-${index % 4}`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((item) => observer.observe(item));
  } else {
    revealTargets.forEach((item) => item.classList.add('is-visible'));
  }

  const horizontalStrips = document.querySelectorAll('.horizontal-scroll');
  const desktopAutoScroll = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  horizontalStrips.forEach((strip) => {
    strip.classList.add('scroll-ready');

    if (!strip.dataset.scrollId) {
      strip.dataset.scrollId = Math.random().toString(36).slice(2, 10);
    }

    let hint = strip.parentElement ? strip.parentElement.querySelector(`.scroll-hint[data-for="${strip.dataset.scrollId}"]`) : null;
    if (!hint) {
      hint = document.createElement('div');
      hint.className = 'scroll-hint';
      hint.dataset.for = strip.dataset.scrollId;
      hint.textContent = 'Faites défiler horizontalement';
      strip.insertAdjacentElement('afterend', hint);
    }

    let autoDirection = 1;
    let autoFrame = null;
    let autoResumeTimeout = null;
    let isHovered = false;
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let lastTimestamp = 0;

    const canAutoScroll = () => (
      desktopAutoScroll.matches
      && !reducedMotion.matches
      && strip.classList.contains('is-scrollable')
      && !isHovered
      && !isDragging
      && !document.hidden
    );

    const refreshScrollState = () => {
      const canScroll = strip.scrollWidth > strip.clientWidth + 12;
      const maxScrollLeft = Math.max(0, strip.scrollWidth - strip.clientWidth);
      const nearEnd = strip.scrollLeft >= maxScrollLeft - 18;
      const hasMoved = strip.scrollLeft > 24;

      strip.classList.toggle('is-scrollable', canScroll);
      strip.classList.toggle('has-scroll-cue', canScroll && !hasMoved && !nearEnd);
      hint.classList.toggle('is-hidden', !canScroll || hasMoved || nearEnd);

      if (!canScroll) {
        stopAutoScroll();
      } else if (canAutoScroll()) {
        startAutoScroll();
      }
    };

    const stepAutoScroll = (timestamp) => {
      if (!canAutoScroll()) {
        stopAutoScroll();
        return;
      }

      if (!lastTimestamp) {
        lastTimestamp = timestamp;
      }

      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      const maxScrollLeft = Math.max(0, strip.scrollWidth - strip.clientWidth);
      if (maxScrollLeft <= 0) {
        stopAutoScroll();
        return;
      }

      const nextScrollLeft = strip.scrollLeft + autoDirection * elapsed * 0.05;

      if (nextScrollLeft >= maxScrollLeft) {
        strip.scrollLeft = maxScrollLeft;
        autoDirection = -1;
      } else if (nextScrollLeft <= 0) {
        strip.scrollLeft = 0;
        autoDirection = 1;
      } else {
        strip.scrollLeft = nextScrollLeft;
      }

      autoFrame = window.requestAnimationFrame(stepAutoScroll);
    };

    const startAutoScroll = () => {
      if (autoFrame || !canAutoScroll()) return;
      lastTimestamp = 0;
      autoFrame = window.requestAnimationFrame(stepAutoScroll);
    };

    const stopAutoScroll = () => {
      if (autoFrame) {
        window.cancelAnimationFrame(autoFrame);
        autoFrame = null;
      }
      lastTimestamp = 0;
    };

    const scheduleAutoResume = (delay = 1400) => {
      window.clearTimeout(autoResumeTimeout);
      autoResumeTimeout = window.setTimeout(() => {
        if (canAutoScroll()) startAutoScroll();
      }, delay);
    };

    refreshScrollState();
    window.addEventListener('resize', refreshScrollState);
    strip.addEventListener('scroll', refreshScrollState, { passive: true });

    if (typeof desktopAutoScroll.addEventListener === 'function') {
      desktopAutoScroll.addEventListener('change', refreshScrollState);
      reducedMotion.addEventListener('change', refreshScrollState);
    }

    const visibilityHandler = () => {
      if (document.hidden) {
        stopAutoScroll();
      } else {
        scheduleAutoResume(400);
      }
    };

    document.addEventListener('visibilitychange', visibilityHandler);

    if ('IntersectionObserver' in window) {
      const autoScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            scheduleAutoResume(600);
          } else {
            stopAutoScroll();
          }
        });
      }, { threshold: 0.45 });

      autoScrollObserver.observe(strip);
    } else {
      scheduleAutoResume(600);
    }

    strip.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoScroll();
    });

    strip.addEventListener('mouseleave', () => {
      isHovered = false;
      scheduleAutoResume();
    });

    strip.addEventListener('focusin', () => {
      stopAutoScroll();
    });

    strip.addEventListener('focusout', () => {
      scheduleAutoResume();
    });

    strip.addEventListener('wheel', (event) => {
      if (!strip.classList.contains('is-scrollable')) return;

      const dominantDelta = Math.abs(event.deltaY) > 0 ? event.deltaY : event.deltaX;
      if (Math.abs(dominantDelta) < 1) return;

      stopAutoScroll();
      scheduleAutoResume();
      event.preventDefault();

      const maxScrollLeft = Math.max(0, strip.scrollWidth - strip.clientWidth);
      const nextScrollLeft = Math.min(
        maxScrollLeft,
        Math.max(0, strip.scrollLeft + dominantDelta * 1.45)
      );

      strip.scrollLeft = nextScrollLeft;
    }, { passive: false });

    strip.addEventListener('pointerdown', (event) => {
      if (!strip.classList.contains('is-scrollable')) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      stopAutoScroll();
      isDragging = true;
      startX = event.clientX;
      startScrollLeft = strip.scrollLeft;
      /* NE PAS setPointerCapture ici — ça bloquerait les clics sur les liens */
    });

    strip.addEventListener('pointermove', (event) => {
      if (!isDragging) return;
      const deltaX = event.clientX - startX;
      /* Seulement capturer après 8px de mouvement réel */
      if (!strip.classList.contains('is-dragging') && Math.abs(deltaX) > 8) {
        strip.classList.add('is-dragging');
        try { strip.setPointerCapture(event.pointerId); } catch(e) {}
      }
      if (strip.classList.contains('is-dragging')) {
        strip.scrollLeft = startScrollLeft - deltaX;
      }
    });

    const stopDragging = (event) => {
      if (!isDragging) return;
      isDragging = false;
      strip.classList.remove('is-dragging');
      scheduleAutoResume();
      if (event && typeof event.pointerId !== 'undefined') {
        try {
          strip.releasePointerCapture(event.pointerId);
        } catch (e) {}
      }
    };

    strip.addEventListener('pointerup', stopDragging);
    strip.addEventListener('pointercancel', stopDragging);
    strip.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') stopDragging(event);
    });
  });
});
