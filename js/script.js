// =========================================================
// MOBIL MENYU (Burger Menu) MANTIQI
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  // Menyu tugmasi bosilganda
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      // .active klassini qo'shish yoki olib tashlash (CSS da display:block qiladi)
      mobileMenu.classList.toggle("active");

      // Tugma ikonkasini o'zgartirish (☰ dan ✖ ga)
      if (mobileMenu.classList.contains("active")) {
        mobileMenuBtn.innerHTML = "✖";
      } else {
        mobileMenuBtn.innerHTML = "☰";
      }
    });

    // Agar ekranning boshqa joyiga bosilsa, menyuni yopish
    document.addEventListener("click", (event) => {
      const isClickInsideMenu = mobileMenu.contains(event.target);
      const isClickOnButton = mobileMenuBtn.contains(event.target);

      if (
        !isClickInsideMenu &&
        !isClickOnButton &&
        mobileMenu.classList.contains("active")
      ) {
        mobileMenu.classList.remove("active");
        mobileMenuBtn.innerHTML = "☰";
      }
    });
  }

  // =========================================================
  // HERO SLIDER (Karusel) MANTIQI
  // =========================================================
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.getElementById("prevSlide");
  const nextBtn = document.getElementById("nextSlide");

  let currentSlide = 0;
  const slideIntervalTime = 5000; // 5 soniyada avtomatik almashadi
  let slideTimer;

  // Slaydlarni ko'rsatish funksiyasi
  function showSlide(index) {
    // Barcha slaydlardan 'active' klassini olib tashlaymiz
    slides.forEach((slide) => {
      slide.classList.remove("active");
    });

    // Faqat kerakli slaydga 'active' klassini qo'shamiz (CSS da opacity:1 qiladi)
    slides[index].classList.add("active");
  }

  // Keyingi slaydga o'tish funksiyasi
  function nextSlide() {
    currentSlide++;
    // Agar eng oxirgi slayddan o'tib ketsa, birinchisiga qaytadi
    if (currentSlide > slides.length - 1) {
      currentSlide = 0;
    }
    showSlide(currentSlide);
  }

  // Oldingi slaydga o'tish funksiyasi
  function prevSlide() {
    currentSlide--;
    // Agar eng birinchi slayddan orqaga qaytsa, oxirgisiga o'tadi
    if (currentSlide < 0) {
      currentSlide = slides.length - 1;
    }
    showSlide(currentSlide);
  }

  // Avtomatik almashib turishni yoqish
  function startSlideTimer() {
    slideTimer = setInterval(nextSlide, slideIntervalTime);
  }

  // Tugma bosilganda taymerni nollash (foydalanuvchi o'zi bosganda chalkashlik bo'lmasligi uchun)
  function resetSlideTimer() {
    clearInterval(slideTimer);
    startSlideTimer();
  }

  // Tugmalarga bosish hodisalarini biriktirish
  if (nextBtn && prevBtn && slides.length > 0) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      resetSlideTimer();
    });

    prevBtn.addEventListener("click", () => {
      prevSlide();
      resetSlideTimer();
    });

    // Sahifa yuklanganda slayderni ishga tushirish
    startSlideTimer();
  }
});

// =========================================================
// FOTOGALEREYA (Lightbox) MANTIQI
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightboxModal = document.getElementById("lightboxModal");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  // Har bir rasmga bosish (click) hodisasini qo'shish
  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Bosilgan div ichidagi img va yozuvni topib olish
      const img = item.querySelector("img");
      const caption = item.querySelector(".gallery-caption").innerText;

      // Modal ichidagi ma'lumotlarni o'zgartirish
      lightboxImg.src = img.src;
      lightboxCaption.innerText = caption;

      // Modalni ko'rsatish
      lightboxModal.classList.add("active");

      // Orqa fonda sahifa skroll bo'lishini to'xtatish
      document.body.style.overflow = "hidden";
    });
  });

  // X (yopish) tugmasi bosilganda
  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => {
      closeLightbox();
    });
  }

  // Rasm atrofidagi qora fonga bosilganda ham yopilishi
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // ESC klaviaturasi bosilganda yopilishi
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxModal.classList.contains("active")) {
      closeLightbox();
    }
  });

  // Modalni yopish funksiyasi
  function closeLightbox() {
    lightboxModal.classList.remove("active");
    // Skrollni qayta yoqish
    document.body.style.overflow = "auto";

    // Keyingi safar ochilganda eski rasm ko'rinib qolmasligi uchun tozalash
    setTimeout(() => {
      lightboxImg.src = "";
      lightboxCaption.innerText = "";
    }, 300); // animatsiya tugashini kutish
  }
});

