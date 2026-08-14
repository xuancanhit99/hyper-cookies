# Production Readiness

## Quyết định đã triển khai

- Thay quyền `<all_urls>` bằng `activeTab`; chỉ giữ host permissions tối thiểu cho Google Drive import.
- Gỡ hoàn toàn Pro key, Developer Mode, remote config và remote kill-switch.
- Mở Cookies, Local Storage và các tùy chọn nâng cao cho mọi người dùng.
- Chuyển source sang TypeScript có build output riêng.
- Thêm type-check, lint, format check, unit test, browser smoke test và CI.
- Release chỉ từ tag version khớp manifest/package, kèm checksum và build attestation.
- Bundle font/icon cần thiết trong extension, không tải stylesheet thực thi từ xa.

## Đã ghi nhận nhưng chủ động hoãn

Ba nhóm dưới đây giữ nguyên hành vi hiện tại và phải được xử lý trong một đợt hardening riêng:

1. **Bảo vệ file export**
   - Base64 hiện không phải mã hóa.
   - Cần thiết kế encryption, quản lý passphrase và loại query/fragment nhạy cảm khỏi metadata.
2. **Import an toàn và dự đoán được**
   - Cần schema validation nghiêm ngặt, giới hạn kích thước, preview, báo lỗi từng item và ràng buộc domain.
3. **Bảo toàn đầy đủ thuộc tính cookie**
   - Cần xử lý chính xác `hostOnly`, `partitionKey`, identity khi xóa và partial failure.

Các hạng mục hoãn này là rủi ro đã biết; không nên coi file import từ nguồn không tin cậy hoặc file export chưa mã hóa là an toàn.

## Checklist trước mỗi release

- [ ] `npm ci` thành công.
- [ ] `npm run check` thành công.
- [ ] `npm run test:e2e` thành công trên Chrome stable.
- [ ] Manual smoke test: mở action trên một trang HTTPS, xác nhận URL/cookies/localStorage được tải bằng `activeTab`.
- [ ] Manual smoke test: import một file Google Drive public qua redirect download thực tế.
- [ ] Version trong `manifest.json`, `package.json` và Git tag khớp nhau.
- [ ] Privacy policy và permission disclosure phản ánh đúng hành vi hiện tại.
- [ ] ZIP chỉ chứa nội dung từ `dist/`.
- [ ] SHA-256 và artifact attestation đã được tạo.
- [ ] Có kế hoạch rollback về release ổn định trước đó.
