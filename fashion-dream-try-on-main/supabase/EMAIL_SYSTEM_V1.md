# Email System v1 — Fashion Dream / UpThink

## 1. Mục tiêu

Thiết lập email xác nhận đăng ký theo luồng:

`Register → Supabase Auth → Confirmation Email → /account → Session → CHÀO MỪNG [Tên tài khoản]`

Không thay đổi database schema và không lưu secret SMTP trong repository.

## 2. Template source of truth

Template HTML dùng cho Supabase Auth nằm tại:

`supabase/email_templates/confirm_signup.html`

Đây là **source template trong GitHub**. Supabase Auth không tự đọc file này; template phải được dán/cấu hình trong Supabase Dashboard.

## 3. Supabase Auth — Confirm signup

Template cần dùng biến:

- `{{ .ConfirmationURL }}` — liên kết xác nhận chính.
- `{{ .SiteURL }}` — chỉ dùng nếu cần hiển thị Site URL.
- `{{ .Data }}` — dữ liệu metadata nếu sau này cần cá nhân hóa.

CTA chính: `XÁC NHẬN EMAIL →`

Không thêm tracking link, quảng cáo hoặc nhiều CTA vào email xác nhận.

## 4. Redirect URL

Frontend hiện gửi redirect tới:

`{origin}/account?verified=1`

Cần allowlist URL tương ứng trong Supabase Authentication → URL Configuration.

Production phải có:

`https://fashion-dream-try-on-main-up-think.vercel.app/account?verified=1`

Nếu dùng domain production riêng, thêm domain đó tương ứng.

Preview URL chỉ thêm khi thực sự cần test OAuth/email trên preview.

## 5. SMTP

Không coi email system là hoàn tất chỉ vì `/signup` trả HTTP 200.

Production nên dùng Custom SMTP và domain gửi email đã xác thực. Khuyến nghị thiết lập SPF/DKIM/DMARC cho domain gửi.

Các nhà cung cấp có thể dùng: Resend, Brevo, Postmark, SendGrid hoặc AWS SES. Chọn một provider trước khi cấu hình production; không commit API key vào GitHub.

## 6. Nội dung email

Subject đề xuất:

`Xác nhận email của bạn — Fashion Dream`

Preheader:

`Hoàn tất đăng ký tài khoản Fashion Dream của bạn.`

Tone: transactional, ngắn, rõ, không mang tính quảng cáo.

Visual direction:

- Ink: `#1b1a17`
- Yellow: `#f0a500`
- Orange: `#e45826`
- Cream: `#e6d5b8`

## 7. Resend

Frontend đã có luồng gửi lại confirmation email.

Không spam endpoint resend liên tục. Cần tôn trọng rate limit của Supabase/Auth provider.

## 8. Test acceptance

### A. Registration

1. Mở `/account`.
2. Chọn đăng ký.
3. Nhập tên, email và password hợp lệ.
4. Submit.
5. UI phải báo kiểm tra email.

### B. Confirmation

1. Mở email mới nhất.
2. Chỉ click link xác nhận một lần.
3. Trình duyệt phải về `/account`.
4. Không còn hash lỗi `otp_expired`.
5. UI phải hiển thị thông báo xác nhận thành công.
6. Session phải được nhận diện.
7. Dashboard phải hiển thị `CHÀO MỪNG [Tên tài khoản]`.

### C. Expired / reused link

Nếu link hết hạn hoặc đã được dùng, `/account` phải hiển thị hướng dẫn gửi lại email thay vì lỗi kỹ thuật thô.

### D. Resend

1. Nhập đúng email chưa xác nhận.
2. Bấm gửi lại.
3. Nhận email mới.
4. Chỉ dùng link mới nhất.

### E. Deliverability

Kiểm tra Inbox, Spam/Junk và Promotions. Nếu Supabase đã hand off email cho SMTP provider nhưng inbox không nhận, kiểm tra provider logs và DNS/domain authentication.

### F. Mobile

Kiểm tra email và CTA trên Gmail mobile + desktop. Link fallback phải có thể copy được.

## 9. Security acceptance

- Không commit SMTP password/API key.
- Không đưa service_role vào frontend.
- Không disable RLS để phục vụ email.
- Không tự đánh dấu email confirmed bằng frontend.
- Trạng thái xác nhận phải do Supabase Auth làm source of truth.

## 10. Trạng thái hiện tại

### Đã làm trong code

- Signup redirect về `/account?verified=1`.
- Friendly handling cho `otp_expired`/invalid confirmation callback.
- Resend confirmation email.
- OAuth callback handling cho Google/Facebook.
- Customer dashboard welcome state.
- Branded confirmation-email HTML source.

### Cần thao tác Dashboard / provider

- Xác nhận Site URL và Redirect URL allowlist.
- Chọn và cấu hình Custom SMTP cho production.
- Xác thực sending domain + SPF/DKIM/DMARC.
- Dán template vào Supabase Auth → Email Templates → Confirm signup.
- Thực hiện test gửi email thật.

**Không tuyên bố Email System v1 PASS cho tới khi test email end-to-end thực tế thành công.**
