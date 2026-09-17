معماری
Cloudflare Pages (فرانت‌اند)        ↓Cloudflare Worker (بک‌اند API)        ↓Cloudflare KV (ذخیره فایل‌ها)
API
متد
مسیر
کار
POST
/upload
آپلود فایل (form-data، فیلد file)
GET
/info/:id
اطلاعات فایل (اسم، حجم، نوع)
GET
/download/:id
دانلود مستقیم فایل
نمونه آپلود:
curl -X POST https://your-worker.workers.dev/upload -F "file=@photo.jpg"
فایل‌های پروژه
فایل
نقش
src/index.js
بک‌اند — Worker با ۳ endpoint
public/index.html
فرانت‌اند — تک‌فایل، بدون فریمورک و build
wrangler.toml
تنظیمات Worker و اتصال KV
محدودیت‌ها (پلن رایگان KV)
مورد
مقدار
حجم هر فایل
۲۵ مگابایت
کل فضا
۱ گیگابایت
دانلود روزانه
۱۰۰ هزار
هزینه
۰ تومان (بدون کارت بانکی)
