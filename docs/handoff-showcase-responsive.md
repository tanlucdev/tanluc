# Handoff — responsive Work showcase

## Đã triển khai — 2026-11-02, phiên tiếp tục

- Đã áp dụng tại đúng worktree/preview 3002. Phân tích và đề xuất phía dưới được giữ làm lịch sử.
- Dưới 1080px: Cafe Maps có tour chính + hai ô phụ cùng hàng; CMS mở bằng `Behind the scenes`, hỗ trợ keyboard. MedicHIMS chọn một nhóm Services / Document templates; ảnh gốc và full-size link giữ nguyên.
- Dưới 701px: Dynamic Models dùng bộ chọn ba model gọn, bỏ nhãn giới thiệu lặp và giảm vùng trống form; vẫn giữ đủ các trường, trạng thái validation và điều khiển.
- Đã kiểm tra ảnh các section ở 320, 375, 390, 430, 768, 1024, 1280, 1440, 1920px. Ở 390px: Cafe Maps 2037 → 736px, MedicHIMS 1144 → 647px, Dynamic Models 1211 → 861px (CMS đóng, Services được chọn).
- So ảnh desktop toàn bộ sáu section: 1280/1440px khớp pixel; 1920px chỉ lệch làm tròn màu tối đa 1/255, kích thước không đổi. Ảnh QA và số đo ở `/tmp/portfolio-responsive-apply/`.
- Lint, build và toàn bộ regression `check-work-showcase.mjs` đã đạt. Regression có kiểm tra đóng/mở CMS bằng keyboard, đổi nhóm MedicHIMS, resize qua breakpoint (320–1920px) và hai ô phụ cùng hàng.
- Các dòng dưới ghi “chưa triển khai” mô tả thời điểm tạo handoff, không phải trạng thái hiện tại. Không commit/push/merge/deploy.

## Quyết định mới nhất — ưu tiên hơn mọi mô tả lịch sử bên dưới

- **Chỉ chỉnh mobile/tablet. Không thay đổi desktop.** Người dùng đã hỏi rõ và được xác nhận: desktop giữ nguyên bố cục, kích thước, nội dung, màu sắc, animation và hành vi hiện tại.
- Lấy desktop hiện tại làm baseline, gồm Cafe Maps 3 ô gọn. Chụp ảnh trước/sau ở 1280, 1440 và 1920px, cùng trạng thái demo và cùng điều kiện motion để so sánh; tránh coi khác frame animation là lỗi layout.
- Breakpoint desktop layout hiện bắt đầu ở 1080px. Ưu tiên khoanh thay đổi trong media query mobile/tablet, không sửa global rule rồi vô tình đổi desktop. Nếu cần thay markup/logic, giữ output và keyboard/accessibility desktop tương đương; kiểm tra resize qua breakpoint.
- Session cuối **chỉ phân tích responsive rồi cập nhật handoff**, chưa triển khai những đề xuất bên dưới. Session mới được yêu cầu tiếp tục chỉnh theo handoff, không chỉ trả lại phân tích.

## Yêu cầu mới nhất

Người dùng thấy các phần showcase chưa responsive tốt. **Session kế tiếp cần kiểm tra và triển khai responsive**, không dừng ở đề xuất. Lượt tạo handoff này chỉ ghi tài liệu, chưa sửa UI.

Desktop là phần cần bảo toàn, không phải phạm vi tinh chỉnh tiếp: tinh tế, clean, tối giản; Cafe Maps vẫn **3 ô: 1 lớn trái + 2 nhỏ phải**. Người dùng đã phản đối việc bỏ các ô, đổi thành một ô toàn chiều ngang hoặc kéo ảnh bên phải thành ảnh dọc lớn.

## Đúng workspace và preview

- Sửa ở `/Users/nguyentanluc/orca/workspaces/tanluc-portfolio/feature-cafemaps-editorial-study`.
- Branch `feature/cafemaps-editorial-study`.
- Preview: http://localhost:3002/#work-cafemaps và http://localhost:3002/#work-onemedic.
- Workspace mở ban đầu `/Users/nguyentanluc/orca/workspaces/tanluc-portfolio/feature-work-and-showcase` là **bản cũ port 3000**, không phải bản cần sửa.
- Khi tạo handoff: 3000 đang chạy PID 72181; 3002 đang chạy PID 83025. PID có thể thay đổi; kiểm tra trước, không dừng server người dùng.
- Bản 3002 vừa được khởi động lại bằng `npm run dev -- --port 3002` trong đúng worktree, đã xác nhận HTTP 200. Không mặc định server còn sống sau khi chuyển session.

