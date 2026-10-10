// Vercel Serverless Function — nhận đăng ký từ website và gửi email tới nhà trường.
// Chạy trên Vercel Node runtime (Node 18+). Không dùng thư viện ngoài (fetch có sẵn).
//
// BIẾN MÔI TRƯỜNG (đặt trên Vercel → Settings → Environment Variables):
//   RESEND_API_KEY  (bắt buộc)  — khóa API của dịch vụ gửi email Resend (https://resend.com)
//   TO_EMAIL        (tùy chọn)  — email nhận đăng ký. Mặc định: thaonp162@fpt.edu.vn
//   FROM_EMAIL      (tùy chọn)  — email/định danh gửi đi. Khi test dùng: onboarding@resend.dev
//                                 Khi chạy thật nên dùng địa chỉ thuộc domain đã xác minh trên Resend.
//
// TUYỆT ĐỐI KHÔNG hard-code khóa API vào đây — luôn đọc từ process.env.

const TO_DEFAULT = "thaonp162@fpt.edu.vn";
const FROM_DEFAULT = "FPT Schools <onboarding@resend.dev>";

const escapeHtml = (s) =>
  String(s == null ? "" : s).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

export default async function handler(req, res) {
  // CORS (cùng origin nên thường không cần, thêm cho chắc)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Chỉ hỗ trợ phương thức POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const name = (body.name || "").toString().trim();
    const cls = (body.cls || "").toString().trim();
    const school = (body.school || "FPT Schools").toString().trim();
    const competition = (body.competition || "").toString().trim();
    const field = (body.field || "").toString().trim();
    const contact = (body.contact || "").toString().trim();
    const note = (body.note || "").toString().trim();
    const submittedAtLocal = (body.submittedAtLocal || "").toString().trim();

    // Chống spam / dữ liệu rác cơ bản
    if (!name || !cls || !competition || !contact) {
      return res.status(400).json({ ok: false, error: "Thiếu thông tin bắt buộc (họ tên, lớp, cuộc thi, liên hệ)." });
    }
    if (name.length > 120 || cls.length > 40 || competition.length > 200 || contact.length > 120 || note.length > 2000) {
      return res.status(400).json({ ok: false, error: "Dữ liệu quá dài." });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "Máy chủ chưa cấu hình RESEND_API_KEY." });
    }
    const to = process.env.TO_EMAIL || TO_DEFAULT;
    const from = process.env.FROM_EMAIL || FROM_DEFAULT;
    const timeStr = submittedAtLocal || new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    const rows = [
      ["Họ và tên", name],
      ["Lớp", cls],
      ["Trường", school],
      ["Lĩnh vực", field || "—"],
      ["Cuộc thi đăng ký", competition],
      ["Liên hệ", contact],
      ["Ghi chú", note || "—"],
      ["Thời gian đăng ký", timeStr],
    ];
    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:auto;color:#15202b">
        <div style="background:#F26A21;color:#fff;padding:18px 22px;border-radius:12px 12px 0 0">
          <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.9">FPT Schools · Đăng ký cuộc thi</div>
          <div style="font-size:20px;font-weight:800;margin-top:4px">Có đăng ký mới</div>
        </div>
        <table style="width:100%;border-collapse:collapse;border:1px solid #E4EAF3;border-top:0">
          ${rows.map((r, i) => `
            <tr style="background:${i % 2 ? "#F6F8FC" : "#fff"}">
              <td style="padding:11px 16px;font-size:12px;color:#8A96A8;text-transform:uppercase;letter-spacing:.04em;width:38%;vertical-align:top;border-bottom:1px solid #EEF2F9">${escapeHtml(r[0])}</td>
              <td style="padding:11px 16px;font-size:15px;font-weight:600;border-bottom:1px solid #EEF2F9">${escapeHtml(r[1])}</td>
            </tr>`).join("")}
        </table>
        <p style="font-size:12px;color:#8A96A8;margin:14px 2px">Email tự động từ cổng cuộc thi FPT Schools.</p>
      </div>`;
    const text = rows.map((r) => `${r[0]}: ${r[1]}`).join("\n");

    const payload = {
      from,
      to: [to],
      subject: `[Đăng ký cuộc thi] ${competition} — ${name} (${cls})`,
      html,
      text,
    };
    // Cho phép nhà trường bấm Reply trả lời thẳng học sinh nếu liên hệ là email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) payload.reply_to = contact;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      console.error("Resend error", r.status, detail);
      return res.status(502).json({ ok: false, error: "Không gửi được email. Vui lòng thử lại." });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("submit handler error", err);
    return res.status(500).json({ ok: false, error: "Lỗi máy chủ. Vui lòng thử lại." });
  }
}
