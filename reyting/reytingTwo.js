let STUDENTS_DATA = [];
let ratingSearchBound = false;

document.addEventListener("DOMContentLoaded", () => {
  initRatingApp();
});

async function initRatingApp() {
  if (window.lucide) lucide.createIcons();

  if (typeof firebase === "undefined" || typeof db === "undefined") {
    showRatingError("Firebase config ulanmagan. ../js/firebase-config.js yo‘lini tekshiring.");
    return;
  }

  setRatingMeta("Reyting ma’lumotlari Firebase’dan yuklanmoqda...");

  try {
    const [ratingSnapshot, metaDoc] = await Promise.all([
      db.collection("students_rating").get(),
      db.collection("rating_meta").doc("current").get().catch(() => null),
    ]);

    STUDENTS_DATA = ratingSnapshot.docs
      .map((doc) => normalizeStudent(doc.data(), doc.id))
      .filter(Boolean);

    if (!STUDENTS_DATA.length) {
      clearRatingUI();
      setRatingMeta("Reyting bazasida hozircha ma’lumot yo‘q. Admin panel orqali yangi reyting yuklang.");
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
    showRatingError("Firebase’dan reytingni olishda xatolik: " + error.message);
  }
}

function normalizeStudent(data, fallbackId) {
  const id = data?.id ?? data?.studentId ?? fallbackId;
  const name = String(data?.name ?? data?.fullName ?? "").trim().replace(/\s+/g, " ");
  const group = data?.group ?? data?.groupCode;
  const totalScore = Number(data?.total_score ?? data?.totalScore ?? data?.score);

  if (!id || !name || group === undefined || group === null || !Number.isFinite(totalScore)) {
    return null;
  }

  return {
    id: String(id),
    name,
    group: String(group),
    total_score: Number(totalScore.toFixed(2)),
  };
}

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

    const filteredData = STUDENTS_DATA.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm) ||
        String(student.group).includes(searchTerm) ||
        String(student.id).includes(searchTerm),
    );
    renderStudents(filteredData, true);
  });

  ratingSearchBound = true;
}

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

function clearRatingUI() {
  document.getElementById("kpi-total").textContent = "0";
  document.getElementById("kpi-avg").textContent = "0.0";
  document.getElementById("kpi-max").textContent = "0";
  document.getElementById("kpi-groups").textContent = "0";
  ["list1Kurs", "list2Kurs", "listGroups"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div class="empty-rating-state">Ma’lumot topilmadi.</div>';
  });
}

function showRatingError(message) {
  clearRatingUI();
  setRatingMeta(escapeHtml(message));
}

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

  const kurs1Data = data.filter((s) => String(s.group).startsWith("1"));
  const kurs2Data = data.filter((s) => String(s.group).startsWith("2"));

  const kurs1Total = kurs1Data.reduce((sum, s) => sum + Number(s.total_score || 0), 0);
  const kurs1Avg = kurs1Data.length ? (kurs1Total / kurs1Data.length).toFixed(1) : "0.0";

  const kurs2Total = kurs2Data.reduce((sum, s) => sum + Number(s.total_score || 0), 0);
  const kurs2Avg = kurs2Data.length ? (kurs2Total / kurs2Data.length).toFixed(1) : "0.0";

  const kpi1El = document.getElementById("kpi-1kurs-avg");
  const kpi2El = document.getElementById("kpi-2kurs-avg");

  if (kpi1El) kpi1El.textContent = kurs1Avg;
  if (kpi2El) kpi2El.textContent = kurs2Avg;
}

function renderStudents(data, isFiltered) {
  const kurs1 = data
    .filter((s) => String(s.group).startsWith("1"))
    .sort((a, b) => b.total_score - a.total_score || a.name.localeCompare(b.name, "uz"));
  const kurs2 = data
    .filter((s) => String(s.group).startsWith("2"))
    .sort((a, b) => b.total_score - a.total_score || a.name.localeCompare(b.name, "uz"));

  renderColumn("list1Kurs", kurs1, isFiltered);
  renderColumn("list2Kurs", kurs2, isFiltered);

  if (window.lucide) lucide.createIcons();
}

function renderColumn(elementId, items, isFiltered) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = '<div class="empty-rating-state">Ma’lumot topilmadi.</div>';
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
      <span class="score-val">${escapeHtml(item.total_score)}</span>
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
    container.innerHTML = '<div class="empty-rating-state">Guruhlar topilmadi.</div>';
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