Nếu cần khởi động lại:

```sh
cd /Users/nguyentanluc/orca/workspaces/tanluc-portfolio/feature-cafemaps-editorial-study
npm run dev -- --port 3002
```

Node đã có: `/Users/nguyentanluc/.nvm/versions/node/v22.23.1/bin/node`. Nếu shell dùng sai Node, thêm thư mục bin này vào PATH cho riêng lệnh; không đổi cấu hình toàn máy.

## Git và giới hạn

Worktree có nhiều sửa đổi chưa commit. Khi tạo handoff:

- Modified: `scripts/check-work-showcase.mjs`, `src/components/home/WorkShowcase.tsx`, `src/components/home/WorkShowcase.module.css`, `src/content/home-showcase.ts`.
- Deleted có sẵn: `public/images/work/cafemaps/website.jpg`.
- Nhiều ảnh Cafe Maps, toàn bộ `public/images/work/medichims/`, docs review/handoff đang untracked.
- Không reset/clean, không ghi đè thay đổi sẵn. Kiểm tra lại Git trước khi làm.
- Không commit, push, merge, deploy trong nhiệm vụ này. Giữ bản 3000 và 3001 làm đối chiếu.
- Giữ hero, About, Photography và nội dung dự án. Bốn section CJ phải giữ hành vi, nội dung và motion desktop; chỉ sửa responsive có chứng cứ nếu chúng cũng gặp vấn đề.
- UI English, trao đổi với người dùng bằng tiếng Việt.

Đọc `AGENTS.md`. Next.js 16.2.10 yêu cầu đọc guide liên quan trong `node_modules/next/dist/docs/` trước khi sửa. Ưu tiên CSS và platform, không thêm package hoặc hệ thống layout mới chỉ để responsive.

## Mốc Cafe Maps cần giữ

Source: `CafeMapsMedia`, `CafeScreenTour` trong `WorkShowcase.tsx`; CSS bắt đầu bằng `cafe`.

- Tên hiển thị **Cafe Maps**, anchor `#work-cafemaps`.
- Stats: **15,000+ visitors · 40,000+ page views**; không đổi thành monthly.
- Tour public: Explore → Cafe details → Saved → Quiz → Contribute.
- Tour CMS: Catalogue → Editing → Submissions → Moderation.
- Timer 3500ms, transition 0,65 giây. Giữ nhịp này, không quay lại 6,5/8,5 giây.
- Chọn màn thủ công giữ màn; Play chạy tiếp. Giữ Pause/Play, global Pause motion, dừng ngoài viewport/tab ẩn/hover/focus và reduced motion. Chỉ link ảnh hiện tại nhận keyboard focus.
- Ô phải trên: `editorial-gallery.webp`, gallery nguyên tỷ lệ, không kéo dọc/crop cực đoan.
- Ô phải dưới: `en-quiz-result.webp`, kết quả Cozy Plant Corner. Tour chính dùng **câu hỏi** `en-quiz.webp`; không dùng lại câu hỏi đó trong ô phụ.
- Saved đã có ảnh thật sau đăng nhập: 4 quán, 2 thư mục trong DB preview. Ảnh không chứa thông tin tài khoản; giữ nguyên tên riêng/tên thư mục.
- CMS Submissions/Moderation đã che thông tin người gửi. Editing là crop thật của nhóm cover/thumbnail; ảnh editor đầy đủ nằm cạnh tour.
- `en-quiz-result.webp` lấy từ ảnh UI thật, có một số tags dữ liệu tiếng Việt; không sửa DOM/ảnh để giả bản dịch.
- Không cần đăng nhập Cafe Maps/CMS, chụp lại app hoặc sửa source ứng dụng để làm responsive portfolio. Không đưa credentials vào repo, docs, output hoặc screenshot.

## Desktop vừa tinh gọn

