(function () {
  /* Testlar sahifalarida ko'rsatma */
  const path = window.location.pathname;
  if (path.includes("/testlar/")) return;

  /* 30 soniya yopilgandan keyin qayta ko'rsatish */
  const STORAGE_KEY = "tl_banner_closed";
  const closed = localStorage.getItem(STORAGE_KEY);
  if (closed && Date.now() - Number(closed) < 3 * 60 * 1000) return;

  /* testlar/landing.html ga to'g'ri yo'l */
  const depth  = (path.match(/\//g) || []).length - 1;
  const prefix = depth > 0 ? "../".repeat(depth) : "./";
  const landingUrl  = prefix + "testlar/landing.html";
  const registerUrl = prefix + "testlar/register.html";

  /* CSS */
  const style = document.createElement("style");
  style.textContent = `
    #tl-banner {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 300px;
      background: linear-gradient(135deg, #0d1b2e 0%, #0f2040 100%);
      border: 1px solid rgba(68,138,255,.3);
      border-radius: 18px;
      box-shadow: 0 8px 40px rgba(0,0,0,.5), 0 0 0 1px rgba(68,138,255,.1);
      z-index: 99999;
      overflow: hidden;
      font-family: "Inter", system-ui, sans-serif;
      transform: translateX(340px);
      opacity: 0;
      transition: transform .4s cubic-bezier(.34,1.56,.64,1), opacity .3s ease;
    }
    #tl-banner.tl-show {
      transform: translateX(0);
      opacity: 1;
    }
    #tl-banner.tl-hide {
      transform: translateX(340px);
      opacity: 0;
    }
    .tl-banner-top {
      background: linear-gradient(135deg, rgba(68,138,255,.18), rgba(68,138,255,.05));
      padding: 14px 14px 12px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      border-bottom: 1px solid rgba(68,138,255,.15);
    }
    .tl-banner-icon {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: rgba(68,138,255,.2);
      border: 1px solid rgba(68,138,255,.3);
      display: flex; align-items: center; justify-content: center;
      color: #448aff; font-size: .9rem; flex-shrink: 0;
    }
    .tl-banner-label {
      flex: 1;
    }
    .tl-banner-badge {
      display: inline-flex; align-items: center; gap: 5px;
      background: rgba(0,230,118,.12);
      border: 1px solid rgba(0,230,118,.25);
      color: #00e676; font-size: .6rem; font-weight: 700;
      padding: 2px 8px; border-radius: 50px;
      text-transform: uppercase; letter-spacing: .06em;
      margin-bottom: 3px;
    }
    .tl-live-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #00e676;
      animation: tl-pulse 1.4s ease-in-out infinite;
      display: inline-block;
    }
    @keyframes tl-pulse {
      0%,100% { opacity:1; transform:scale(1); }
      50% { opacity:.4; transform:scale(.7); }
    }
    .tl-banner-title {
      font-size: .82rem; font-weight: 800; color: #fff; line-height: 1.3;
    }
    .tl-banner-close {
      background: rgba(255,255,255,.07);
      border: 1px solid rgba(255,255,255,.1);
      color: #8b96a8; font-size: .75rem;
      width: 24px; height: 24px; border-radius: 6px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all .15s;
    }
    .tl-banner-close:hover { background: rgba(255,82,82,.15); border-color: rgba(255,82,82,.3); color: #ff5252; }
    .tl-banner-body { padding: 12px 14px 14px; }
    .tl-banner-desc {
      font-size: .78rem; color: #8b96a8; line-height: 1.55; margin-bottom: 12px;
    }
    .tl-banner-stats {
      display: flex; gap: 6px; margin-bottom: 12px;
    }
    .tl-stat {
      flex: 1; background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.07);
      border-radius: 8px; padding: 6px 4px; text-align: center;
    }
    .tl-stat-num { font-size: .85rem; font-weight: 800; color: #448aff; }
    .tl-stat-lbl { font-size: .58rem; color: #4b5563; margin-top: 1px; }
    .tl-banner-btns { display: flex; gap: 8px; }
    .tl-btn-primary {
      flex: 1; padding: 9px 10px;
      background: linear-gradient(135deg,#448aff,#2066e8);
      color: #fff; font-size: .78rem; font-weight: 700;
      border: none; border-radius: 9px; cursor: pointer;
      text-decoration: none; display: flex; align-items: center;
      justify-content: center; gap: 6px;
      transition: all .15s;
      box-shadow: 0 3px 12px rgba(68,138,255,.35);
    }
    .tl-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(68,138,255,.5); }
    .tl-btn-secondary {
      padding: 9px 12px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.1);
      color: #c8d0db; font-size: .78rem; font-weight: 600;
      border-radius: 9px; cursor: pointer;
      text-decoration: none; display: flex; align-items: center;
      justify-content: center; gap: 6px; transition: all .15s;
    }
    .tl-btn-secondary:hover { background: rgba(255,255,255,.09); }

    @media (max-width: 400px) {
      #tl-banner { width: calc(100vw - 32px); right: 16px; bottom: 16px; }
    }
  `;
  document.head.appendChild(style);

  /* HTML */
  const el = document.createElement("div");
  el.id = "tl-banner";
  el.innerHTML = `
    <div class="tl-banner-top">
      <div class="tl-banner-icon"><i class="fa-solid fa-pen-to-square"></i></div>
      <div class="tl-banner-label">
        <div class="tl-banner-badge"><span class="tl-live-dot"></span> Yangi</div>
        <div class="tl-banner-title">Online Testlar Tizimi</div>
      </div>
      <button class="tl-banner-close" id="tlBannerClose">✕</button>
    </div>
    <div class="tl-banner-body">
      <p class="tl-banner-desc">
        Barcha fanlardan onlayn testlar ishlang. Natijalarni kuzating va bilimingizni oshiring!
      </p>
      <div class="tl-banner-stats">
        <div class="tl-stat">
          <div class="tl-stat-num">500+</div>
          <div class="tl-stat-lbl">Savol</div>
        </div>
        <div class="tl-stat">
          <div class="tl-stat-num">8</div>
          <div class="tl-stat-lbl">Fan</div>
        </div>
        <div class="tl-stat">
          <div class="tl-stat-num">24/7</div>
          <div class="tl-stat-lbl">Mavjud</div>
        </div>
      </div>
      <div class="tl-banner-btns">
        <a class="tl-btn-primary" href="${landingUrl}">
          <i class="fa-solid fa-rocket"></i> Ko'rish
        </a>
        <a class="tl-btn-secondary" href="${registerUrl}">
          <i class="fa-solid fa-user-plus"></i> Kirish
        </a>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  /* Animatsiya bilan ko'rsatish */
  setTimeout(() => el.classList.add("tl-show"), 800);

  /* Yopish + 3 daqiqada qayta chiqish */
  document.getElementById("tlBannerClose").addEventListener("click", () => {
    el.classList.remove("tl-show");
    el.classList.add("tl-hide");
    localStorage.setItem(STORAGE_KEY, String(Date.now()));

    setTimeout(() => {
      el.classList.remove("tl-hide");
      el.classList.add("tl-show");
      localStorage.removeItem(STORAGE_KEY);
    }, 3 * 60 * 1000);
  });
})();
