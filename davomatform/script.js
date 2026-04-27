// =============================================
// DATA: 16 TA GURUH (Alohida Parollar)
// =============================================
const GURUHLAR = [
  // 1-kurslar
  { id: "101", login: "guruh101", parol: "p101", kurs: 1 },
  { id: "102", login: "guruh102", parol: "p102", kurs: 1 },
  { id: "103", login: "guruh103", parol: "p103", kurs: 1 },
  { id: "104", login: "guruh104", parol: "p104", kurs: 1 },
  { id: "105", login: "guruh105", parol: "p105", kurs: 1 },
  { id: "106", login: "guruh106", parol: "p106", kurs: 1 },
  { id: "107", login: "guruh107", parol: "p107", kurs: 1 },
  { id: "108", login: "guruh108", parol: "p108", kurs: 1 },

  // 2-kurslar
  { id: "201", login: "guruh201", parol: "p201", kurs: 2 },
  { id: "202", login: "guruh202", parol: "p202", kurs: 2 },
  { id: "203", login: "guruh203", parol: "p203", kurs: 2 },
  { id: "204", login: "guruh204", parol: "p204", kurs: 2 },
  { id: "205", login: "guruh205", parol: "p205", kurs: 2 },
  { id: "206", login: "guruh206", parol: "p206", kurs: 2 },
  { id: "207", login: "guruh207", parol: "p207", kurs: 2 },
  { id: "208", login: "guruh208", parol: "p208", kurs: 2 },
];

// =============================================
// DATA: 10 TA O'QITUVCHI PAROLLARI
// =============================================
const OQITUVCHILAR = {
  1111: "Aliyev A. (Informatika)",
  2222: "Valiyeva B. (Matematika)",
  3333: "Toshmatov D. (Fizika)",
  4444: "Karimova M. (Ingliz tili)",
  5555: "Rustamov J. (Tarix)",
  6666: "Sodiqov U. (Ona tili)",
  7777: "G'aniyeva S. (Kimyo)",
  8888: "Umarov B. (Biologiya)",
  9999: "Nazarova F. (Jismoniy tarbiya)",
  "0000": "Usmonov X. (Chizmachilik)",
};

// =============================================
// TASHQI FAYLDAN (data.js) MA'LUMOTLARNI OLISH
// =============================================
const OQUVCHILAR = {};
GURUHLAR.forEach((g) => {
  OQUVCHILAR[g.id] = [];
});

if (typeof STUDENTS_DATA !== "undefined") {
  STUDENTS_DATA.forEach((student) => {
    const groupIdStr = String(student.group);
    if (OQUVCHILAR[groupIdStr]) {
      OQUVCHILAR[groupIdStr].push(student);
    }
  });
} else {
  console.error(
    "XATOLIK: STUDENTS_DATA massivi topilmadi. data.js fayli to'g'ri ulanganini tekshiring.",
  );
}

// =============================================
// STATE
// =============================================
let davomatlar = JSON.parse(localStorage.getItem("davomatlar") || "{}");
let activeGuruhId = null;

// =============================================
// INIT
// =============================================
function init() {
  const today = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const dateStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const displayDate = `${pad(today.getDate())}.${pad(today.getMonth() + 1)}.${today.getFullYear()}`;
  document.getElementById("todayDate").textContent = displayDate;
  document.getElementById("sanaInput").value = dateStr;
  renderGuruhlar();
}

function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// =============================================
// RENDER GURUHLAR
// =============================================
function renderGuruhlar() {
  const grid1 = document.getElementById("gridKurs1");
  const grid2 = document.getElementById("gridKurs2");
  const today = todayStr();

  grid1.innerHTML = "";
  grid2.innerHTML = "";

  for (let g of GURUHLAR) {
    const card = document.createElement("div");
    card.className = "guruh-card";

    const dayData = (davomatlar[g.id] && davomatlar[g.id][today]) || {};
    let totalKelgan = 0,
      totalKelmagan = 0;

    for (let p of ["1", "2", "3"]) {
      if (dayData[p]) {
        totalKelgan += (dayData[p].keldi || []).length;
        totalKelmagan += (dayData[p].kelmadi || []).length;
      }
    }

    const total = OQUVCHILAR[g.id] ? OQUVCHILAR[g.id].length : 0;

    card.innerHTML = `
      <div class="guruh-header">
        <div class="guruh-name">
          <span class="guruh-num" ${g.kurs === 2 ? 'style="color:var(--accent2); background:rgba(52,211,153,0.1); border-color:rgba(52,211,153,0.25);"' : ""}>${g.id}</span>
          ${g.id}-guruh
        </div>
        <div class="guruh-stats">
          ${totalKelgan > 0 ? `<span class="stat-pill stat-kelgan">✓ ${totalKelgan}</span>` : ""}
          ${totalKelmagan > 0 ? `<span class="stat-pill stat-kelmagan">✗ ${totalKelmagan}</span>` : ""}
          ${totalKelgan + totalKelmagan === 0 ? `<span style="font-size:11px;color:var(--text3);">Jami: ${total}</span>` : ""}
        </div>
      </div>
      <div class="para-list">
        ${[1, 2, 3].map((p) => renderParaRow(dayData[p], p, total)).join("")}
      </div>
    `;

    if (g.kurs === 1) {
      grid1.appendChild(card);
    } else {
      grid2.appendChild(card);
    }
  }
}