Tham chiếu người dùng chỉ rõ: https://neelsaswade.com/#work-artifacts.

Đã mở và so sánh trực tiếp ở viewport 1440px: cụm 3 ô tham chiếu cao khoảng 440px. Cafe Maps trước chỉnh gần 770px, bản mới khoảng 468px.

Giữ tinh thần này:

- `.cafePublic`: cột 1.7fr / 1fr; 2 hàng; `aspect-ratio: 2.4`; gap 12px / 20px.
- Ba ô cùng nền trung tính `#eeede9`, padding khoảng 18px, bo góc 12px.
- Bỏ headline/eyebrow trang trí trong ô public và slogan; giữ project header bên ngoài, stats, controls.
- Ảnh tour `object-fit: contain`; không cắt thêm nội dung screenshot để lấp ô.
- Gallery/result dùng grid track `minmax(0, 1fr)` và giới hạn cả chiều rộng/cao để ảnh không vượt ô.
- CMS đã giảm padding, heading, chiều cao ảnh; vẫn là tour riêng ở dưới public.

Không trả lại kích thước lớn trước đây. Không dùng `overflow: hidden` ở cấp trang để che lỗi responsive.

## Phân tích responsive vừa thực hiện — 2026-11-02

Người dùng thấy bản mình “thô, đầy ắp hình và thông tin”, muốn học cách trình bày gọn, súc tích của https://neelsaswade.com/. Đây là vấn đề chọn và phân cấp nội dung ở màn nhỏ, không chỉ là giảm padding, font hoặc đạt điều kiện không tràn ngang.

Đã kiểm tra trực tiếp bản 3002 ở 390px và 768px bằng Chrome/Playwright, chưa sửa code. Nhận xét có chứng cứ:

- Ở 390px, Cafe Maps sau khi ảnh tải đủ dài khoảng **2.038px**, hơn hai viewport 844px. Chú ý đo sau decode ảnh; số đo trước lazy loading có thể thấp hơn và gây hiểu lầm.
- Mobile đang xếp dọc tour public, gallery, kết quả quiz, tour CMS và ảnh editor đầy đủ. Năm phần đều chiếm sự chú ý tương đối ngang nhau; public có 6 nút và CMS có 5 nút hiện cùng với các nhóm ảnh.
- Screenshot nguyên giao diện chứa navbar, bộ lọc, bảng, form, borders và nhãn. Thu nhỏ làm chữ li ti nhưng vẫn giữ mật độ thị giác cao. Nền portfolio nhạt không tự làm phần UI bên trong đơn giản hơn.
- MedicHIMS khoảng 1.145px ở 390px: hai gallery với heading, description, màn chọn, ảnh, caption, View full size, source note, rồi summary dự án. Nhiều lớp giải thích và thao tác xuất hiện ngay từ đầu.
- Dynamic Models khoảng 1.211px ở 390px: toàn bộ library, form properties, vùng trạng thái và summary xếp dọc. Có thể cần rút gọn trình bày mobile trong khi giữ nguyên chức năng/desktop.
- Ở 768px, Cafe Maps vẫn như desktop thu nhỏ: ba ô và hai cột CMS làm ảnh/phần phụ rất nhỏ, khoảng trống trong panel vẫn lớn. Cần bố cục tablet có chủ đích.

Hướng đề xuất đã trao đổi để session sau thực hiện/kiểm tra:

1. Mỗi dự án ưu tiên một demo chính và một ý chính khi mở đầu; các chi tiết khác mở khi người xem muốn tìm hiểu.
2. Cafe Maps mobile: giữ một khung chính, hai ô phụ nhỏ cạnh nhau ở dưới thay vì ba khối lớn xếp dọc. Vẫn giữ gallery và kết quả quiz khác nhau, không quay lại câu hỏi quiz trùng.
3. CMS mobile/tablet chuyển thành phần mở thêm, ví dụ “Behind the scenes”; vẫn truy cập được các màn, Pause/Play và ảnh đầy đủ khi mở. Desktop CMS giữ nguyên.
4. MedicHIMS mobile/tablet ưu tiên một chủ đề mỗi lần, chẳng hạn Services / Templates; tránh đưa cả hai chuỗi ảnh, caption và mọi màn chọn vào luồng mặc định. Đây là hướng trình bày, không được thay dữ liệu hoặc bỏ khả năng xem các ảnh thật.
5. Chọn khung ảnh/crop theo một nhóm UI hoàn chỉnh đủ lớn để hiểu; ảnh đầy đủ vẫn có đường mở riêng. Không giả bản dịch, không cắt ngang control/card. Nếu dùng asset riêng cho mobile, không thay asset desktop đang dùng.
6. Giảm lớp nhãn/description lặp trên mobile; giữ thông tin cần thiết, stats chính xác và điều khiển truy cập được. Không giảm chữ xuống li ti để nhét vừa toàn bộ desktop.

