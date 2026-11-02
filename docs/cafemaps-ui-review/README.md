# CafeMaps — UI review local

Ngày kiểm tra: 2026-11-01. Ảnh chụp UI thật. Bản portfolio so sánh ở port 3002 đã dùng bộ sưu tập, quiz và CMS; bản gốc port 3000 giữ nguyên.

## Môi trường

- Frontend: http://localhost:3010/vi
- CMS: http://localhost:5173
- Backend: http://localhost:3005/api
- Database: bản sao local riêng `cafe_portfolio_preview`, sao từ `cafe_finder_local`. Các thao tác lưu quán và hoàn thành quiz chỉ ghi vào bản sao.
- Giữ nguyên portfolio ở 3000 và bản so sánh ở 3002. Không chỉnh source CafeMaps/CMS/backend.

## Đã kiểm tra

- Đăng nhập frontend và CMS.
- Khám phá, chi tiết quán, lọc vibe Yên tĩnh.
- Lưu 3 quán vào thư mục Yêu thích; dữ liệu thử trong DB local.
- Hoàn thành quiz 12 câu; màn kết quả tải đầy đủ.
- CMS tìm quán, mở editor Em có café – Nguyễn Trãi, chuyển tab Cơ bản / Giờ & Giá / Media.
- Mở giao diện blog, tạo quán và đóng góp; chưa gửi form.
- Mobile 390 × 844: khám phá, bộ sưu tập, đóng góp không tràn ngang trang.
- Chưa kiểm tra upload, gửi email, xuất bản, lưu thay đổi quản trị.

## Chọn ảnh cho portfolio

Giữ bố cục editorial ở 3002. Khám phá + chi tiết làm nội dung chính; bộ sưu tập + quiz làm nội dung cho ô cuộn chậm. CMS trình bày riêng để kể phần quản trị. Form đóng góp trống chỉ dùng tham chiếu, chưa phù hợp làm ảnh nổi bật. Chọn các cụm UI đầy đủ, tránh cắt ngang card hoặc chữ.

## Ảnh

- [Khám phá quán](client-discover.webp)
- [Chi tiết quán](client-detail.webp)
- [Lọc theo vibe](client-discover-filtered.webp)
- [Bộ sưu tập có 3 quán](client-saved-populated.webp)
- [Câu hỏi quiz](client-quiz-question.webp)
- [Kết quả quiz](client-quiz-result.webp)
- [Chọn cách đóng góp](client-contribute.webp)
- [Form chủ quán — chưa nhập dữ liệu](client-owner-form.webp)
- [CMS tổng quan](cms-dashboard.webp)
- [CMS danh sách quán](cms-cafes.webp)
- [CMS thông tin cơ bản](cms-edit-basic.webp)
- [CMS giờ mở cửa và giá](cms-edit-hours.webp)
- [CMS ảnh và menu](cms-edit-media.webp)
- [Mobile khám phá](client-mobile-discover.webp)
- [Mobile bộ sưu tập](client-mobile-saved.webp)
- [Mobile đóng góp](client-mobile-contribute.webp)

## Bản English đã áp dụng

Bản so sánh: http://localhost:3002/#work-cafemaps. Tên hiển thị: **Cafe Maps**.

- Ô lớn: UI khám phá và chi tiết bằng English, chuyển dọc sau 8,5 giây, có chọn màn và Pause. UI khám phá giữ trọn hàng hai card có nội dung English; cắt tại khoảng trắng giữa các hàng, không cắt card.
- Ô phụ: gallery và câu hỏi quiz English, giữ tĩnh.
- CMS: Catalogue, Submissions, Review trong khung lớn; trình Media nằm bên cạnh. Blog trống và dashboard thiếu analytics nên chưa dùng làm ảnh nổi bật.
- CMS nguồn: `/Users/nguyentanluc/orca/workspaces/cms/feat-multi-language`, port 5173. English chọn qua bộ chọn ngôn ngữ thật. Các request dữ liệu của phiên chụp được chuyển sang backend local 3005, dùng DB bản sao; không đổi cấu hình CMS đang chạy.
- Ảnh Submissions và Review đã che thông tin người gửi. Giữ nguyên tên riêng, nội dung đóng góp trong dữ liệu thật; không dịch giả bằng cách sửa DOM.
- Chỉ xem các màn quản trị; không lưu, duyệt, xóa hoặc gửi phản hồi. Quiz English đã hoàn thành trên DB bản sao để kiểm tra; ảnh trên homepage dùng câu hỏi quiz.

Ảnh đang dùng trong `public/images/work/cafemaps/`: `en-discovery.webp`, `en-detail.webp`, `en-quiz.webp`, `en-cms-cafes.webp`, `en-cms-submissions.webp`, `en-cms-review.webp`, `en-cms-media.webp`.

