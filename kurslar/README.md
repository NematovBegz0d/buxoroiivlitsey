# Kurs Davomat Manager — Tuzatilgan versiya

## Fayllar tarkibi

| Fayl                     | Tavsif                                  |
| ------------------------ | --------------------------------------- |
| `login.html`             | Kirish sahifasi (Firebase Auth)         |
| `kursNazorat.html`       | O'qituvchi / sinf rahbari paneli        |
| `kursgaYozilganlar.html` | Kuzatuv va statistika sahifasi          |
| `admin.html`             | To'liq boshqaruv paneli                 |
| `style.css`              | Umumiy dizayn (global)                  |
| `kursNazorat.css`        | kursNazorat.html uchun qo'shimcha       |
| `kursgaYozilganlar.css`  | kursgaYozilganlar.html uchun qo'shimcha |
| `admin.css`              | admin.html uchun qo'shimcha             |

## Tashqi bog'liqliklar

Barcha sahifalar quyidagi resurslarni loyiha papkangizdan kutadi:

```
../js/firebase-config.js   ← Firebase loyiha konfiguratsiyasi
../imgs/logo.png           ← Favicon va OG image
```

Agar `pages/` ichiga ko'chirsangiz, `../js/` va `../imgs/` pathlarini moslang.

## Deploy qilish

1. ZIP faylni oching.
2. Fayllarni eski kurs nazorat papkangizga qo'ying (ustiga yozib keting).
3. `../js/firebase-config.js` joyida ekanini tekshiring.
4. Netlify, Vercel yoki boshqa static hostingga yuklang.

## Firestore Security Rules (Muhim!)

Haqiqiy qoidalar repo ildizidagi **`firestore.rules`** faylida joylashgan (bu README
dagi eski namuna emas). U **Firebase Console → Firestore → Rules** ga **deploy
qilinishi shart** — faqat repoda turishi himoyani kuchga kiritmaydi.

Joriy siyosat qisqacha:

- **O'quvchilar PII si** (`students`, `course_students`, `attendance`, `grades`,
  `courseAssignments`, `teachers`, `classMentors`) — faqat tizimga kirgan **faol
  foydalanuvchi** o'qiy oladi (`activeUser()`). Ommaga ochiq EMAS.
- **Davomat/baho yozish** — o'qituvchi faqat O'ZIGA tegishli yozuvni
  (`teacherId == o'z id`) yoza/yangilaydi; o'chirish faqat admin.
- **`teachers` / `classMentors`** yozish — faqat admin.
  **`courseAssignments` / `course_students` / `students`** — admin yoki sinf rahbari.
- **Ommaviy (maxfiy emas):** `groups`, `subjects`, `students_rating`, `rating_meta`.
- Qolgan barcha hujjatlar catch-all (`allow read, write: if false`) bilan taqiqlangan.

## Tuzatilgan asosiy xatolar (ushbu versiyada)

### Kritik

1. **kursgaYozilganlar.html** — `openStudentDetail(${student.id})` → `openStudentDetail('${jsAttr(id)}')` — String ID lar uchun modal ochilmaydigan bug tuzatildi.
2. **kursgaYozilganlar.html** — `makeSlug()` regex: qiyshiq tirnoqlar `'` va `'` (U+2018, U+2019) yo'q edi → tiklandi. Boshqa sahifalar bilan to'liq izchillik.
3. **kursNazorat.html + kursgaYozilganlar.html** — XSS himoyasi: `esc()` va `jsAttr()` yordamchi funksiyalari qo'shildi, barcha `innerHTML` interpolatsiyalari himoyalandi.
4. **admin.css** — `#subjectCustomName, #classTimeCustom` (mavjud bo'lmagan ID lar) o'chirildi → `#customTimeInput` (haqiqiy ID) qo'yildi. Sahifa ochilganda qo'shimcha input ko'rinib turmasligini ta'minladi.
5. **admin.html** — `replaceRatingCollection()` atomik qilindi: avval yangilar yoziladi, keyin faqat yo'q bo'lganlar o'chiriladi → oraliq holda reyting yo'qolib qolmaydi.

### Yuqori

6. **kursNazorat.html** — `addStudentToCourse()` deterministik `docId` ishlatadi (`generateId()` → `makeSafeDocId()`), duplicate xavfi yo'q.
7. **kursNazorat.html** — `saveEnrollment()` endi `weekDays` ham saqlaydi (avval faqat `weekdays` saqlanardi). admin.html bilan to'liq moslashuv.
8. **kursNazorat.html** — `saveAttendance()` va `saveGrades()` qayta yozishdan oldin `confirm()` so'raydi; `createdAt` saqlanadi, `updatedAt` qo'shiladi.
9. **admin.html** — O'qituvchi yaratish: parol `actionLog`ga yozilmaydi (xavfsizlik). Credential box ikki marta ko'rsatish muammosi hal qilindi.

### O'rta

10. **kursgaYozilganlar.html** — 4 ta dublikat funksiya (`_UZ_DAYS`, `_dateToStr`, `_countExpected`, `_getDateRange`) o'chirildi; canonical nomlar (`UZ_WEEKDAYS`, `dateObjToStr`, `countExpectedSessions`, `calcPeriod`) ishlatiladi.
11. **kursgaYozilganlar.html** — Inline `style="..."` → CSS custom property (`--subject-color`) orqali fan rangi. Inline loading div → `.fb-load` class.
12. **kursgaYozilganlar.html** — Modal header `style="display:flex..."` → `.modal-header-right-group` class.
13. **kursNazorat.html** — Dead code olib tashlandi: `toggleAddSubject`, `toggleAddTeacher`, `addNewSubject`, `addNewTeacher`.
14. **kursNazorat.html + kursgaYozilganlar.html** — `"groups"` localStorage kaliti logout ro'yxatidan olib tashlandi (bu kolleksiya yuklanmaydi).
15. **login.html** — `"kuzatuvchi"` rol sinonimi qisqartirildi — tizimda yagona `"observer"` ishlatiladi.
16. **admin.html** — Bo'sh `<div>` → `.action-row` class, 6 ta ko'p qatorli `<div class="stat-icon"\n>` → bir qatorga keltirildi.
17. **Saralash** — `kursNazorat.html` da `localeCompare` larga `"uz"` lokal qo'shildi.
