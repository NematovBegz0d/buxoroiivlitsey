/* ═══════════════════════════════════════════════════════════════
   ICHKI ISHLAR AKADEMIK LITSEYI — main.js  (optimized bundle)
   info.js + news.js + script.js → birlashtirilgan va tuzatilgan
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── YORDAMCHI: bitta null-safe querySelector ──────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

/* ═══════════════════════════════════════════════════════════════
   1. UMUMIY ANIMATSIYA YORDAMCHISI  (easing bilan raqam sanash)
   Foydalanish: animateCounter(el, 500, '%', 1800)
═══════════════════════════════════════════════════════════════ */
function animateCounter(el, target, suffix = '', duration = 1800) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);          // cubic ease-out
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

/* ═══════════════════════════════════════════════════════════════
   2. NEWS — CSV yuklab, kartochka yaratish
═══════════════════════════════════════════════════════════════ */
const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/' +
  '2PACX-1vRfHK6AurseXzaleT3S6mlu3wEe0pCZNmiAwxLSLjk-41u4fivNsbZ8HgAPlnIGEy1O_JJKefpxvoXN' +
  '/pub?gid=0&single=true&output=csv';

function formatDate(str) {
  if (!str) return '';
  try {
    const d = new Date(str);
    if (isNaN(d)) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ''; }
}

function parseCSV(text) {
  const lines   = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].replace(/"/g, '').split(',').map(h => h.trim().toLowerCase());

  return lines.slice(1).map(line => {
    const values = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"')       { inQ = !inQ; }
      else if (ch === ',' && !inQ) { values.push(cur); cur = ''; }
      else                  { cur += ch; }
    }
    values.push(cur);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i] || '').replace(/^"|"$/g, '').trim(); });
    return obj;
  }).filter(r => r.timestamp && r.timestamp.length > 5);
}

/* Google Drive havolasini direct URL'ga aylantirish */
function toDirectImg(url) {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  return m ? `https://drive.google.com/uc?id=${m[1]}` : url;
}

function createNewsCard(item) {
  const card      = document.createElement('div');
  card.className  = 'news-card';
  const mediaType = (item.media_type || '').toLowerCase();
  const imgUrl    = item.image_url ? toDirectImg(item.image_url) : '';
  const dateStr   = formatDate(item.timestamp);

  let mediaHTML;
  if (mediaType === 'photo' && imgUrl) {
    mediaHTML = `
      <div class="news-card__media-wrap">
        <img class="news-card__media" src="${imgUrl}"
             alt="${item.title || 'Rasm'}" loading="lazy"
             onerror="this.style.display='none';
                      this.parentElement.innerHTML='<div class=\\'news-card__no-media\\'><i class=\\'fa-regular fa-newspaper\\'></i></div>';">
      </div>`;
  } else if (mediaType === 'video' && item.video_url) {
    mediaHTML = `
      <div class="news-card__video-wrap">
        <iframe src="${item.video_url}" frameborder="0" allowfullscreen allow="autoplay"></iframe>
      </div>`;
  } else {
    mediaHTML = `<div class="news-card__no-media"><i class="fa-regular fa-newspaper"></i></div>`;
  }

  card.innerHTML = `
    ${mediaHTML}
    <div class="news-card__body">
      <span class="news-card__badge"><i class="fas fa-graduation-cap"></i> TA'LIM</span>
      <h3 class="news-card__title">${item.title || ''}</h3>
      ${item.text ? `<p class="news-card__text">${item.text}</p>` : ''}
      <div class="news-card__footer">
        ${dateStr ? `<span class="news-card__date">${dateStr}</span>` : ''}
        <a href="https://t.me/iivbuxorolitsey" target="_blank" rel="noopener noreferrer"
           class="news-card__tg-btn">
          <i class="fab fa-telegram-plane"></i> Batafsil o'qish
        </a>
      </div>
    </div>`;
  return card;
}

