// js/firebase-config.js

// Firebase kutubxonalari index.html yoki boshqa html fayllarda <script> orqali ulanishi kerak
// Undan so'ng ushbu fayl ulanadi.

const firebaseConfig = {
  apiKey: "AIzaSyAr7MVWgKayifNK4SMvDL654EfgreXsdsA",
  authDomain: "litsey-baza.firebaseapp.com",
  projectId: "litsey-baza",
  storageBucket: "litsey-baza.firebasestorage.app",
  messagingSenderId: "254370173481",
  appId: "1:254370173481:web:eea50fde416a76b15a4238",
  measurementId: "G-TF7PZCWNQ7"
};

// Firebase ni faqat bir marta ishga tushirish (xatolik bermasligi uchun tekshiramiz)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Baza bilan ishlash uchun db o'zgaruvchisini yaratamiz
const db = firebase.firestore();
