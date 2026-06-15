/* ============================================================
 * common.js — kurslar moduli uchun umumiy yordamchilar
 * ------------------------------------------------------------
 * Bu fayl bir nechta sahifada (kursNazorat, kursgaYozilganlar,
 * studentProfile, ...) takrorlanib kelgan SOF (state'ga bog'liq
 * bo'lmagan) yordamchilarni bitta joyga jamlaydi.
 *
 * MUHIM: oddiy <script> sifatida, sahifaning inline <script>'idan
 * OLDIN ulanadi. Global funksiyalar/konstantalar sifatida e'lon
 * qilinadi (klassik skript), shuning uchun inline kod ularni
 * to'g'ridan-to'g'ri ishlata oladi.
 * ============================================================ */

/* ===== Fan ranglar xaritasi ===== */
const subjectColors = {
  Tarix: "#00e676",
  "Ona-tili va adabiyot": "#ff9800",
  "Rus tili": "#e91e63",
  "Ingliz tili": "#448aff",
  "Fransuz tili": "#7c4dff",
  "Nemis tili": "#ff5722",
  "Informatika fani": "#00bcd4",
  "Matematika fani": "#ffc107",
  "Fizika fani": "#9c27b0",
  "Jismoniy tarbiya": "#4caf50",
  Huquqshunoslik: "#795548",
  Geografiya: "#009688",
  "Kimyo fani": "#f44336",
  "Biologiya fani": "#8bc34a",
  "Kasbiy fan": "#607d8b",
  "Maxsus fan": "#ff5252",
};
/* Turli sahifalarda turlicha nomlanadi — ikkala nom ham bir xil obyektga ishora qiladi. */
const SUBJECT_COLORS = subjectColors;

/**
 * Xavfsiz noyob ID generatsiya qilish.
 * Date.now() o'rniga crypto.randomUUID() ishlatiladi.
 */
function generateId(prefix = "id") {
  const uid =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "")
      : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  return `${prefix}_${uid}`;
}

/**
 * Matnni barqaror "slug"ga aylantiradi (ID/docId normalizatsiyasi uchun).
 */
function makeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[ʼ'‘’ʻ`]/g, "")
    .replace(/-/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
}

function getSubjectId(subject) {
  return String(
    subject?.docId ||
      subject?.subjectId ||
      subject?.id ||
      makeSlug(subject?.name || ""),
  );
}

function getTeacherId(teacher) {
  return String(
    teacher?.id ||
      teacher?.teacherId ||
      teacher?.docId ||
      teacher?.login ||
      "",
  );
}

function teacherMatchesSubject(teacher, subjectId, selectedSubject) {
  const sid = String(subjectId || "");
  const subjectName = selectedSubject?.name || "";
  const subjectSlug = makeSlug(subjectName);

  // Yangi model: teacher.subjectIds = ["tarix", "huquq", ...]
  if (Array.isArray(teacher.subjectIds)) {
    return teacher.subjectIds.map(String).includes(sid);
  }

  // Yangi/yordamchi model: teacher.subjectId = "tarix"
  if (teacher.subjectId) {
    return String(teacher.subjectId) === sid;
  }

  // Eski data.js modeli: teacher.subject = "Tarix"
  if (teacher.subject) {
    return (
      String(teacher.subject) === String(subjectName) ||
      makeSlug(teacher.subject) === subjectSlug ||
      makeSlug(teacher.subject) === sid
    );
  }

  return false;
}

function makeSafeDocId(value) {
  return makeSlug(String(value || "x")).slice(0, 90) || "x";
}

/**
 * HTML escape — Firestore yozuvi (ism, fan nomi, izoh) ichidagi
 * `<`, `>`, `&`, `"`, `'` belgilarini DOMga zararsiz kiritadi (XSS oldini oladi).
 */
function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** JS string literal ichida xavfsiz ishlatish uchun (onclick="foo('${jsAttr(x)}')") */
function jsAttr(value) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("'", "\\'")
    .replaceAll('"', '\\"')
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "\\r");
}

/**
 * Tugmani yuklash holatiga o'tkazadi (ikki marta bosishni oldini oladi).
 */
function setButtonLoading(btnId, isLoading, originalText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = isLoading;
  if (isLoading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Saqlanmoqda...';
  } else {
    btn.innerHTML = btn.dataset.originalText || originalText || "Saqlash";
  }
}
