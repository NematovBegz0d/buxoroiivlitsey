const actionButtons = document.querySelectorAll("[data-target]");
const modals = document.querySelectorAll(".modal-info");
const closeButtons = document.querySelectorAll(".close-btn");
document.addEventListener("DOMContentLoaded", () => {
  // 1. Tugma bosilganda HTML ichidagi Modalni ochish
  actionButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault(); // Sahifa sakrab ketmasligi uchun

      // Qaysi id li oyna ochilishi kerakligini o'qiymiz
      const targetId = button.getAttribute("data-target");
      const targetModal = document.getElementById(targetId);

      if (targetModal) {
        targetModal.classList.add("show"); // Oynani ko'rsatish
        document.body.style.overflow = "hidden"; // Orqa fon skroll bo'lmasligi uchun qotirib qo'yamiz
      }
    });
  });

  // 2. X tugmasi bosilganda Modalni yopish
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal-info");
      modal.classList.remove("show");
      document.body.style.overflow = "auto"; // Skrollni qayta yoqamiz
    });
  });

  // 3. Oynaning tashqarisiga (qora fonga) bosganda ham yopish
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-info")) {
      e.target.classList.remove("show");
      document.body.style.overflow = "auto";
    }
  });

  // Skroll tepaga tugmasi mantiqi
  const scrollTopBtn = document.getElementById("scrollTop");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollTopBtn.style.display = "flex";
    } else {
      scrollTopBtn.style.display = "none";
    }
  });

  scrollTopBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
