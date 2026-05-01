// ─────────────────────────────────────────────
//  reytingTwo.js  —  Barcha xatolar tuzatilgan
//  Tuzatishlar ro'yxati:
//  #1  clearRatingUI — apostrof SyntaxError
//  #3  Memory leak — search paytida animatsiya to'xtatilmagan
//  #4  Guruh aniqlash mo'rt — startsWith("1"/"2") xavfli
//  #5  Bo'sh string guruh — normalizeStudent'da o'tkazib yuborilgan
//  #6  Firebase meta xatosi — jimgina yutilgan
//  #7  Qidiruv paytida guruhlar ustuni yangilanmagan
//  #8  O'lik KPI kodi — tozalandi
//  #9  Mobil menyu toggle — qo'shildi
// ─────────────────────────────────────────────

let STUDENTS_DATA = [];
let ratingSearchBound = false;

document.addEventListener("DOMContentLoaded", () => {
  initRatingApp();
  initMobileMenu(); // TUZATISH #9
});

// ─── TUZATISH #9: Mobil menyu toggle ───────────────────────────────────────
function initMobileMenu() {
  const btn = document.getElementById("mobileMenuBtn");
  const menu = document.getElementById("mobileMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(isOpen));
    btn.textContent = isOpen ? "✕" : "☰";
  });

  // Tashqarini bosganda menyuni yopish
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "☰";
    }
  });
}

// ─── Asosiy boshlash funksiyasi ─────────────────────────────────────────────
async function initRatingApp() {
  if (window.lucide) lucide.createIcons();

  if (typeof firebase === "undefined" || typeof db === "undefined") {
    showRatingError("Firebase config ulanmagan. ../js/firebase-config.js yo'lini tekshiring.");
    return;
  }

  setRatingMeta("Reyting ma'lumotlari Firebase'dan yuklanmoqda...");

  try {
    const [ratingSnapshot, metaDoc] = await Promise.all([
      db.collection("students_rating").get(),
      // TUZATISH #6: Xatolik jimgina yutilmaydi — console.warn bilan loglanadi
      db
        .collection("rating_meta")
        .doc("current")
        .get()
        .catch((err) => {
          console.warn("rating_meta yuklanmadi:", err);
          return null;
        }),
    ]);

    STUDENTS_DATA = ratingSnapshot.docs
      .map((doc) => normalizeStudent(doc.data(), doc.id))
      .filter(Boolean);

    if (!STUDENTS_DATA.length) {
      clearRatingUI();
      setRatingMeta("Reyting bazasida hozircha ma'lumot yo'q. Admin panel orqali yangi reyting yuklang.");
      return;
    }

    STUDENTS_DATA.sort(
      (a, b) => b.total_score - a.total_score || a.name.localeCompare(b.name, "uz"),
    );

    calculateKPIs(STUDENTS_DATA);
    renderGroups("listGroups", buildGroupStats(STUDENTS_DATA));
    renderStudents(STUDENTS_DATA, false);
    bindRatingSearch();
    renderMeta(metaDoc?.exists ? metaDoc.data() : null, STUDENTS_DATA);
  } catch (error) {
    console.error("Firebase'dan ma'lumot olishda xatolik:", error);
    showRatingError("Firebase'dan reytingni olishda xatolik: " + error.message);
  }
}

// ─── Ma'lumotni normallashtirish ─────────────────────────────────────────────
function normalizeStudent(data, fallbackId) {
  const id = data?.id ?? data?.studentId ?? fallbackId;
  const name = String(data?.name ?? data?.fullName ?? "").trim().replace(/\s+/g, " ");
  const group = data?.group ?? data?.groupCode;
  const totalScore = Number(data?.total_score ?? data?.totalScore ?? data?.score);

  // TUZATISH #5: Bo'sh string guruh ham tekshiriladi (!group qabul qilmaydi "")
  if (!id || !name || !group || !Number.isFinite(totalScore)) {
    return null;
  }

  return {
    id: String(id),
    name,
    group: String(group).trim(),
    total_score: Number(totalScore.toFixed(2)),
  };
}