/* ─── FIX: kartochkalar async yaratilgach animatsiya ishlatiladi ─ */
function applyNewsCardAnimation(cards) {
  if (!cards.length) return;
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.15}s`;
    obs.observe(card);
  });
}

async function loadNews() {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  try {
    const res  = await fetch(`${CSV_URL}&cachebust=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows   = parseCSV(await res.text());
    const latest = rows.slice(-3).reverse();

    grid.innerHTML = '';
    if (!latest.length) {
      grid.innerHTML = '<p class="news-error">Hozircha yangiliklar yo\'q.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    const newCards = latest.map(item => {
      const card = createNewsCard(item);
      fragment.appendChild(card);
      return card;
    });
    grid.appendChild(fragment);

    /* ─── animatsiyani kartochkalar DOM'ga tushgandan keyin qo'llash */
    requestAnimationFrame(() => applyNewsCardAnimation(newCards));

  } catch (err) {
    console.error('News load error:', err);
    grid.innerHTML = '<p class="news-error">Yangiliklar yuklanmadi. Keyinroq urinib ko\'ring.</p>';
  }
}

/* ═══════════════════════════════════════════════════════════════
   3. DOM TAYYOR — barcha UI mantiqi
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* ── 3.1  SCROLL REVEAL ────────────────────────────────────── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => revealObs.observe(el));

  /* ── 3.2  HERO STATS COUNTER (data-target + data-suffix) ───── */
  const statsBlock = $('.hero-stats');
  if (statsBlock) {
    const statsObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          $$('.hero-stat-num', e.target).forEach(num => {
            animateCounter(num, parseInt(num.dataset.target, 10), num.dataset.suffix || '', 1800);
          });
          statsObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    statsObs.observe(statsBlock);
  }

  /* ── 3.3  SECTION STATS COUNTER (.stat-number / data-target) ── */
  const statsSection = $('.stats-section');
  if (statsSection) {
    let animated = false;
    const secObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !animated) {
        animated = true;
        $$('.stat-number', statsSection).forEach(el => {
          animateCounter(el, parseInt(el.dataset.target, 10), '', 1800);
        });
        secObs.unobserve(statsSection);
      }
    }, { threshold: 0.3 });
    secObs.observe(statsSection);
  }

  /* ── 3.4  ACTIVE NAV HIGHLIGHT on scroll ───────────────────── */
  const navLinks = $$('.nav a[href^="#"]');
  if (navLinks.length) {
    const navObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('section[id]').forEach(sec => navObs.observe(sec));
  }

  /* ── 3.5  SMOOTH SCROLL ────────────────────────────────────── */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = $(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ── 3.6  TIMELINE STAGGER ─────────────────────────────────── */
  const tlObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        $$('.tl-item', e.target).forEach((item, i) => {
          setTimeout(() => {
            item.style.opacity   = '1';
            item.style.transform = 'translateX(0)';
          }, i * 180);
        });
        tlObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  $$('.timeline').forEach(tl => {
    $$('.tl-item', tl).forEach(item => {
      item.style.cssText += 'opacity:0;transform:translateX(-20px);transition:opacity .5s ease,transform .5s ease;';
    });
    tlObs.observe(tl);
  });

  /* ── 3.7  CARD TILT on mouse move ──────────────────────────── */
  function applyTilt(cards, intensity = 6) {
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width  - 0.5;
        const y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform =
          `perspective(600px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.4s ease';
        card.style.transform  = '';
        setTimeout(() => { card.style.transition = ''; }, 400);
      });
    });
  }
  applyTilt($$('.togarak-item'), 5);
  applyTilt($$('.yutuq-card'),   4);

  /* ── 3.8  GOLD DIVIDER PULSE ───────────────────────────────── */
  const divObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        Object.assign(e.target.style, { opacity: '0.6', transition: 'opacity .8s ease' });
        setTimeout(() => { e.target.style.opacity = '0.3'; }, 800);
      }
    });
  }, { threshold: 1.0 });
  $$('.gold-divider').forEach(d => divObs.observe(d));

  /* ── 3.9  SCROLL PROGRESS BAR ──────────────────────────────── */
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  Object.assign(progressBar.style, {
    position: 'fixed', top: '0', left: '0', height: '3px',
    background: 'linear-gradient(to right,#c9a84c,#e8c97a)',
    width: '0%', zIndex: '9999', transition: 'width .1s linear', pointerEvents: 'none',
  });
  document.body.prepend(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop  = document.documentElement.scrollTop;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  }, { passive: true });

  /* ── 3.10  GRID CARD STAGGER (bugun + yutuq) ──────────────── */
  function observeGrid(selector, cardSelector) {
    const grid = $(selector);
    if (!grid) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          $$(cardSelector, e.target).forEach((card, i) => {
            card.style.cssText +=
              `opacity:0;transform:translateY(24px);` +
              `transition:opacity .5s ${i * 0.1}s ease,transform .5s ${i * 0.1}s ease;`;
            setTimeout(() => {
              card.style.opacity   = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          });
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    obs.observe(grid);
  }
  observeGrid('.bugun-cards', '.bugun-card');
  observeGrid('.yutuq-grid',  '.yutuq-card');

  /* ── 3.11  MOBILE MENU (Burger) ────────────────────────────── */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu    = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('active');
      mobileMenuBtn.innerHTML = isOpen ? '✖' : '☰';
    });

    document.addEventListener('click', e => {
      if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target) &&
          mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        mobileMenuBtn.innerHTML = '☰';
      }
    });
  }

  /* ── 3.12  HERO SLIDER (Karusel) ───────────────────────────── */
  const slides  = $$('.slide');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');

  if (slides.length && prevBtn && nextBtn) {
    let current = 0;
    let timer;

    function showSlide(idx) {
      slides.forEach(s => s.classList.remove('active'));
      slides[idx].classList.add('active');
    }
    function goNext() { current = (current + 1) % slides.length; showSlide(current); }
    function goPrev() { current = (current - 1 + slides.length) % slides.length; showSlide(current); }
    function resetTimer() { clearInterval(timer); timer = setInterval(goNext, 5000); }

    nextBtn.addEventListener('click', () => { goNext(); resetTimer(); });
    prevBtn.addEventListener('click', () => { goPrev(); resetTimer(); });
    resetTimer();
  }

  /* ── 3.13  LIGHTBOX (Galereya) ─────────────────────────────── */
  const lightboxModal   = document.getElementById('lightboxModal');
  const lightboxImg     = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose   = document.getElementById('lightboxClose');

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (lightboxImg)     lightboxImg.src         = '';
      if (lightboxCaption) lightboxCaption.textContent = '';
    }, 300);
  }

  $$('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img     = $('img', item);
      const caption = $('.gallery-caption', item);
      if (!lightboxModal || !img) return;
      lightboxImg.src              = img.src;
      lightboxCaption.textContent  = caption ? caption.innerText : '';
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  if (lightboxClose)  lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxModal)  lightboxModal.addEventListener('click', e => { if (e.target === lightboxModal) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  /* ── 3.14  MODAL (O'qituvchi ma'lumot) ─────────────────────── */
  const modalOverlay = document.getElementById('infoModal');
  const modalTitle   = document.getElementById('modalTitle');
  const modalText    = document.getElementById('modalText');

  if (modalOverlay) {
    modalOverlay.addEventListener('click', e => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  /* FAQ yoki boshqa joydan chaqirish uchun global funksiyalar */
  window.showModal = function(name, info) {
    if (!modalOverlay || !modalTitle || !modalText) return;
    modalTitle.textContent = name;
    modalText.textContent  = info;
    modalOverlay.classList.add('show');
  };
  window.closeModal = function() {
    if (modalOverlay) modalOverlay.classList.remove('show');
  };

  /* ── 3.15  FAQ ACCORDION ────────────────────────────────────── */
  $$('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const current = question.parentElement;
      const answer  = $('.faq-answer', current);

      /* Boshqa ochiqlarni yopish */
      $$('.faq-item.active').forEach(item => {
        if (item === current) return;
        item.classList.remove('active');
        $('.faq-answer', item).style.maxHeight = null;
      });

      /* Hozirgi elementni toggle qilish */
      current.classList.toggle('active');
      answer.style.maxHeight = current.classList.contains('active')
        ? answer.scrollHeight + 'px'
        : null;
    });
  });

  /* ── 3.16  NEWS yuklash ─────────────────────────────────────── */
  loadNews();
  setInterval(loadNews, 60 * 1000);

  /* ── 3.17  LUCIDE ICONS ─────────────────────────────────────── */
  if (typeof lucide !== 'undefined') lucide.createIcons();

}); // end DOMContentLoaded

/* ═══════════════════════════════════════════════════════════════
   4. CUSTOM CURSOR  (DOMContentLoaded tashqarisida, lekin guard bilan)
═══════════════════════════════════════════════════════════════ */
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;           // ← element yo'q bo'lsa, xatolik yo'q

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX - 4}px,${mouseY - 4}px,0)`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.transform = `translate3d(${ringX - 18}px,${ringY - 18}px,0)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.addEventListener('DOMContentLoaded', () => {
    $$('a, button, .togarak-item, .yutuq-card, .talim-card, .img-card').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
    });
  });
})();