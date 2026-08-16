# Hyper Cookies

Hyper Cookies là Chrome Extension Manifest V3 để xem, chỉnh sửa, xóa, import và export cookies cùng `localStorage` của tab hiện tại.

Từ phiên bản 1.1.0, mọi tính năng được mở cho tất cả người dùng. Extension không còn Pro key, Developer Mode, remote config hay remote kill-switch.

## Yêu cầu

- Node.js 22 trở lên.
- Google Chrome hoặc trình duyệt Chromium hỗ trợ Manifest V3.

## Phát triển

```bash
npm ci
npm run check
npm run test:e2e
```

`npm run build` tạo extension có thể cài tại thư mục `dist/`.

## Cài đặt thủ công

1. Chạy `npm ci && npm run build` hoặc tải ZIP từ GitHub Releases.
2. Mở `chrome://extensions/`.
3. Bật **Developer mode**.
4. Chọn **Load unpacked** và trỏ tới thư mục `dist/`.
5. Mở một trang HTTP/HTTPS và bấm biểu tượng Hyper Cookies.

## Quyền truy cập

- `activeTab`: quyền tạm thời với tab mà người dùng chủ động mở extension.
- `cookies`: đọc và thay đổi cookie thông qua Chrome Cookies API.
- `<all_urls>`: cấp quyền host thường trực để Cookies API hoạt động ổn định trên mọi website HTTP/HTTPS.
- `scripting`: đọc và thay đổi `localStorage` của tab hiện tại.
- `storage`: lưu ngôn ngữ, theme và các tùy chọn cục bộ.

Chrome sẽ hiển thị cảnh báo quyền đọc và thay đổi dữ liệu trên các website khi cài hoặc cập nhật extension. Đây là quyền rộng và chỉ nên cài extension từ bản phát hành tin cậy.

## An toàn dữ liệu

- Extension giữ đúng identity của cookie theo domain, path, cookie store và partition key; thao tác sửa/xóa không dựa riêng vào tên cookie.
- Import chỉ nhận snapshot đúng schema, tối đa 10 MB và tối đa 5.000 cookie hoặc item `localStorage` cho mỗi nhóm.
- Cookie không thuộc website đích bị từ chối. Khi người dùng xác nhận import khác website, cookie được chuyển thành host-only cookie của tab hiện tại.
- Import Google Drive chỉ nhận link HTTPS từ `drive.google.com` hoặc `drive.usercontent.google.com`, có timeout và giới hạn kích thước như import file.
- Metadata export chỉ lưu origin của trang, không lưu path, credentials, query hay fragment.

Tùy chọn Base64 chỉ mã hóa biểu diễn dữ liệu để thuận tiện lưu/chuyển file, không phải encryption. Snapshot vẫn có thể chứa token đăng nhập; chỉ export/import và chia sẻ với nguồn tin cậy.

## Scripts

- `npm run build`: bundle TypeScript và tạo package trong `dist/`.
- `npm run typecheck`: kiểm tra TypeScript.
- `npm run lint`: chạy ESLint.
- `npm run format:check`: kiểm tra định dạng.
- `npm test`: chạy unit test.
- `npm run test:e2e`: build và smoke-test extension trong Chrome.
- `npm run check`: chạy toàn bộ quality gate ngoại trừ browser smoke test.

## Phát hành

Manifest và `package.json` phải có cùng version. Tạo tag đúng định dạng, ví dụ `v1.2.0`; GitHub Actions sẽ kiểm tra quality gate, build file ZIP, tạo SHA-256, attestation và GitHub Release.

Xem thêm [PRIVACY.md](PRIVACY.md), [SECURITY.md](SECURITY.md) và [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md).