// ─── TUZATISH #4: Xavfsiz kurs aniqlash ─────────────────────────────────────
// Guruh kodining BIRINCHI BELGISIGA qarab kursni aniqlaymiz:
//   "1A" → 1,  "1B" → 1,  "101" → 1,  "102" → 1
//   "2A" → 2,  "2B" → 2,  "201" → 2,  "202" → 2
// parseInt ishlatilmaydi — "101" ni parseInt qilsa 101 chiqadi va 1-kursga tushmaydi
function getKurs(group) {
  const firstChar = String(group).trim().charAt(0);
  if (firstChar === "1") return 1;
  if (firstChar === "2") return 2;
  return null;
}

// ─── Qidiruv ─────────────────────────────────────────────────────────────────
function bindRatingSearch() {
  if (ratingSearchBound) return;
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (!searchTerm) {
      renderStudents(STUDENTS_DATA, false);
      return;
    }

    const filteredData = STUDENTS_DATA.filter((student) => {
      const name  = student.name.toLowerCase();
      const group = String(student.group).toLowerCase();
      // Guruh: ANIQ moslik — "105" faqat 105-guruhni topadi
      if (group === searchTerm) return true;
      // Ism: qisman moslik — "sanoqulov" → Sanoqulova ham topiladi
      if (name.includes(searchTerm)) return true;
      // ID bo'yicha qidiruv olib tashlandi: raqamli ID chalkashtirib yuborardi
      return false;
    });
    renderStudents(filteredData, true);
  });

  ratingSearchBound = true;
}

// ─── Guruh statistikasi ───────────────────────────────────────────────────────
function buildGroupStats(data) {
  const groupsObj = {};

  data.forEach((s) => {
    if (!groupsObj[s.group]) {
      groupsObj[s.group] = { total: 0, count: 0 };
    }
    groupsObj[s.group].total += Number(s.total_score || 0);
    groupsObj[s.group].count += 1;
  });

  return Object.keys(groupsObj)
    .map((g) => ({
      group: g,
      avg: (groupsObj[g].total / groupsObj[g].count).toFixed(1),
    }))
    .sort((a, b) => Number(b.avg) - Number(a.avg));
}

// ─── Meta ma'lumotlarni ko'rsatish ───────────────────────────────────────────
function renderMeta(meta, data) {
  const total = data.length;
  const groups = new Set(data.map((s) => s.group)).size;
  const month = meta?.month ? `${escapeHtml(meta.month)} oyi` : "joriy reyting";
  const updatedAt = formatFirebaseDate(meta?.updatedAt);
  const updater = meta?.updatedByLogin ? escapeHtml(meta.updatedByLogin) : "";

  let html = `<div><strong>${month}</strong> — ${total} ta o'quvchi, ${groups} ta guruh.</div>`;

  if (updatedAt || updater) {
    html += `<div class="meta-update">`;
    html += `<i data-lucide="clock"></i> `;
    if (updatedAt) html += `${updatedAt}`;
    if (updater) html += ` · ${updater}`;
    html += `</div>`;
  }

  setRatingMeta(html);
  initInfoBadge();
}

function setRatingMeta(html) {
  const metaEl = document.getElementById("ratingMeta");
  if (metaEl) {
    metaEl.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  }
}

function initInfoBadge() {
  const toggle = document.getElementById("infoBadgeToggle");
  const card = document.getElementById("infoBadgeCard");
  if (!toggle || !card) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    card.classList.toggle("visible");
  });

  document.addEventListener("click", (e) => {
    if (!card.contains(e.target) && !toggle.contains(e.target)) {
      card.classList.remove("visible");
    }
  });
}