// =========================================================
// YANGILIKLAR (Scroll Fade-in Animatsiyasi) MANTIQI
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const newsCards = document.querySelectorAll(".news-card");

  // Agar sahifada yangiliklar kartochkalari bo'lsa
  if (newsCards.length > 0) {
    // Ekranda ko'ringanini aniqlovchi kuzatuvchi (Observer)
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15, // Kartochkaning 15% qismi ekranda ko'ringanda ishga tushadi
    };

    const newsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Qaysi element ekranda ko'rinsa, unga 'show' klassini qo'shamiz
          entry.target.classList.add("show");

          // Bir marta animatsiya bo'lgach, uni qayta kuzatishni to'xtatamiz
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Barcha kartochkalarni kuzatishni boshlash va ketma-ketlik (delay) berish
    newsCards.forEach((card, index) => {
      // Har bir kartochkaga navbati bilan kechikish vaqti beramiz (masalan: 0s, 0.2s, 0.4s)
      card.style.transitionDelay = `${index * 0.15}s`;
      newsObserver.observe(card);
    });
  }
});

// =========================================================
// STATISTIKA (Raqamlar sanalishi) MANTIQI
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".stat-number");
  const speed = 200; // Sanash tezligi (qancha kichik bo'lsa shuncha tez sanaydi)
  let hasAnimated = false; // Bir marta sanagach qayta sanamasligi uchun

  // Ekranda ko'ringanini aniqlash
  const statsObserver = new IntersectionObserver(
    (entries, observer) => {
      const [entry] = entries;

      // Agar statistika bo'limi ekranda ko'rinsa va hali sanalmagan bo'lsa
      if (entry.isIntersecting && !hasAnimated) {
        counters.forEach((counter) => {
          // data-target atributidan yakuniy raqamni olish
          const target = +counter.getAttribute("data-target");

          // Raqamlarni sanash funksiyasi
          const updateCount = () => {
            const current = +counter.innerText; // Hozirgi raqam
            const inc = target / speed; // O'sish qadami

            if (current < target) {
              // Agar hozirgi raqam maqsaddan kichik bo'lsa, qo'shishda davom etamiz
              counter.innerText = Math.ceil(current + inc);
              setTimeout(updateCount, 15); // Har 15 millisoniyada yangilash
            } else {
              // Sanab bo'lgach aniq maqsad raqamni yozib qo'yish
              counter.innerText = target;
            }
          };

          updateCount();
        });

        hasAnimated = true; // Animatsiya ishlaganini belgilash
        observer.unobserve(entry.target); // Qayta kuzatishni to'xtatish
      }
    },
    {
      root: null,
      threshold: 0.3, // Seksiyaning 30% qismi ekranga chiqqanda ishga tushadi
    },
  );

  // Observer'ni butun section bo'yicha ishga tushirish
  const statsSection = document.querySelector(".stats-section");
  if (statsSection) {
    statsObserver.observe(statsSection);
  }
});

// Lucide Ikonkalarini render qilish
lucide.createIcons();

// Modal elementlarini aniqlash
const modalOverlay = document.getElementById("infoModal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");

// Modalni ochish funksiyasi
function showModal(name, info) {
  // Matnlarni o'zgartirish
  modalTitle.textContent = name;
  modalText.textContent = info;

  // "show" classini qo'shib animatsiya bilan ochish
  modalOverlay.classList.add("show");
}

// Modalni yopish funksiyasi
function closeModal() {
  modalOverlay.classList.remove("show");
}

// Modalning qora foniga (tashqarisiga) bosilganda ham yopish
modalOverlay.addEventListener("click", function (e) {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

// =========================================================
// FAQ (Akkordeon) MANTIQI
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  // Barcha savol tugmalarini topib olamiz
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      // Bosilgan tugmaning ota elementini (faq-item) topamiz
      const currentItem = question.parentElement;
      // O'sha item ichidagi javob qismini (faq-answer) topamiz
      const currentAnswer = currentItem.querySelector(".faq-answer");

      // 1. Boshqa barcha ochiq turgan itemlarni yopish mantiqi
      // Agar bir vaqtda faqat bitta savol ochiq turishini xohlasangiz bu ishlaydi:
      const allItems = document.querySelectorAll(".faq-item");
      allItems.forEach((item) => {
        if (item !== currentItem && item.classList.contains("active")) {
          item.classList.remove("active");
          const answer = item.querySelector(".faq-answer");
          answer.style.maxHeight = null; // Yopish (balandlikni nol qilish)
        }
      });

      // 2. Bosilgan savolni ochish yoki yopish
      currentItem.classList.toggle("active");

      // Agar active bo'lsa (ochilgan bo'lsa) max-height ga scrollHeight (asl balandlik) ni beramiz
      if (currentItem.classList.contains("active")) {
        // Javob ichidagi kontentning haqiqiy balandligini hisoblab CSS ga beramiz
        currentAnswer.style.maxHeight = currentAnswer.scrollHeight + "px";
      } else {
        // Agar yopilsa yana nolga tenglaymiz
        currentAnswer.style.maxHeight = null;
      }
    });
  });
});