## Mở rộng tour — 2026-11-01

Thay cho tour 2 public + 3 CMS ở mốc trên:

- Public: Explore → Cafe details → Saved → Quiz → Contribute.
- CMS: Catalogue → Editing → Submissions → Moderation. Không dùng Overview vì dashboard chưa đủ dữ liệu; Submissions và Moderation vẫn che thông tin người gửi.
- Mỗi màn 6,5 giây, gồm chuyển động 1,2 giây; chọn trực tiếp sẽ giữ màn, Play chạy tiếp. Giữ global Pause, dừng khi ngoài viewport/tab ẩn/hover/focus và reduced motion. Nút trên mobile có chiều cao tối thiểu 44px.
- `en-contribute.webp`: ảnh English thật từ frontend local, chưa gửi form.
- `en-saved.webp`: bộ sưu tập English đã đăng nhập, có 4 quán và 2 thư mục trong DB preview. Chụp trọn heading, nhóm thư mục, bộ lọc và hàng 3 card đầu tiên; cắt ở khoảng trắng trước hàng tiếp theo. Không đưa thông tin tài khoản vào ảnh. Giữ tên riêng và tên thư mục từ dữ liệu thật; không sửa DOM để giả bản dịch. Chỉ xem và lọc, không thêm/xóa quán hoặc thư mục.
- `en-cms-editing.webp`: crop từ ảnh media editor English đã có, giữ trọn nhóm cover/thumbnail. Không phải editor Basic toàn cảnh. Ảnh đầy đủ vẫn nằm cạnh tour; không lưu thay đổi quản trị.
- Không chỉnh code Cafe Maps/CMS, bốn section CJ hoặc worktree 3000/3001.

Kiểm tra mốc mở rộng: `npm run build` pass; lint component và regression script không có lỗi (còn warnings `no-img-element` có sẵn); `scripts/check-work-showcase.mjs` pass trên port 3002, gồm chọn đủ các màn, giữ màn thủ công, tự chạy 5–7 giây, Pause và reduced motion. Kiểm tra ảnh desktop/mobile 1440/390/320px: assets tải đủ, không tràn ngang.

## Chỉnh nhịp và bỏ nội dung trùng

Theo phản hồi mới: đổi nhịp cả hai tour từ 6,5 xuống 3,5 giây, chuyển dọc từ 1,2 xuống 0,65 giây. Bỏ ô quiz tĩnh bên phải; Quiz chỉ còn trong tour public. Bỏ hẳn cột ảnh bên phải vì lặp nội dung Cafe details và crop dọc quá nhiều. Tour public chiếm một hàng, khung desktop cao tối đa 620px, ảnh dùng contain; mobile giữ tỷ lệ 6:5. Giữ chọn màn, Pause/Play, reduced motion và các điều kiện tự dừng. Regression kiểm tra Quiz chỉ xuất hiện một lần và nhịp chuyển trong khoảng 3–4,5 giây.

## Bố cục đã chọn — giữ ba ô

Phản hồi mới nhất yêu cầu giữ bố cục ban đầu: một tour lớn bên trái, hai ô nhỏ bên phải; mobile xếp dọc. Khôi phục gallery nguyên tỷ lệ ở ô trên, thay câu hỏi quiz bị trùng ở ô dưới bằng kết quả quiz thật (`en-quiz-result.webp`, crop trọn persona và ba nhóm đặc điểm từ ảnh English đã chụp). Một số tags từ dữ liệu backend vẫn tiếng Việt; không dịch giả. Giữ tour public 5 màn, CMS 4 màn, nhịp 3,5 giây và chuyển động 0,65 giây. Các phương án kéo ảnh dọc và một ô toàn chiều ngang ở mốc trên đã bỏ.

## Thu gọn theo tham chiếu Artifacts

Đối chiếu trực tiếp `https://neelsaswade.com/#work-artifacts` ở viewport 1440px: cụm demo tham chiếu cao khoảng 440px; bản Cafe Maps trước chỉnh gần 770px. Giữ ba ô 1 lớn + 2 nhỏ, đổi tỷ lệ cụm public thành 2,4:1 (khoảng 468px tại cùng viewport), bỏ headline/eyebrow trang trí trong các ô, bỏ slogan và nền lồng trong khung public. Giữ stats, controls và các màn demo. Các ô dùng một sắc nền trung tính, gallery nguyên tỷ lệ. CMS cũng giảm padding, heading và chiều cao media; mobile tiếp tục xếp dọc, giữ nút 44px và ảnh contain. Regression có giới hạn chiều cao desktop 500px để tránh phình trở lại.
