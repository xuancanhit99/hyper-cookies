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
- `cookies`: sử dụng Chrome Cookies API sau khi domain đã được cấp quyền.
- Quyền host HTTP/HTTPS là quyền tùy chọn: extension chỉ yêu cầu khi người dùng bấm **Cho phép truy cập** trong tab Cookies và chỉ xin quyền cho domain hiện tại.
- `scripting`: đọc và thay đổi `localStorage` của tab hiện tại.
- `storage`: lưu ngôn ngữ, theme và các tùy chọn cục bộ.
- `https://drive.google.com/*` và `https://drive.usercontent.google.com/*`: tải file import do người dùng cung cấp.

Extension không có quyền `<all_urls>` thường trực.

## Scripts

- `npm run build`: bundle TypeScript và tạo package trong `dist/`.
- `npm run typecheck`: kiểm tra TypeScript.
- `npm run lint`: chạy ESLint.
- `npm run format:check`: kiểm tra định dạng.
- `npm test`: chạy unit test.
- `npm run test:e2e`: build và smoke-test extension trong Chrome.
- `npm run check`: chạy toàn bộ quality gate ngoại trừ browser smoke test.

## Phát hành

Manifest và `package.json` phải có cùng version. Tạo tag đúng định dạng, ví dụ `v1.1.1`; GitHub Actions sẽ kiểm tra quality gate, build file ZIP, tạo SHA-256, attestation và GitHub Release.

Xem thêm [PRIVACY.md](PRIVACY.md), [SECURITY.md](SECURITY.md) và [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md).
