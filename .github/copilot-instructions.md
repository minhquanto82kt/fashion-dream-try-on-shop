# UpThink — Copilot Repository Instructions

## 1. Project Identity

**Repository:** `minhquanto82kt/fashion-dream-try-on-shop`

UpThink là nền tảng **fashion e-commerce tích hợp AI Virtual Try-On**, cho phép người dùng:

- Duyệt catalogue sản phẩm thời trang.
- Xem chi tiết sản phẩm.
- Chọn sản phẩm/outfit.
- Tải ảnh người dùng lên.
- Tạo hình ảnh thử đồ bằng AI.
- Xem kết quả outfit được tạo.
- Tiếp tục hành trình mua sắm từ sản phẩm đã thử.

Mọi thay đổi phải bảo vệ hai nhóm chức năng cốt lõi:

1. **E-commerce:** catalogue → product → outfit → shopping flow.
2. **AI Try-On:** user image → product/outfit → AI generation → generated image.

---

# 2. Architecture Rules

## Không được giả định framework

Luôn kiểm tra architecture thực tế từ repository trước khi thay đổi code.

**Không được mặc định project là Next.js.**

Không chuyển framework, router, build system hoặc architecture hiện tại chỉ vì một framework khác phổ biến hơn.

Trước khi sửa architecture, phải xác định:

- framework hiện tại
- package manager
- entry point
- routing
- frontend structure
- server/API structure
- build system
- deployment configuration.

## Preserve Existing Architecture

Không thực hiện các thay đổi sau nếu user không yêu cầu trực tiếp:

- đổi framework
- đổi router
- đổi package manager
- rewrite toàn bộ application
- thay đổi database architecture
- thay đổi AI provider
- thay đổi UI architecture trên diện rộng.

Ưu tiên **minimal change**: sửa đúng nguyên nhân, không rewrite những phần đang hoạt động.

---

# 3. General Coding Rules

Trước khi sửa code:

1. Đọc các file liên quan.
2. Trace dependency và data flow.
3. Xác định root cause.
4. Xác định phạm vi thay đổi.
5. Chỉ sau đó mới implementation.

Không sửa theo phỏng đoán.

Không tạo abstraction mới nếu logic hiện tại có thể sửa trực tiếp và rõ ràng.

Không duplicate logic đã tồn tại.

Không tạo component, utility, API hoặc dependency mới nếu không cần thiết.

## Không được tự ý xóa

Không xóa:

- component
- route
- API
- dependency
- configuration
- environment variable reference
- existing feature

chỉ vì chúng có vẻ không cần thiết.

Phải xác minh usage trước khi xóa.

---

# 4. AI Try-On Rules

AI Virtual Try-On là chức năng ưu tiên cao nhất của project.

Mọi thay đổi liên quan AI phải hiểu flow thực tế:

```text
User Image
    ↓
Product / Outfit Selection
    ↓
Frontend State
    ↓
Image Upload / Encoding
    ↓
API Request
    ↓
Server-side AI Logic
    ↓
AI SDK / Provider
    ↓
AI Model
    ↓
Generated Image
    ↓
API Response
    ↓
Frontend Rendering
```

Khi debug AI, phải xác định chính xác:

- file frontend
- component/function
- API endpoint
- server function
- AI SDK call
- provider
- model
- response format.

Không được kết luận AI "không hoạt động" chỉ dựa trên UI.

## Model và Provider

Không được tự giả định project đang sử dụng:

- OpenAI
- GPT Image
- Gemini
- Flux
- Replicate
- Vercel AI Gateway
- hoặc provider/model bất kỳ.

Phải kiểm tra implementation thực tế.

Nếu muốn thay model/provider, phải đánh giá:

- API compatibility
- input format
- output format
- latency
- cost
- image quality
- environment variables
- Vercel compatibility.

---

# 5. AI SDK Rules

Nếu repository sử dụng package `ai`:

- kiểm tra version thực tế trong `package.json`.
- kiểm tra API đang được import.
- kiểm tra provider adapter.
- kiểm tra model identifier.
- kiểm tra server/client boundary.
- không sử dụng API của version khác nếu chưa xác nhận compatibility.

Không cập nhật AI SDK chỉ để dùng API mới hơn nếu task không yêu cầu.

Nếu dependency `ai` tồn tại nhưng chưa được sử dụng đúng cách, phải xác định rõ:

`installed` ≠ `configured` ≠ `integrated` ≠ `working`.

---

# 6. API Rules

AI API phải được xử lý server-side khi có secret/API key.