function formatFirebaseDate(value) {
  try {
    if (!value) return "";
    const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (_) {
    return "";
  }
}

// ─── TUZATISH #1: clearRatingUI — apostrof sindirilmagan (double-quote ishlatildi) ──
function clearRatingUI() {
  document.getElementById("kpi-total").textContent = "0";
  document.getElementById("kpi-avg").textContent = "0.0";
  document.getElementById("kpi-max").textContent = "0";
  document.getElementById("kpi-groups").textContent = "0";
  ["list1Kurs", "list2Kurs", "listGroups"].forEach((id) => {
    const el = document.getElementById(id);
    // TUZATISH #1: Ilgari '..Ma'lumot..' single-quote ichida apostrof — SyntaxError
    // Tuzatish: double-quote string yoki template literal ishlatildi
    if (el) el.innerHTML = `<div class="empty-rating-state">Ma'lumot topilmadi.</div>`;
  });
}

function showRatingError(message) {
  clearRatingUI();
  setRatingMeta(escapeHtml(message));
}

// ─── KPI Hisoblash ────────────────────────────────────────────────────────────
// TUZATISH #8: O'lik kurs-avg kodi olib tashlandi (HTML'da kommentga olingan elementlar)
function calculateKPIs(data) {
  document.getElementById("kpi-total").textContent = data.length;

  const totalScore = data.reduce((sum, s) => sum + Number(s.total_score || 0), 0);
  const avgScore = data.length ? (totalScore / data.length).toFixed(1) : "0.0";
  document.getElementById("kpi-avg").textContent = avgScore;

  const maxScore = data.length
    ? Math.max(...data.map((s) => Number(s.total_score || 0)))
    : 0;
  document.getElementById("kpi-max").textContent = maxScore;

  const uniqueGroups = new Set(data.map((s) => s.group)).size;
  document.getElementById("kpi-groups").textContent = uniqueGroups;
}

// ─── O'quvchilarni render qilish ──────────────────────────────────────────────
function renderStudents(data, isFiltered) {
  // TUZATISH #3: Memory leak — har safar render oldidan BARCHA eski
  // animatsiyalar to'xtatiladi, DOMdan ajralgan elementlarda loop davom etmaydi
  autoScrollCleanups.forEach((cleanup) => cleanup());
  autoScrollCleanups = [];

  // TUZATISH #4: getKurs() yordamida xavfsiz filtrlash
  const kurs1 = data
    .filter((s) => getKurs(s.group) === 1)
    .sort((a, b) => b.total_score - a.total_score || a.name.localeCompare(b.name, "uz"));
  const kurs2 = data
    .filter((s) => getKurs(s.group) === 2)
    .sort((a, b) => b.total_score - a.total_score || a.name.localeCompare(b.name, "uz"));

  renderColumn("list1Kurs", kurs1, isFiltered);
  renderColumn("list2Kurs", kurs2, isFiltered);

  // TUZATISH #7: Qidiruv paytida guruhlar ustuni ham filtrlanadi
  // (ilgari qidiruv qilganda guruhlar o'zgarmay qolardi)
  renderGroups("listGroups", buildGroupStats(data));

  if (window.lucide) lucide.createIcons();

  if (!isFiltered) initAutoScroll();
}

function renderColumn(elementId, items, isFiltered) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-rating-state">Ma'lumot topilmadi.</div>`;
    return;
  }

  if (isFiltered || items.length <= 10) {
    const scrollDiv = document.createElement("div");
    scrollDiv.className = "custom-scrollbar";
    scrollDiv.style.maxHeight = "800px";
    scrollDiv.style.overflowY = "auto";
    scrollDiv.style.paddingRight = "8px";

    items.forEach((item, index) => {
      scrollDiv.appendChild(createStudentCard(item, index + 1));
    });
    container.appendChild(scrollDiv);
  } else {
    const top10Div = document.createElement("div");
    top10Div.className = "fixed-top-10";

    const restDiv = document.createElement("div");
    restDiv.className = "scrollable-rest custom-scrollbar";

    items.forEach((item, index) => {
      const card = createStudentCard(item, index + 1);
      if (index < 10) top10Div.appendChild(card);
      else restDiv.appendChild(card);
    });

    container.appendChild(top10Div);
    container.appendChild(restDiv);
  }
}

