# Chính sách quyền riêng tư

Cập nhật lần cuối: 17/08/2026.

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
- Khi người dùng chọn import từ Google Drive, extension chỉ chấp nhận HTTPS trên `drive.google.com` và `drive.usercontent.google.com`; request có timeout và giới hạn phản hồi 10 MB.
- Extension không có telemetry, analytics hay quảng cáo.

## Kiểm soát của người dùng

Hyper Cookies yêu cầu quyền host thường trực trên các website để Chrome Cookies API có thể đọc và quản lý cookie ổn định. Extension chỉ xử lý dữ liệu khi người dùng mở hoặc thao tác trên giao diện extension. Người dùng có thể giới hạn hoặc thu hồi quyền trong phần cài đặt extension của Chrome, nhưng việc đó có thể làm chức năng Cookies ngừng hoạt động.

Người dùng có thể gỡ extension bất kỳ lúc nào để xóa các tùy chọn cục bộ do extension lưu. File đã export nằm ngoài phạm vi lưu trữ của extension và phải được người dùng tự quản lý hoặc xóa.

## Lưu ý bảo mật

File export có thể chứa thông tin xác thực nhạy cảm. Metadata chỉ giữ origin của trang và loại bỏ credentials, path, query cùng fragment, nhưng cookies và `localStorage` vẫn được giữ nguyên. Phiên bản hiện tại hỗ trợ JSON hoặc Base64; Base64 không phải encryption. Không chia sẻ file export với người không tin cậy.

File import được kiểm tra schema, domain, số lượng item và kích thước trước khi áp dụng. Import khác website cần xác nhận; cookie sau đó được giới hạn thành host-only cookie của tab hiện tại. Chỉ import snapshot từ nguồn tin cậy.

## Liên hệ

Thông tin hỗ trợ được công bố trong trang phát hành và giao diện extension.
