const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRfHK6AurseXzaleT3S6mlu3wEe0pCZNmiAwxLSLjk-41u4fivNsbZ8HgAPlnIGEy1O_JJKefpxvoXN/pub?gid=0&single=true&output=csv";

function formatDate(str) {
  if (!str) return "";
  try {
    const d = new Date(str);
    if (isNaN(d)) return "";
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch {
    return "";
  }
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0]
    .replace(/"/g, "")
    .split(",")
    .map((h) => h.trim().toLowerCase()); // Kichik harfga o'tkazamiz

  return lines
    .slice(1)
    .map((line) => {
      const values = [];
      let cur = "",
        inQ = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
          inQ = !inQ;
        } else if (line[i] === "," && !inQ) {
          values.push(cur);
          cur = "";
        } else {
          cur += line[i];
        }
      }
      values.push(cur);
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = (values[i] || "").replace(/^"|"$/g, "").trim();
      });
      return obj;
    })
    .filter((r) => r.timestamp && r.timestamp.length > 5);
}

function createCard(item) {
  const card = document.createElement("div");
  card.className = "news-card";

  const mediaType = (item.media_type || "").toLowerCase();
  let imageUrl = item.image_url || "";

  // Google Drive havolalarini direct link'ga o'tkazish
  const driveRegex = /drive\.google\.com\/file\/d\/([^\/]+)/;
  const match = imageUrl.match(driveRegex);
  if (match && match[1]) {
    imageUrl = `https://drive.google.com/uc?id=${match[1]}`;
  }

  let mediaHTML = "";
  if (mediaType === "photo" && imageUrl) {
    mediaHTML = `
      <div class="news-card__media-wrap">
        <img
          class="news-card__media"
          src="${imageUrl}"
          alt="${item.title || "Rasm"}"
          loading="lazy"
          onerror="console.error('Rasm yuklanmadi:', this.src); this.style.display='none'; this.parentElement.innerHTML='<div class=\\'news-card__no-media\\'><i class=\\'fa-regular fa-newspaper\\'></i></div>';"
        >
      </div>`;
  } else if (mediaType === "video" && item.video_url) {
    mediaHTML = `
      <div class="news-card__video-wrap">
        <iframe
          src="${item.video_url}"
          frameborder="0"
          allowfullscreen
          allow="autoplay"
        ></iframe>
      </div>`;
  } else {
    mediaHTML = `<div class="news-card__no-media"><i class="fa-regular fa-newspaper"></i></div>`;
  }

  const dateStr = formatDate(item.timestamp);

  card.innerHTML = `
    ${mediaHTML}
    <div class="news-card__body">
      <span class="news-card__badge">
        <i class="fas fa-graduation-cap"></i> TA'LIM
      </span>
      <h3 class="news-card__title">${item.title || ""}</h3>
      ${item.text ? `<p class="news-card__text">${item.text}</p>` : ""}
      <div class="news-card__footer">
        ${dateStr ? `<span class="news-card__date">${dateStr}</span>` : ""}
        <a href="https://t.me/iivbuxorolitsey" target="_blank" rel="noopener noreferrer" class="news-card__tg-btn">
          <i class="fab fa-telegram-plane"></i> Batafsil o'qish
        </a>
      </div>
    </div>
  `;
  return card;
}

async function loadNews() {
  const grid = document.getElementById("news-grid");
  if (!grid) {
    console.error("HTML ichida 'news-grid' id'siga ega element topilmadi!");
    return;
  }

  try {
    const res = await fetch(CSV_URL + "&cachebust=" + Date.now());
    if (!res.ok) throw new Error(`Ma'lumot tortishda xatolik: ${res.status}`);
    const text = await res.text();
    const rows = parseCSV(text);

    // Eng so'nggi 4 ta yangilikni olish (yoki xohlagancha)
    const latest = rows.slice(-3).reverse();

    grid.innerHTML = "";

    if (latest.length === 0) {
      grid.innerHTML =
        "<p class=\"news-error\">Hozircha yangiliklar yo'q yoki jadval bo'sh.</p>";
      return;
    }

    latest.forEach((item) => grid.appendChild(createCard(item)));
  } catch (err) {
    console.error("News load error:", err);
    grid.innerHTML =
      '<p class="news-error">Yangiliklar yuklanmadi. Iltimos, keyinroq urinib ko\'ring.</p>';
  }
}

document.addEventListener("DOMContentLoaded", loadNews);
setInterval(loadNews, 60 * 1000);
