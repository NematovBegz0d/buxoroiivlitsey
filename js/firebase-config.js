const firebaseConfig = {
  apiKey: "AIzaSyC1SjMHyEi-POC9R9fp63DJJ7MmqOppoyI",
  authDomain: "kurs-nazorat-tizimi.firebaseapp.com",
  projectId: "kurs-nazorat-tizimi",
  storageBucket: "kurs-nazorat-tizimi.firebasestorage.app",
  messagingSenderId: "1085371187142",
  appId: "1:1085371187142:web:ce3d6f2844eef9e8137cc7",
  measurementId: "G-0LV7CJ9V5J"
};

if (typeof firebase === "undefined") {
  console.error("Firebase SDK yuklanmadi! Script tartibini tekshiring.");
} else {
  firebase.initializeApp(firebaseConfig);
}

const auth = typeof firebase !== "undefined" ? firebase.auth() : undefined;
const db = typeof firebase !== "undefined" ? firebase.firestore() : undefined;

/* Firestore offline persistence — internet uzilsa ham sahifa ishlaydi */
if (db) {
  db.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
    if (err.code === "failed-precondition") {
      console.warn("Firestore persistence: bir nechta tab ochiq, faqat bittasida ishlaydi.");
    } else if (err.code === "unimplemented") {
      console.warn("Firestore persistence: bu brauzer qo'llab-quvvatlamaydi.");
    }
  });
}