Đây là các hướng chỉnh trong phạm vi mobile/tablet, **không phải phê duyệt thiết kế cụ thể từng breakpoint**. Tự triển khai bản có thể review, kiểm tra ảnh rồi tinh chỉnh. Không mở rộng thành redesign desktop.

### Giới hạn chứng cứ Neels

Lần kiểm tra 2026-11-02, trang Neels trả trang xác minh Cloudflare ở cả 390px và 768px. Chưa quan sát trực tiếp được responsive của họ trong lần này; không tuyên bố họ ẩn/hiện phần nào trên mobile. Quan sát Artifacts desktop 1440px ở phần trước là từ phiên đã truy cập được. Không bypass verification. Có thể thử xem lại qua Browser hợp lệ ở session mới; nếu vẫn bị chặn, tiếp tục cải thiện bản mình theo các vấn đề đã xác minh, nói rõ giới hạn.

Ảnh và script phân tích tạm: `/tmp/portfolio-responsive-review/` (`local-390-work-cafemaps.png`, `local-390-work-onemedic.png`, `local-390-work-wala-ict.png`, các bản 768px). Có thể mất sau khi đổi session; không phụ thuộc duy nhất vào /tmp. Không đưa ảnh Cloudflare vào tài liệu như ảnh UI Neels.

## Hiện trạng responsive — cần đánh giá lại

**Có CSS responsive cơ bản, nhưng chưa đồng nghĩa trải nghiệm đạt yêu cầu.** Người dùng mới xác nhận còn vấn đề; các kiểm tra trước chỉ là mốc kỹ thuật.

- Breakpoint Cafe Maps hiện chủ yếu ở 700px: xếp dọc 3 ô, bỏ aspect ratio toàn cụm; main viewport tỷ lệ 6:5.
- Controls nhỏ 10px; ở mobile xếp 3 cột `max-content`, nút cao tối thiểu 44px. Cần xem nhãn dài, wrap, Pause/Play, khoảng trắng và cỡ đọc thực tế.
- 701–1079px có thể giữ 3 ô trong khi phần rail biến mất ở 1079px; cần xét breakpoint theo nội dung, không chỉ không tràn ngang.
- Ảnh desktop thu nhỏ trên mobile có thể quá nhỏ để hiểu; cân nhắc cách trình bày/crop có ý nghĩa hoặc mở ảnh đầy đủ, tránh giả giao diện và không cắt ngang nhóm UI.
- Kiểm tra tỷ lệ khung, vùng trắng, ảnh sidebar CMS, thứ tự nội dung và khoảng cách giữa thao tác/kết quả.

### MedicHIMS hiện tại khác handoff cũ

Code trong worktree đã có thay đổi bổ sung, **phải giữ và đọc trực tiếp**:

- `media: "medichims"`, `MedicHimsMedia`, `MedicHimsGallery` trong cùng `WorkShowcase.tsx`.
- Ảnh thật tại `public/images/work/medichims/`; không còn lấy preview tham khảo Psychic làm mốc.
- Hai gallery: Services & billing (Purchases / Select a package / Price breakdown) và A structure for every form. (Field configuration / Template settings / New template / New subsection).
- Gallery chọn màn thủ công; viewport cuộn có keyboard focus và link View full size.
- `.medicFigure` desktop rộng 80%; khung dài tỷ lệ 1.82; form ngắn dùng `data-compact=true` để vừa ảnh, không có khoảng trống thừa.
- **Đã đối chiếu lại source 2026-11-02:** CSS mobile hiện dùng `.medicViewport { aspect-ratio: 1.82; max-height: min(360px, 62svh); }` và ảnh `width: 100%; max-width: 100%`. Mô tả ảnh rộng 760px/ratio 1.2 ở handoff cũ đã lỗi thời. Vẫn cần đánh giá chữ nhỏ, thông tin dày và độ dài hai gallery; không revert về code cũ.
- Không đổi screenshot, dữ liệu, mô tả hoặc luồng nghiệp vụ chỉ để bố cục gọn hơn. Giữ phân biệt form ngắn/ảnh dài.

