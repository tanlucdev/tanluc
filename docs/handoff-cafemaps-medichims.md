# Orca handoff — CafeMaps & MedicHIMS showcase

## Nhiệm vụ

Triển khai tiếp hai Work sections **CafeMaps** và **MedicHIMS** trên homepage portfolio. Giữ ngôn ngữ thị giác của bốn section CJ hiện tại, làm mỗi sản phẩm có câu chuyện riêng. Đây là công việc frontend showcase; không triển khai backend, thanh toán thật hoặc kết nối dữ liệu bệnh nhân.

Chỉ triển khai hai section này. Không sửa bốn section CJ, hero/meadow, About, Photography, ISB hoặc mở rộng các trang case study trong `/work`.

## Mốc và môi trường

- Repository hiện tại: `/Users/nguyentanluc/orca/workspaces/tanluc-portfolio/feature-work-and-showcase`.
- Commit baseline: `f499711` — `feat: establish CJ showcase comparison baseline`.
- Bản đối chiếu: `http://localhost:3000/`.
- Worktree CJ refinement đã tạo: `/Users/nguyentanluc/orca/workspaces/tanluc-portfolio/feature-cj-ui-refinement`, branch `feature/cj-ui-refinement`, cổng `3001`.
- Khi bàn giao, hai worktree cùng ở `f499711`; chưa có bản tinh chỉnh UI riêng. Kiểm tra lại trạng thái thực tế trước khi bắt đầu.
- Giữ hai worktree trên làm đối chiếu. Tạo worktree thứ ba cho nhiệm vụ này, branch `feature/cafemaps-medichims-showcase`, cổng `3002`. Nếu đã tồn tại, kiểm tra và dùng lại đúng worktree thay vì tạo trùng.

Thiết lập dự kiến, chạy từ repository hiện tại sau khi kiểm tra Git:

```sh
git worktree list
git status --short
git worktree add -b feature/cafemaps-medichims-showcase ../feature-cafemaps-medichims-showcase f499711
cd ../feature-cafemaps-medichims-showcase
npm ci --no-audit --no-fund
npm run dev -- --port 3002
```

Dùng Node 22 tương thích nếu Node mặc định quá cũ. Máy trước có Node tại `/Users/nguyentanluc/.nvm/versions/node/v22.23.1/bin`. Không đổi cấu hình Node toàn máy, credentials, router hoặc provider. Không push, merge hay deploy trong nhiệm vụ này. Không ghi đè thay đổi người dùng nếu trạng thái đã khác mô tả.

## Style và phản hồi người dùng

Người dùng thấy style hiện tại đẹp, phù hợp; đồng thời cảm thấy UI và animation còn hơi thô. Hướng tinh chỉnh đã thảo luận, **chưa được triển khai ở branch refinement**:

- Nền sáng ấm, màu chữ nâu/xám dịu, accent nâu tiết chế; tham khảo các màu đang có: `#f8f7f5`, `#eeedeb`, `#fffefd`, `#48433d`, `#a28265`.
- Giữ heading Newsreader italic, body Geist, layout editorial và sticky Work navigation hiện có.
- Giảm nhãn nhỏ, viền lặp và các ô có trọng lượng ngang nhau. Mỗi section cần một điểm nhìn chính.
- Khoảng trống có mục đích; tránh panel lớn nhưng nội dung ít. Mobile phải giữ thao tác và kết quả đủ gần nhau.
- Không sao chép nguyên bố cục hai cột/Properties/footer cho mọi sản phẩm.
- Animation kể quan hệ thao tác–kết quả; giữ thành phần ổn định khi đổi trạng thái. Tránh xuất hiện rời rạc: hình trước, node sau, chữ sau nữa.
- Tiết chế chuyển động. Không thêm hiệu ứng chỉ để trang trông hoạt động; không lặp lỗi validation giả trong mọi kịch bản.
- Giữ Pause/Resume, global Pause motion, dừng ngoài viewport/tab ẩn, hỗ trợ `prefers-reduced-motion` và thao tác bàn phím.
- Hai video CJ có hiệu ứng hé lộ từ trên xuống 1,2 giây được người dùng yêu thích. Giữ nguyên ở CJ; không cần áp dụng máy móc cho mọi media mới.
- Website dùng tiếng Anh. Trao đổi/kết quả bàn giao với người dùng bằng tiếng Việt.