function renderParaRow(paraData, paraNum, total) {
  if (!paraData) {
    return `
      <div class="para-row">
        <div class="para-label">${paraNum}-para</div>
        <div class="para-content">
          <div class="para-empty"></div>
        </div>
      </div>
    `;
  }

  const keldi = paraData.keldi || [];
  const kelmadi = paraData.kelmadi || [];

  const dots = [
    ...keldi.map(
      (student) => `
      <div class="student-dot kelgan">
        K
        <div class="tooltip">${student.name}</div>
      </div>`,
    ),
    ...kelmadi.map(
      (student) => `
      <div class="student-dot kelmagan">
        X
        <div class="tooltip">${student.name}</div>
      </div>`,
    ),
  ].join("");

  return `
    <div class="para-row">
      <div class="para-label">${paraNum}-para</div>
      <div class="para-content">
        <div class="students-row">${dots}</div>
        <div class="para-meta">
          <span>Jami: ${total}</span>
          <span class="meta-kelgan">Kelgan: ${keldi.length}</span>
          <span class="meta-kelmagan">Kelmagan: ${kelmadi.length}</span>
          ${paraData.sabab ? `<span><i class="fa-solid fa-book"></i> ${paraData.sabab}</span>` : ""}
          ${paraData.teacherName ? `<span style="color:var(--accent)"><i class="fa-solid fa-user"></i> ${paraData.teacherName}</span>` : ""}
        </div>
      </div>
    </div>
  `;
}

// =============================================
// LOGIN MODAL
// =============================================
function openLoginModal() {
  document.getElementById("loginInput").value = "";
  document.getElementById("passInput").value = "";
  document.getElementById("loginError").classList.remove("show");
  document.getElementById("loginModal").classList.add("active");
  setTimeout(() => document.getElementById("loginInput").focus(), 100);
}

function closeLoginModal() {
  document.getElementById("loginModal").classList.remove("active");
}

function doLogin() {
  const login = document.getElementById("loginInput").value.trim();
  const parol = document.getElementById("passInput").value.trim();

  const guruh = GURUHLAR.find((g) => g.login === login && g.parol === parol);
  if (!guruh) {
    document.getElementById("loginError").classList.add("show");
    document.getElementById("passInput").value = "";
    return;
  }

  activeGuruhId = guruh.id;
  closeLoginModal();
  openDavomatModal(guruh.id);
}

// =============================================
// DAVOMAT MODAL VA PAROLNI TEKSHIRISH
// =============================================
function openDavomatModal(guruhId) {
  document.getElementById("activeGuruhLabel").textContent =
    `${guruhId}-guruh uchun davomat`;

  const passInput = document.getElementById("teacherPass");
  passInput.value = "";
  document.getElementById("sababInput").value = "";

  document.getElementById("studentsChecklist").className = "students-locked";
  document.getElementById("saveBtn").disabled = true;

  const badge = document.getElementById("teacherBadge");
  badge.textContent = "Qulfni ochish uchun parolni kiriting";
  badge.style.color = "var(--text3)";

  renderStudentsChecklist(guruhId);
  updateCountLabel();
  document.getElementById("davomatModal").classList.add("active");
}

function closeDavomatModal() {
  document.getElementById("davomatModal").classList.remove("active");
  activeGuruhId = null;
}

