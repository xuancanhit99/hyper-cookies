# Production Readiness

## Quyết định đã triển khai

- Khôi phục `<all_urls>` để Chrome Cookies API hoạt động ổn định trên mọi website; giữ `activeTab` cho luồng tab hiện tại và scripting.
- Gỡ hoàn toàn Pro key, Developer Mode, remote config và remote kill-switch.
- Mở Cookies, Local Storage và các tùy chọn nâng cao cho mọi người dùng.
- Chuyển source sang TypeScript có build output riêng.
- Bật TypeScript strict mode cho source và test.
- Thêm type-check, lint, format check, unit test, browser smoke test và CI.
- Release chỉ từ tag version khớp manifest/package, kèm checksum và build attestation.
- Bundle font/icon cần thiết trong extension, không tải stylesheet thực thi từ xa.
- Cookie được nhận diện theo name/domain/path/store/partition; thao tác set/xóa giữ `hostOnly`, `partitionKey` và cookie store.
- Import có schema validation, giới hạn 10 MB/5.000 item, ràng buộc domain, báo partial failure và chính sách chuyển host rõ ràng.
- Google Drive import chỉ nhận hai host HTTPS cho phép, kiểm tra redirect/content type, có timeout và dừng stream khi vượt giới hạn.
- Metadata export chỉ giữ origin, không lưu credentials/path/query/fragment.

## Đã ghi nhận nhưng chủ động hoãn

1. **Encryption cho file export**
   - Base64 là encoding, không phải encryption.
   - Thiết kế passphrase, KDF và định dạng file có version được hoãn để không phá tương thích snapshot hiện tại.
2. **Import atomic/preview**
   - Import đã validate và báo số item lỗi, nhưng Chrome Cookies API không cung cấp transaction chung với `localStorage`.
   - Nếu Chrome từ chối giữa chừng, một phần cookie có thể đã được áp dụng; UI sẽ báo import không hoàn tất. Dry-run preview và rollback toàn bộ được để cho phiên bản sau.

Không nên coi file import từ nguồn không tin cậy hoặc file export chưa encryption là an toàn.

## Checklist trước mỗi release

- [ ] `npm ci` thành công.
- [ ] `npm run check` thành công.
- [ ] `npm run test:e2e` thành công trên Chrome stable.
- [ ] Manual smoke test: mở action trên một trang HTTPS, sau đó xác nhận cookies và localStorage được tải đúng.
- [ ] Manual smoke test: import một file Google Drive public qua redirect download thực tế.
- [ ] Version trong `manifest.json`, `package.json` và Git tag khớp nhau.
- [ ] Privacy policy và permission disclosure phản ánh đúng hành vi hiện tại.
- [ ] ZIP chỉ chứa nội dung từ `dist/`.
- [ ] SHA-256 và artifact attestation đã được tạo.
- [ ] Có kế hoạch rollback về release ổn định trước đó.