function createStudentCard(item, rank) {
  let rankClass = "rank-normal";
  if (rank === 1) rankClass = "rank-gold";
  else if (rank === 2) rankClass = "rank-silver";
  else if (rank === 3) rankClass = "rank-bronze";

  const div = document.createElement("div");
  div.className = "student-card";
  div.innerHTML = `
    <div class="student-rank ${rankClass}">${rank}</div>
    <div class="student-info">
      <h4>${escapeHtml(item.name)}</h4>
      <p><i data-lucide="users"></i> Guruh: ${escapeHtml(item.group)}</p>
    </div>
    <div class="student-score">
      <span class="score-val">${escapeHtml(String(item.total_score))}</span>
      <span class="score-lbl">BALL</span>
    </div>
  `;
  return div;
}

function renderGroups(elementId, groups) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.innerHTML = "";

  if (!groups.length) {
    container.innerHTML = `<div class="empty-rating-state">Guruhlar topilmadi.</div>`;
    return;
  }

  groups.forEach((g) => {
    const div = document.createElement("div");
    div.className = "group-card";
    div.innerHTML = `
      <div class="group-name">${escapeHtml(g.group)}-guruh</div>
      <div class="group-score">${escapeHtml(g.avg)} ball</div>
    `;
    container.appendChild(div);
  });
}

// ─── AUTO-SCROLL ──────────────────────────────────────────────────────────────
let autoScrollCleanups = [];

function initAutoScroll() {
  const scrollables = document.querySelectorAll(".scrollable-rest");
  scrollables.forEach((el) => {
    const cleanup = setupAutoScroll(el, {
      speed: 0.6,
      pauseDelay: 3000,
      topPause: 2000,
    });
    autoScrollCleanups.push(cleanup);
  });
}

function setupAutoScroll(container, opts) {
  let animId = null;
  let paused = false;
  let resumeTimer = null;
  let userInteracting = false;

  function scrollStep() {
    if (!paused && !userInteracting) {
      const maxScroll = container.scrollHeight - container.clientHeight;

      if (maxScroll > 0) {
        container.scrollTop += opts.speed;

        if (container.scrollTop >= maxScroll) {
          paused = true;
          setTimeout(() => {
            container.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => {
              paused = false;
            }, opts.topPause);
          }, 1000);
        }
      }
    }

    animId = requestAnimationFrame(scrollStep);
  }

  function onUserStart() {
    userInteracting = true;
    clearTimeout(resumeTimer);
  }

  function onUserEnd() {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      userInteracting = false;
    }, opts.pauseDelay);
  }

  // wheel handleri referans sifatida saqlanadi — cleanup'da olib tashlash uchun
  function onWheel() {
    onUserStart();
    onUserEnd();
  }

  container.addEventListener("mouseenter", onUserStart);
  container.addEventListener("mouseleave", onUserEnd);
  container.addEventListener("touchstart", onUserStart, { passive: true });
  container.addEventListener("touchend", onUserEnd);
  container.addEventListener("wheel", onWheel, { passive: true });

  animId = requestAnimationFrame(scrollStep);

  return function cleanup() {
    cancelAnimationFrame(animId);
    clearTimeout(resumeTimer);
    container.removeEventListener("mouseenter", onUserStart);
    container.removeEventListener("mouseleave", onUserEnd);
    container.removeEventListener("touchstart", onUserStart);
    container.removeEventListener("touchend", onUserEnd);
    container.removeEventListener("wheel", onWheel);
  };
}

// ─── Yordamchi: HTML escaping ─────────────────────────────────────────────────
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}