## Source map

- `src/components/home/WorkShowcase.tsx`: demos Cafe Maps, MedicHIMS, visibility/motion, điều hướng Work.
- `src/components/home/WorkShowcase.module.css`: CSS `cafe*`, `medic*`, breakpoint layout/rail, styles chung.
- `src/content/home-showcase.ts`: metadata và thứ tự dự án; hiện có 4 section CJ + Cafe Maps + MedicHIMS. Không suy ra từ danh sách cũ trong handoff trước.
- `src/components/work/CinematicWorkflow.tsx` và CSS liên quan: CJ canvas; chỉ đọc/giữ hành vi trừ khi có lỗi responsive cụ thể.
- `scripts/check-work-showcase.mjs`: regression hiện tại đã có kiểm tra riêng MedicHIMS. Đọc bản mới, không khôi phục bản cũ từ transcript.
- `docs/cafemaps-ui-review/README.md`: lịch sử lựa chọn UI; phần cuối mới nhất. `docs/handoff-cafe-maps-tour.md` và `docs/handoff-cafemaps-medichims.md` là lịch sử, không ghi đè code hiện tại theo chúng.

## Kiểm tra và tiêu chí bàn giao

1. Kiểm tra thực tế các section Work trên 320, 375/390, 430, 768, 1024, 1280, 1440px; cả portrait/landscape khi có ích. Chọn layout theo nội dung, không bắt mọi cỡ nhỏ giữ 3 cột.
2. Desktop không thay đổi so với baseline: bố cục Cafe Maps 3 ô, kích thước, nội dung và animation. Đối chiếu screenshot trước/sau. Mobile/tablet có thứ tự rõ, giảm mật độ thông tin, chữ/controls đọc và dùng được; không chỉ đạt assertion không tràn ngang.
3. Không cắt card/chữ/control ở ranh giới nhóm, không bóp méo ảnh, không nhảy khung khi chọn màn. Stats đúng, screenshot thật, nhịp 3,5 giây giữ nguyên.
4. Giữ keyboard focus, touch targets, Pause/Play, reduced motion, offscreen/tab pause và cuộn ảnh MedicHIMS hoạt động. Không tạo bẫy cuộn hoặc focus.
5. Chạy build, lint phần sửa, cập nhật regression theo hành vi cuối; xem ảnh chụp desktop/mobile/tablet trực tiếp. Kiểm tra CJ không bị ảnh hưởng.
6. Báo URL 3002, những breakpoint/hành vi đã sửa, checks thực chạy và giới hạn còn lại. Không tuyên bố responsive hoàn tất chỉ từ việc không tràn trang.

Mốc kiểm tra của session trước: build/lint (warnings `no-img-element`, không lỗi) và toàn bộ regression pass sau khi thu gọn Cafe Maps. Có ảnh QA tạm ở `/tmp/tour-*.png`; `/tmp` có thể mất, không phụ thuộc duy nhất vào đó. Chưa chạy lại các checks trong lượt tạo handoff này vì chỉ sửa tài liệu; code đã có thay đổi MedicHIMS bổ sung.

Regression:

```sh
BASE_URL=http://localhost:3002 \
PLAYWRIGHT_MODULE=/Users/nguyentanluc/.nvm/versions/node/v22.23.1/lib/node_modules/rea-agents/node_modules/playwright-core/index.mjs \
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
node scripts/check-work-showcase.mjs
```

Browser: đọc skill Browser trước. Kết nối in-app Browser phiên trước lỗi `Cannot redefine property: process`; đã fallback Chrome + Playwright local theo các đường dẫn trên. Không cần reverse engineer hoặc kết nối API thật cho nhiệm vụ responsive.