Không đưa secret vào:

- client component
- browser bundle
- public environment variable
- frontend source code.

API phải validate input trước khi gọi AI.

Tối thiểu phải xử lý:

- missing input
- invalid image
- unsupported file type
- oversized image
- malformed request
- missing environment variable
- provider error
- timeout
- rate limit.

Không trả về lỗi generic nếu có thể cung cấp nguyên nhân an toàn và cụ thể.

---

# 7. Image Handling Rules

User-uploaded images là input quan trọng của AI Try-On.

Phải kiểm tra:

- MIME type
- file extension
- file size
- image dimensions
- encoding format
- request payload size.

Không chuyển image sang base64 nếu việc đó làm payload tăng đáng kể mà không cần thiết.

Không lưu image lớn vào React/client state nếu không cần thiết.

Không assume AI provider nhận cùng một image format với frontend.

Luôn kiểm tra input/output format thực tế của provider.

---

# 8. Security Rules

## Secrets

Không hardcode:

- API keys
- tokens
- passwords
- private URLs
- credentials.

Không đưa secret vào log.

Không đưa secret vào error message.

Không commit `.env` chứa secret.

Chỉ sử dụng tên environment variable trong code/report.

## User Upload

Không tin tưởng file do người dùng upload.

Phải validate:

- type
- size
- format

trước khi xử lý.

Không cho phép user input trực tiếp tạo ra server-side command hoặc arbitrary request.

## AI Prompt

User input không được phép kiểm soát tùy ý:

- system instructions
- API configuration
- provider credentials
- server-side tools.

Không bypass safety mechanism của AI provider.

---

# 9. E-commerce Rules

AI Try-On không được phá vỡ shopping flow.

Các entity/logic liên quan sản phẩm phải giữ tính nhất quán:

```text
Product
→ Variant
→ Size
→ Color
→ Price
→ Outfit
→ AI Try-On
→ Cart
```

Nếu AI Try-On được gọi từ product:

- phải giữ đúng product.
- phải giữ đúng variant nếu có.
- phải giữ đúng image sản phẩm.
- không tự thay đổi product metadata.

Không hardcode product data nếu repository đã có data source.

Không duplicate product information giữa nhiều component nếu có thể sử dụng data source hiện tại.

---

# 10. UI/UX Rules

Không tự ý redesign UI khi task chỉ yêu cầu sửa logic.

Không thay đổi:

- màu sắc
- typography
- layout
- spacing
- navigation
- branding

nếu không liên quan đến task.

Khi thay đổi AI Try-On UI, phải đảm bảo có các trạng thái:

```text
Idle
↓
Uploading
↓
Processing
↓
Success
↓
Error
```

Không để UI rơi vào trạng thái loading vô hạn.

Error message phải giúp người dùng hiểu cần làm gì tiếp theo.

---

# 11. Responsive Rules

Mọi UI change phải kiểm tra tối thiểu:

- Desktop
- Tablet
- Mobile.

Không giải quyết desktop bằng cách làm hỏng mobile.

Không dùng fixed dimensions cho UI quan trọng nếu layout responsive yêu cầu dynamic sizing.

Đặc biệt kiểm tra:

- image preview
- product cards
- catalogue
- AI result
- upload area
- buttons
- modal/dialog.

---

# 12. Performance Rules

Ưu tiên performance ở những điểm có tác động trực tiếp:

### Frontend

- unnecessary re-render
- oversized bundle
- duplicate requests
- unnecessary client-side processing
- large images
- blocking operations.

### AI

- duplicate generation requests
- oversized image payload
- unnecessary image conversion
- missing loading state
- excessive retry
- timeout handling.

Không tối ưu bằng cách làm giảm chất lượng AI hoặc image một cách tùy tiện.

---

# 13. Dependency Rules

Trước khi thêm dependency:

1. Kiểm tra project đã có package cung cấp chức năng tương tự chưa.
2. Kiểm tra dependency có thực sự cần thiết không.
3. Kiểm tra compatibility với framework hiện tại.
4. Kiểm tra bundle/runtime impact.

Không thêm package chỉ vì nó là giải pháp phổ biến.

Trước khi xóa dependency:

1. Search toàn repository.
2. Kiểm tra imports.
3. Kiểm tra scripts/config.
4. Kiểm tra indirect usage.
5. Chỉ xóa khi có evidence.

---

# 14. Vercel Rules

Repository phải duy trì khả năng deployment trên Vercel.

Không assume Vercel project sử dụng Next.js.

