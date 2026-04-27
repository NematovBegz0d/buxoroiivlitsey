/* ═══════════════════════════════════════════
   ICHKI ISHLAR AKADEMIK LITSEYI — main.js
════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── 1. SCROLL REVEAL ─────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  /* ─── 2. COUNTER ANIMATION (Hero stats) ── */
  function animateCounter(el, target, suffix = '', duration = 1800) {
    const start = performance.now();
    const isPercent = suffix === '%';

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(ease * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const nums = entry.target.querySelectorAll('.hero-stat-num');
        nums.forEach(num => {
          const raw = num.dataset.target;
          const suffix = num.dataset.suffix || '';
          const target = parseInt(raw, 10);
          animateCounter(num, target, suffix, 1800);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const statsBlock = document.querySelector('.hero-stats');
  if (statsBlock) statsObserver.observe(statsBlock);


  /* ─── 3. ACTIVE NAV HIGHLIGHT on scroll ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');

  if (navLinks.length > 0) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(sec => navObserver.observe(sec));
  }


  /* ─── 4. SMOOTH SCROLL for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });


  /* ─── 5. TIMELINE STAGGER on scroll ─────── */
  const tlObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.tl-item');
        items.forEach((item, i) => {
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, i * 180);
        });
        tlObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.timeline').forEach(tl => {
    tl.querySelectorAll('.tl-item').forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    tlObserver.observe(tl);
  });


  /* ─── 6. CARD TILT effect on mouse move ── */
  function applyTilt(cards, intensity = 6) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          `perspective(600px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.4s ease';
        setTimeout(() => { card.style.transition = ''; }, 400);
      });
    });
  }

  applyTilt(document.querySelectorAll('.togarak-item'), 5);
  applyTilt(document.querySelectorAll('.yutuq-card'), 4);


  /* ─── 7. GOLD DIVIDER PULSE on scroll ───── */
  const dividers = document.querySelectorAll('.gold-divider');
  const divObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '0.6';
        entry.target.style.transition = 'opacity 0.8s ease';
        setTimeout(() => {
          entry.target.style.opacity = '0.3';
        }, 800);
      }
    });
  }, { threshold: 1.0 });

  dividers.forEach(d => divObs.observe(d));


  /* ─── 8. SCROLL PROGRESS BAR ─────────────── */
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px;
    background: linear-gradient(to right, #c9a84c, #e8c97a);
    width: 0%; z-index: 9999;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }, { passive: true });


  /* ─── 9. BUGUN CARD stagger ──────────────── */
  const bugunObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.bugun-card');
        cards.forEach((card, i) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(30px)';
          card.style.transition = `opacity 0.5s ${i * 0.1}s ease, transform 0.5s ${i * 0.1}s ease`;
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        });
        bugunObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  const bugunGrid = document.querySelector('.bugun-cards');
  if (bugunGrid) bugunObs.observe(bugunGrid);


  /* ─── 10. YUTUQ CARD stagger ────────────── */
  const yutuqObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll('.yutuq-card');
        cards.forEach((card, i) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(24px)';
          card.style.transition = `opacity 0.5s ${i * 0.1}s ease, transform 0.5s ${i * 0.1}s ease`;
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        });
        yutuqObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  const yutuqGrid = document.querySelector('.yutuq-grid');
  if (yutuqGrid) yutuqObs.observe(yutuqGrid);

});