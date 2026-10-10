/**
 * PHƯƠNG ÁN THAY THẾ — Google Apps Script Web App
 * Gửi email đăng ký bằng CHÍNH tài khoản Google của trường và (tuỳ chọn) lưu vào Google Sheet.
 * Không cần Resend, không cần xác minh domain.
 *
 * CÁCH DÙNG:
 * 1. Vào https://script.google.com  →  New project.
 * 2. Xoá code mẫu, dán toàn bộ file này vào.
 * 3. (Tuỳ chọn) Tạo một Google Sheet để lưu đăng ký, sao chép ID của nó
 *    (phần giữa /d/ và /edit trong URL) và dán vào SHEET_ID bên dưới. Bỏ trống nếu chỉ cần email.
 * 4. Bấm Deploy → New deployment → chọn loại "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Bấm Deploy, cấp quyền, rồi COPY "Web app URL" (dạng .../exec).
 * 5. Mở index.html, sửa dòng:
 *       const SUBMIT_ENDPOINT = "/api/submit";
 *    thành:
 *       const SUBMIT_ENDPOINT = "https://script.google.com/macros/s/..../exec";
 *    (dán URL vừa copy). Deploy lại website.
 *
 * Lưu ý: Apps Script trả về sau khi đã nhận; frontend đã xử lý mọi trạng thái thành công/thất bại.
 */

var TO_EMAIL = "thaonp162@fpt.edu.vn";
var SHEET_ID = ""; // để trống nếu không lưu Sheet

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents || "{}");
    var name = (d.name || "").toString();
    var cls = (d.cls || "").toString();
    var school = (d.school || "FPT Schools").toString();
    var competition = (d.competition || "").toString();
    var field = (d.field || "").toString();
    var contact = (d.contact || "").toString();
    var note = (d.note || "").toString();
    var when = d.submittedAtLocal || new Date().toLocaleString("vi-VN");

    if (!name || !cls || !competition || !contact) {
      return json({ ok: false, error: "Thiếu thông tin bắt buộc." });
    }

    var subject = "[Đăng ký cuộc thi] " + competition + " — " + name + " (" + cls + ")";
    var body =
      "ĐĂNG KÝ CUỘC THI — FPT SCHOOLS\n\n" +
      "Họ và tên: " + name + "\n" +
      "Lớp: " + cls + "\n" +
      "Trường: " + school + "\n" +
      "Lĩnh vực: " + (field || "—") + "\n" +
      "Cuộc thi: " + competition + "\n" +
      "Liên hệ: " + contact + "\n" +
      "Ghi chú: " + (note || "—") + "\n" +
      "Thời gian: " + when + "\n";

    MailApp.sendEmail({
      to: TO_EMAIL,
      subject: subject,
      body: body,
      replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? contact : undefined
    });

    if (SHEET_ID) {
      var sh = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
      if (sh.getLastRow() === 0) {
        sh.appendRow(["Thời gian", "Họ tên", "Lớp", "Trường", "Lĩnh vực", "Cuộc thi", "Liên hệ", "Ghi chú"]);
      }
      sh.appendRow([when, name, cls, school, field, competition, contact, note]);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ ok: true, msg: "FPT Schools registration endpoint" });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