## CafeMaps

Hiện trạng:

- Anchor `#work-cafemaps`, component `CafeMapsMedia`, media `cafemaps`.
- Là một screenshot liên kết tới `https://cafemaps.net`, kèm các stats chips.
- Asset thật có sẵn: `public/images/work/cafemaps/website.jpg`.
- Bối cảnh: sản phẩm độc lập khám phá quán cà phê tại TP.HCM; người dùng tự phát triển từ ý tưởng tới triển khai, gồm Next.js, NestJS, PostGIS, admin và deployment.
- Số liệu mới nhất do người dùng nêu trong hội thoại: **15,000+ visitors, 40,000+ page views**. Ưu tiên wording này; không chuyển thành monthly visitors hoặc các chỉ số khác.
- File hiện tại còn ghi `500 registered users`, `15,000 visits`, `50 community-contributed cafes`; `/work` có số liệu cũ khác. Không trộn các mốc thành một bộ số liệu mới. Hai chỉ số mới nhất đủ cho section này; không sửa case study ngoài phạm vi.

Hướng trình bày đề xuất:

- Kể một hành trình **tìm nhu cầu → lọc khu vực/tiêu chí → chọn quán → xem thông tin**, nhấn mạnh cảm giác khám phá địa điểm.
- Một vùng bản đồ hoặc màn hình khám phá làm trọng tâm; card quán nhỏ xuất hiện gắn với lựa chọn, tránh biến thành dashboard nhiều ô.
- Ưu tiên screenshot thật hoặc giao diện minh họa dựa trên dữ liệu đã xác minh. Có thể bắt đầu bằng asset hiện có, không cần chờ video mới.
- Hai stats nhỏ ở phần kết quả; giữ CTA mở CafeMaps thật.
- Không bịa tên quán, tọa độ, reviews hoặc testimonials rồi trình bày như dữ liệu thật. Với dữ liệu mẫu, ghi rõ minh họa. Không cần tích hợp API bản đồ hoặc thêm dependency để dựng showcase.

## MedicHIMS

Hiện trạng:

- Anchor `#work-onemedic`, title `MedicHIMS`, company `Onemedic`.
- Role trong nguồn hiện tại: Fullstack Developer, Mar–Aug 2025.
- Nội dung đã có: healthcare platform; licensing, subscriptions, pricing/billing UI, NestJS endpoints/backend integration, schema-driven forms và i18n. Billing UI theo state transitions từ backend.
- Media hiện tại là `ProactiveMedia`: video/popups/card animation của sản phẩm tham khảo khác. `referenceMedia: true` và badge `Temporary reference preview; not portfolio work` là cảnh báo có chủ đích.
- `public/images/work/reference/psychic-*` **không phải screenshot MedicHIMS**. Không tái gắn nhãn thành sản phẩm thật.

Hướng trình bày đề xuất:

- Thay media tham khảo bằng một minh họa có câu chuyện **chọn gói/giấy phép → xem giá và subscription → trạng thái cập nhật theo backend**.
- Điểm nhìn chính là gói hoặc trạng thái license/subscription, kèm phần giá/tóm tắt nhỏ thay đổi theo thao tác. Tạo cảm giác rõ ràng, đáng tin cậy; không dùng card xoay mang nội dung sản phẩm khác.
- Chỉ minh họa một luồng đủ rõ; tránh cố nhồi cả dashboard bệnh viện vào section.
- Dùng dữ liệu tổng hợp, không có bệnh nhân/khách hàng thật. Giá, tên gói, điều kiện license và trạng thái cụ thể chưa có tài liệu xác nhận: ghi rõ là ví dụ, không tuyên bố đó là quy tắc sản phẩm thực tế.
- Nếu tự dựng minh họa, thay badge reference cũ bằng nhãn minh họa phù hợp. Không gọi đó là ảnh chụp MedicHIMS thật.
- Không thực hiện thanh toán, đăng ký subscription, gửi form tới dịch vụ thật hoặc thêm endpoint chỉ để phục vụ animation.

