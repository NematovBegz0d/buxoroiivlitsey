# Kurs Davomat Manager — PRO clean version

## Fayllar
- `login.html`
- `kursNazorat.html`
- `kursgaYozilganlar.html`
- `admin.html`
- `style.css`
- `kursNazorat.css`
- `kursgaYozilganlar.css`
- `admin.css`

## Muhim
Bu fayllar mavjud loyihangizdagi shu fayllarning yaxshilangan varianti sifatida ishlatiladi. Sahifalar hali ham quyidagi mavjud resurslarni kutadi:

- `../js/firebase-config.js`
- `../imgs/logo.png`

Agar siz bu papkani boshqa joyga ko'chirsangiz, shu pathlarni loyihangiz strukturasiga moslab o'zgartiring.

## Kiritilgan asosiy tuzatishlar
1. HTML ichidagi `style="..."` inline atributlari olib tashlandi.
2. Sahifa ichidagi `<style>` bloklari alohida CSS fayllarga chiqarildi.
3. `kursNazorat.html` haftalik statistika Dushanba → Yakshanba qilib tuzatildi.
4. `weekDays` va `weekdays` nomlari moslashtirildi.
5. `admin.html` kursga yozishda `weekDays` va `weekdays` ikkalasi saqlanadi.
6. Statistika blokiga `Olinmagan dars` hisoblash qo'shildi.
7. Baholar bloki qayta tartiblandi: Bugun / Bu hafta / Bu oy ko'rinishi chiroyliroq qilindi.
8. Progress barlar va ranglar classlar orqali boshqariladi.
9. JS sintaksisi `node --check` bilan tekshirildi.

## Deploy qilish
1. Zipni oching.
2. Fayllarni eski kurs nazorat papkangizga qo'ying.
3. `../js/firebase-config.js` joyida ekanini tekshiring.
4. Netlify yoki boshqa static hostingga yuklang.
