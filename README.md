# FPT Schools — Cổng cuộc thi học sinh 2026–2027

Website **tĩnh** (một file `index.html`) giới thiệu 27 cuộc thi. Đăng ký dùng **Google Form**, dữ liệu tự lưu về **Google Sheet** của nhà trường — không cần máy chủ, không cần backend.

- **Giao diện + dữ liệu:** tất cả nằm trong `index.html` (không cần build).
- **Đăng ký:** các nút “Đăng ký” mở **Google Form**; câu trả lời dồn về một Google Sheet.
- **Logo:** logo FPT Schools chính thức (từ `fschool.fpt.edu.vn`).
- **Email liên hệ:** `thaonp162@fpt.edu.vn` (ở chân trang).

> Vì là web tĩnh, có thể đưa lên **bất kỳ** dịch vụ hosting nào (Vercel, Netlify, Cloudflare Pages, GitHub Pages…). Link sẽ **không còn** dạng `claude.ai`.

---

## A. Xem thử nhanh
Mở thẳng `index.html` bằng trình duyệt. Nút “Đăng ký” mở Google Form ngay.

---

## B. Đưa lên mạng để có link riêng (chọn 1 cách)

### Cách 1 — Vercel (kéo–thả, khuyến nghị)
1. Tạo tài khoản tại https://vercel.com.
2. **Add New… → Project → Deploy** (hoặc kéo–thả thư mục này ở https://vercel.com/new).
3. Xong sẽ có link dạng `https://<tên-project>.vercel.app`. Đặt tên project `fpt-schools-competitions` để ra `https://fpt-schools-competitions.vercel.app`.

### Cách 2 — Netlify Drop (nhanh nhất, không cần tài khoản để thử)
1. Vào https://app.netlify.com/drop.
2. Kéo thả **thư mục này** vào trang → có link ngay.

### Cách 3 — GitHub Pages
1. Tạo repo, tải các file lên.
2. **Settings → Pages →** chọn branch `main` → Save. Link dạng `https://<user>.github.io/<repo>`.

> Gắn tên miền/subdomain riêng: mỗi dịch vụ trên đều có mục **Domains** để thêm.

Link production này là **link gửi cho học sinh** (thay cho link claude.ai).

---

## C. Google Form & danh sách đăng ký
- Các nút “Đăng ký” trỏ tới Google Form đặt trong `index.html`:
  ```js
  const FORM_URL = "https://docs.google.com/forms/d/e/.../viewform";
  ```
- Câu trả lời tự lưu vào Google Sheet: mở Form → tab **Câu trả lời** → **Xem trong Trang tính**.
- **Đổi sang Form khác:** chỉ cần sửa `FORM_URL` trong `index.html` rồi deploy lại.

---

## D. Đổi logo (nếu cần)
Logo lấy từ `https://fschool.fpt.edu.vn/wp-content/uploads/2026/02/logo-FSC.webp`, khai báo 2 chỗ trong `index.html` (header & footer) qua thuộc tính `src`. Muốn dùng file logo riêng: tải file logo vào cùng thư mục (VD `logo.webp`) rồi đổi `src="logo.webp"`.

---

## E. (Tuỳ chọn – nâng cao) Tự gửi email bằng form trên trang
Nếu sau này muốn form nằm hẳn trên website và tự gửi email (không qua Google Form), thư mục `api/` đã có sẵn hàm serverless `submit.js` (gửi qua Resend) và `alternative/google-apps-script.gs`. Xem chú thích trong các file đó. **Không bắt buộc** cho cách dùng hiện tại.

---

## Cấu trúc thư mục
```
fpt-schools-competitions/
├─ index.html                  # Toàn bộ website + dữ liệu 27 cuộc thi (đăng ký qua Google Form)
├─ api/submit.js               # (tuỳ chọn) serverless gửi email nếu muốn form on-site
├─ alternative/                # (tuỳ chọn) gửi email bằng Google Apps Script
├─ package.json, vercel.json   # cấu hình cho Vercel (không bắt buộc với web tĩnh)
├─ .env.example, .gitignore
└─ README.md
```
