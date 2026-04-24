let STUDENTS_DATA = [];

document.addEventListener("DOMContentLoaded", () => {
  initRatingApp();
});

async function initRatingApp() {
  lucide.createIcons();

  try {
    const snapshot = await db.collection("students_rating").get();
    STUDENTS_DATA = snapshot.docs.map(doc => doc.data());

    if (STUDENTS_DATA.length > 0) {
      // 1. STATISTIKA VA GURUHLARNI FAQAT 1 MARTA HISOBLAYMIZ (Doimiy turadi)
      calculateKPIs(STUDENTS_DATA);

      const groupsObj = {};
      STUDENTS_DATA.forEach((s) => {
        if (!groupsObj[s.group]) {
          groupsObj[s.group] = { total: 0, count: 0 };
        }
        groupsObj[s.group].total += Number(s.total_score || 0);
        groupsObj[s.group].count += 1;
      });

      const groupsArr = Object.keys(groupsObj)
        .map((g) => {
          return {
            group: g,
            avg: (groupsObj[g].total / groupsObj[g].count).toFixed(1),
          };
        })
        .sort((a, b) => b.avg - a.avg);

      // Guruhlarni HTML ga doimiy qilib chizish
      renderGroups("listGroups", groupsArr);

      // 2. O'quvchilarni boshlang'ich chizish (Top 10 qotirilgan holatda)
      renderStudents(STUDENTS_DATA, false);

      // 3. QIDIRUV MANTIQI (Faqat 1 va 2-kurslarga ta'sir qiladi)
      document.getElementById("searchInput").addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm === "") {
          renderStudents(STUDENTS_DATA, false); // Filter qilinmagan (Top 10 fixed)
        } else {
          const filteredData = STUDENTS_DATA.filter(
            (student) =>
              student.name.toLowerCase().includes(searchTerm) ||
              String(student.group).includes(searchTerm),
          );
          renderStudents(filteredData, true); // Filter qilingan holat (hammasi scroll)
        }
      });
    } else {
      console.warn("Bazada o'quvchilar reytingi bo'yicha ma'lumot topilmadi.");
    }
  } catch (error) {
    console.error("Firebase'dan ma'lumot olishda xatolik:", error);
  }
}

// KPI Statistika chizuvchi
function calculateKPIs(data) {
  // Eski 4 ta statistika
  document.getElementById("kpi-total").textContent = data.length;
  const totalScore = data.reduce((sum, s) => sum + s.total_score, 0);
  const avgScore = data.length ? (totalScore / data.length).toFixed(1) : 0;
  document.getElementById("kpi-avg").textContent = avgScore;
  const maxScore = data.length
    ? Math.max(...data.map((s) => s.total_score))
    : 0;
  document.getElementById("kpi-max").textContent = maxScore;
  const uniqueGroups = new Set(data.map((s) => s.group)).size;
  document.getElementById("kpi-groups").textContent = uniqueGroups;

  // --- YANGI: 1-kurs va 2-kurs uchun alohida o'rtacha ballar ---

  // 1. Dastlab ma'lumotlarni kurslarga ajratamiz
  const kurs1Data = data.filter((s) => String(s.group).startsWith("1"));
  const kurs2Data = data.filter((s) => String(s.group).startsWith("2"));

  // 2. 1-kurslar ballarini hisoblaymiz
  const kurs1Total = kurs1Data.reduce((sum, s) => sum + s.total_score, 0);
  const kurs1Avg = kurs1Data.length
    ? (kurs1Total / kurs1Data.length).toFixed(1)
    : 0;

  // 3. 2-kurslar ballarini hisoblaymiz
  const kurs2Total = kurs2Data.reduce((sum, s) => sum + s.total_score, 0);
  const kurs2Avg = kurs2Data.length
    ? (kurs2Total / kurs2Data.length).toFixed(1)
    : 0;

  // 4. HTML ga yozamiz
  const kpi1El = document.getElementById("kpi-1kurs-avg");
  const kpi2El = document.getElementById("kpi-2kurs-avg");

  if (kpi1El) kpi1El.textContent = kurs1Avg;
  if (kpi2El) kpi2El.textContent = kurs2Avg;
}

// Ustunlarga bo'lib beruvchi
function renderStudents(data, isFiltered) {
  const kurs1 = data
    .filter((s) => String(s.group).startsWith("1"))
    .sort((a, b) => b.total_score - a.total_score);
  const kurs2 = data
    .filter((s) => String(s.group).startsWith("2"))
    .sort((a, b) => b.total_score - a.total_score);

  renderColumn("list1Kurs", kurs1, isFiltered);
  renderColumn("list2Kurs", kurs2, isFiltered);

  lucide.createIcons();
}

// Asosiy mantiq: Top 10 ni qotirib, qolganini scroll qilish
function renderColumn(elementId, items, isFiltered) {
  const container = document.getElementById(elementId);
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<p style="color: #94a3b8; text-align: center;">Ma'lumot topilmadi</p>`;
    return;
  }

  // Agar filtr qilingan bo'lsa yoki o'quvchilar soni 10 tadan kam bo'lsa barchasi scroll ichida chiqadi
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
    // Top 10 qotirilgan qism
    const top10Div = document.createElement("div");
    top10Div.className = "fixed-top-10";

    // Qolganlari uchun scroll bo'ladigan qism
    const restDiv = document.createElement("div");
    restDiv.className = "scrollable-rest custom-scrollbar";

    items.forEach((item, index) => {
      const card = createStudentCard(item, index + 1);
      if (index < 10) {
        top10Div.appendChild(card);
      } else {
        restDiv.appendChild(card);
      }
    });

    container.appendChild(top10Div);
    container.appendChild(restDiv);
  }
}

// O'quvchi kartochkasini chizish
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
      <h4>${item.name}</h4>
      <p><i data-lucide="users"></i> Guruh: ${item.group}</p>
    </div>
    <div class="student-score">
      <span class="score-val">${item.total_score}</span>
      <span class="score-lbl">BALL</span>
    </div>
  `;
  return div;
}

// Guruhlar ro'yxatini chizish
function renderGroups(elementId, groups) {
  const container = document.getElementById(elementId);
  container.innerHTML = "";

  groups.forEach((g) => {
    const div = document.createElement("div");
    div.className = "group-card";
    div.innerHTML = `
      <div class="group-name">${g.group}-guruh</div>
      <div class="group-score">${g.avg} ball</div>
    `;
    container.appendChild(div);
  });
}