## Source map và giới hạn chỉnh sửa

- `src/content/home-showcase.ts`: content, thứ tự, slugs, stats, media mapping.
- `src/components/home/WorkShowcase.tsx`: `CafeMapsMedia`, `ProactiveMedia`, `ProjectMedia`, hooks visibility/motion; có mẫu `useWalkthrough` dùng cho hai demo CJ.
- `src/components/home/WorkShowcase.module.css`: style showcase, CafeMaps, media và các demo CJ.
- `src/components/work/CinematicWorkflow.tsx` và `.module.css`: reference cho palette/motion; giữ nguyên trong nhiệm vụ này.
- `scripts/check-work-showcase.mjs`: regression homepage; hiện có assertion riêng cho stats, navigation, reference badges, video và card MedicHIMS. Cập nhật những assertion bị thay thế bằng kiểm tra hành vi mới có ý nghĩa; không giữ test bắt buộc animation tham khảo cũ.
- `scripts/check-canvas.mjs`: regression CJ canvas/video; giữ hành vi hiện tại.
- `docs/rea-work-showcase.md`: lịch sử reference và giới hạn chứng cứ; không coi mọi giao diện tham khảo là sản phẩm của người dùng.

Đọc `AGENTS.md` trong worktree mới. Next.js 16.2.10: đọc guide liên quan ở `node_modules/next/dist/docs/` trước khi sửa code. Ưu tiên CSS/native platform và dependency đã cài; không thêm abstraction hoặc package chỉ để dựng demo. Tách component mới chỉ khi giúp code dễ đọc. Nếu lựa chọn trường/giá/trạng thái chỉ là ví dụ, dùng comment `ponytail:` nêu giới hạn và nguồn dữ liệu cần thay thế.

## Kiểm tra và tiêu chí hoàn tất

1. Có hai section với câu chuyện riêng; nhìn vẫn thuộc cùng portfolio. Giữ anchors và navigation hoạt động, không thay thứ tự các section khác.
2. Bốn section CJ giữ nguyên, bao gồm hiệu ứng reveal video. Bản `3000` và `3001` không bị sửa hoặc chiếm cổng.
3. Không còn media tham khảo sai sản phẩm ở MedicHIMS; phân biệt asset thật và minh họa. CafeMaps dùng đúng hai số liệu mới nhất nêu trên.
4. Nội dung và khung hình không nhảy khi đổi bước; keyboard/focus rõ; Pause/Resume và reduced motion hoạt động. Trên mobile, không tràn ngang hoặc cắt thao tác chính.
5. Chạy build, lint phần sửa, regression showcase sau khi cập nhật test; kiểm tra desktop/mobile bằng browser và xem screenshot. Thêm kiểm tra nhỏ cho logic mới, không chỉ kiểm tra class CSS.
6. Báo URL `http://localhost:3002/#work-cafemaps` và `http://localhost:3002/#work-onemedic`, file thay đổi, kiểm tra đã chạy và phần dữ liệu còn minh họa.

Môi trường kiểm tra trước dùng `PLAYWRIGHT_MODULE=/Users/nguyentanluc/.nvm/versions/node/v22.23.1/lib/node_modules/rea-agents/node_modules/playwright-core/index.mjs` và `CHROME_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Kiểm tra công cụ đang có và đọc skill browser trước khi dùng browser; các đường dẫn trên chỉ là gợi ý môi trường, không phải yêu cầu cài thêm.

## Khi thiếu thông tin

Tiếp tục phần có thể làm bằng asset hiện có và minh họa được ghi nhãn. Chỉ hỏi các điểm ảnh hưởng tính đúng của nội dung: screenshot/video MedicHIMS được phép dùng, tên gói/luồng license thật, ảnh hoặc dữ liệu CafeMaps cần ưu tiên. Không chặn toàn bộ triển khai vì chưa có video mới. Không suy diễn rằng user đã duyệt một cách bố trí cụ thể: hai hướng kể chuyện ở trên là đề xuất triển khai để review.
