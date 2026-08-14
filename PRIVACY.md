# Chính sách quyền riêng tư

Cập nhật lần cuối: 11/08/2026.

Hyper Cookies xử lý cookies, URL và `localStorage` để cung cấp chức năng quản lý, import và export dữ liệu của tab do người dùng lựa chọn.

## Dữ liệu được xử lý

- URL và hostname của tab hiện tại.
- Cookies mà Chrome cho phép extension truy cập.
- Các key/value trong `localStorage` của tab hiện tại.
- Tùy chọn cục bộ: ngôn ngữ, theme, tự reload và định dạng export.

## Lưu trữ và truyền dữ liệu

- Cookies và `localStorage` chỉ được đọc hoặc ghi trên thiết bị của người dùng.
- File export được tạo cục bộ và lưu tại vị trí do người dùng kiểm soát.
- Extension không gửi cookies, `localStorage` hay lịch sử duyệt web tới máy chủ của nhà phát triển.
- Khi người dùng chọn import từ Google Drive, extension chỉ tải URL mà người dùng cung cấp từ các host Google Drive đã khai báo.
- Extension không có telemetry, analytics hay quảng cáo.

## Kiểm soát của người dùng

Người dùng có thể gỡ extension bất kỳ lúc nào để xóa các tùy chọn cục bộ do extension lưu. File đã export nằm ngoài phạm vi lưu trữ của extension và phải được người dùng tự quản lý hoặc xóa.

## Lưu ý bảo mật

File export có thể chứa thông tin xác thực nhạy cảm. Phiên bản hiện tại hỗ trợ JSON hoặc Base64; Base64 không phải mã hóa. Không chia sẻ file export với người không tin cậy.

## Liên hệ

Thông tin hỗ trợ được công bố trong trang phát hành và giao diện extension.