Khi thay đổi server/API phải kiểm tra:

- runtime compatibility
- Node.js compatibility
- build command
- environment variables
- function behavior
- request/response size
- timeout
- external API calls.

Không commit Vercel secrets vào repository.

Không thay đổi Vercel configuration nếu task không cần.

---

# 15. Environment Variables

Khi phát hiện environment variable:

Chỉ ghi:

```text
VARIABLE_NAME
Purpose
Used by
Required / Optional
Client / Server
```

Không bao giờ output giá trị thực tế.

Nếu application yêu cầu một variable nhưng repository không cung cấp giá trị:

```text
MISSING ENVIRONMENT VARIABLE
```

Không tự tạo secret giả và không hardcode giá trị tạm thời vào source.

---

# 16. Git Workflow

## Main Branch

`main` được xem là branch production/stable.

Không tự ý sửa trực tiếp `main`.

Mọi implementation nên được thực hiện trên feature branch hoặc Copilot branch.

Ví dụ:

```text
feature/ai-tryon-fix
feature/product-flow
fix/image-upload
fix/api-error
copilot/...
```

## Pull Request

Một PR nên tập trung vào một mục tiêu.

Không gom:

```text
AI fix
+ UI redesign
+ dependency upgrade
+ refactor
+ unrelated bug fixes
```

vào cùng một PR nếu không cần thiết.

---

# 17. Change Scope

Mặc định:

**Smallest safe change.**

Nếu task yêu cầu sửa một lỗi:

- không refactor toàn repo.
- không đổi architecture.
- không đổi UI không liên quan.
- không cập nhật dependency không cần thiết.

Nếu phát hiện vấn đề ngoài scope:

1. Không tự sửa.
2. Ghi nhận.
3. Báo cáo riêng.

---

# 18. Verification Requirements

Sau khi sửa code, phải chạy các verification command thực tế được định nghĩa trong repository.

Ưu tiên:

```text
Typecheck
↓
Lint
↓
Tests
↓
Build
```

Không tự bịa command.

Đọc `package.json` và configuration trước.

Nếu command không tồn tại:

```text
NOT CONFIGURED
```

Không báo PASS chỉ vì không có test.

## Build

Build phải pass trước khi báo implementation hoàn thành, trừ khi user yêu cầu chỉ sửa một phần chưa thể build độc lập.

## Runtime

Nếu có thể reproduce runtime issue, phải kiểm tra runtime behavior chứ không chỉ kiểm tra compile.

---

# 19. Reporting Rules

Mọi task implementation phải báo cáo ngắn gọn:

### Changed

Các file đã thay đổi.

### Why

Root cause hoặc lý do thay đổi.

### What

Thay đổi chính.

### Verification

Các command đã chạy và kết quả.

### Remaining Issues

Vấn đề chưa giải quyết.

Không dùng các kết luận generic như:

- "Code improved."
- "Performance optimized."
- "Security enhanced."
- "Everything works."

Nếu nói một điều đã được sửa, phải chỉ ra **file/function hoặc evidence tương ứng**.

---

# 20. When Requirements Are Ambiguous

Nếu task có thể gây thay đổi architecture, data model, AI provider hoặc production behavior:

- Không tự đoán.
- Kiểm tra repository trước.
- Nếu vẫn không đủ thông tin, hỏi user trước khi thực hiện thay đổi lớn.

Đối với thay đổi nhỏ, an toàn và có thể đảo ngược, ưu tiên implementation trực tiếp.

---

# 21. Definition of Done

Một task chỉ được xem là hoàn thành khi:

- Đúng phạm vi yêu cầu.
- Không phá architecture hiện tại.
- Không expose secret.
- Không phá AI Try-On.
- Không phá e-commerce flow.
- Không tạo dependency không cần thiết.
- Typecheck pass nếu được cấu hình.
- Lint pass nếu được cấu hình.
- Tests pass nếu được cấu hình.
- Build pass.
- Các thay đổi được báo cáo rõ ràng.

Nếu một tiêu chí chưa đạt, phải ghi rõ thay vì tuyên bố task hoàn thành.

---

# 22. Priority Order

Khi phải lựa chọn giữa nhiều phương án, ưu tiên:

1. **Security**
2. **Correctness**
3. **AI Try-On reliability**
4. **E-commerce functionality**
5. **Production stability**
6. **Performance**
7. **Maintainability**
8. **UI polish**

Không hy sinh security hoặc correctness để lấy UI đẹp hơn hoặc implementation nhanh hơn.