document.getElementById("teacherPass").addEventListener("input", function (e) {
  const pass = e.target.value.trim();
  const list = document.getElementById("studentsChecklist");
  const saveBtn = document.getElementById("saveBtn");
  const badge = document.getElementById("teacherBadge");

  if (pass.length === 4 && OQITUVCHILAR[pass]) {
    list.classList.remove("students-locked");
    saveBtn.disabled = false;
    badge.textContent = `✓ Tasdiqlandi: ${OQITUVCHILAR[pass]}`;
    badge.style.color = "var(--accent2)";
  } else {
    list.classList.add("students-locked");
    saveBtn.disabled = true;
    if (pass.length === 4) {
      badge.innerHTML = "<i class='fa-solid fa-circle-xmark'></i> Noto'g'ri parol";
      badge.style.color = "var(--danger)";
    } else {
      badge.textContent = "Qulfni ochish uchun parolni kiriting";
      badge.style.color = "var(--text3)";
    }
  }
});

// =============================================
// TALABALAR RO'YXATI
// =============================================
function renderStudentsChecklist(guruhId) {
  const list = document.getElementById("studentsChecklist");
  const students = OQUVCHILAR[guruhId] || [];

  if (students.length === 0) {
    list.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text3); font-size: 13px;">Bu guruhda o'quvchilar yo'q. data.js faylini tekshiring.</div>`;
    return;
  }

  list.innerHTML = students
    .map(
      (student, i) => `
    <div class="student-check-row unchecked" id="row_${i}" onclick="toggleRowClick(${i})">
      <div class="student-info">
        <span class="student-index">${String(i + 1).padStart(2, "0")}</span>
        <span class="student-fullname">${student.name}</span>
      </div>
      <label class="toggle-switch" onclick="event.stopPropagation()">
        <input type="checkbox" id="chk_${i}" onchange="toggleStudent(${i})">
        <span class="toggle-slider"></span>
      </label>
    </div>
  `,
    )
    .join("");
}

function toggleRowClick(i) {
  const chk = document.getElementById(`chk_${i}`);
  if (chk) {
    chk.checked = !chk.checked;
    toggleStudent(i);
  }
}

function toggleStudent(i) {
  const chk = document.getElementById(`chk_${i}`);
  const row = document.getElementById(`row_${i}`);
  if (row && chk) {
    row.className =
      "student-check-row " + (chk.checked ? "checked" : "unchecked");
    updateCountLabel();
  }
}

function updateCountLabel() {
  const all = document.querySelectorAll('[id^="chk_"]');
  let kelgan = 0;
  all.forEach((c) => {
    if (c.checked) kelgan++;
  });
  document.getElementById("countLabel").textContent =
    `✓ Kelgan: ${kelgan}  ✗ Kelmagan: ${all.length - kelgan}`;
}

// =============================================
// SAVE DAVOMAT
// =============================================
function saveDavomat() {
  const teacherPass = document.getElementById("teacherPass").value.trim();
  const sana = document.getElementById("sanaInput").value;
  const para = document.getElementById("paraSelect").value;
  const sabab = document.getElementById("sababInput").value.trim();

  if (!OQITUVCHILAR[teacherPass]) {
    showToast("<i class='fa-solid fa-circle-xmark'></i> Avval to'g'ri o'qituvchi parolini kiriting!", true);
    return;
  }

  const guruhId = activeGuruhId;
  const students = OQUVCHILAR[guruhId] || [];
  const keldi = [];
  const kelmadi = [];

  students.forEach((student, i) => {
    const chk = document.getElementById(`chk_${i}`);
    if (chk && chk.checked) keldi.push({ id: student.id, name: student.name });
    else kelmadi.push({ id: student.id, name: student.name });
  });

  if (!davomatlar[guruhId]) davomatlar[guruhId] = {};
  if (!davomatlar[guruhId][sana]) davomatlar[guruhId][sana] = {};

  davomatlar[guruhId][sana][para] = {
    keldi,
    kelmadi,
    sabab,
    teacherName: OQITUVCHILAR[teacherPass],
    vaqt: new Date().toISOString(),
  };

  localStorage.setItem("davomatlar", JSON.stringify(davomatlar));

  closeDavomatModal();
  renderGuruhlar();
  showToast(`<i class="fa-solid fa-circle-check"></i> ${guruhId}-guruh ${para}-para davomati saqlandi!`);
}

// =============================================
// UTILS & EVENTS
// =============================================
function showToast(msg, isError = false) {
  const toast = document.getElementById("toast");
  document.getElementById("toastMsg").innerHTML = msg;
  toast.style.borderColor = isError
    ? "rgba(248,113,113,0.3)"
    : "rgba(52,211,153,0.3)";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

document.getElementById("loginModal").addEventListener("click", function (e) {
  if (e.target === this) closeLoginModal();
});

document.getElementById("davomatModal").addEventListener("click", function (e) {
  if (e.target === this) closeDavomatModal();
});

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    document.getElementById("loginModal").classList.contains("active")
  )
    doLogin();
});

init();
