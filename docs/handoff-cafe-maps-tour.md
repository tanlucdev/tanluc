# Orca handoff — mở rộng tour Cafe Maps

## Yêu cầu mới nhất — thực hiện trong session tiếp theo

Người dùng chưa hài lòng vì nhiều trang nhưng ô lớn chỉ chuyển giữa hai màn. Đã thống nhất hướng sửa:

- Tour sản phẩm **5 chặng**: Explore → Cafe details → Saved → Quiz → Contribute.
- Mỗi chặng dùng UI thật bằng English, giữ khoảng dừng **5–7 giây**, chọn trực tiếp được, có Pause/Play.
- CMS có tour riêng: Overview → Catalogue → Editing → Moderation. Chọn các màn có nội dung thật, khác nhiệm vụ; không chỉ phóng lớn một bảng danh sách.
- Giữ style editorial sạch, ấm, Newsreader italic + Geist. Không chia thêm nhiều ô nhỏ hoặc dựng CMS giả.
- Tên hiển thị **Cafe Maps**. Không quay lại `Cafemaps`.

Yêu cầu hiện tại là **handoff sang session kế tiếp để sửa**. Session tạo file này chỉ bàn giao; chưa mở rộng hai tour. Session tiếp theo cần triển khai và kiểm tra, không dừng ở đề xuất.

## Đúng workspace

**Sửa tại:** `/Users/nguyentanluc/orca/workspaces/tanluc-portfolio/feature-cafemaps-editorial-study`

- Branch: `feature/cafemaps-editorial-study`.
- Preview: http://localhost:3002/#work-cafemaps
- Đây là worktree đang có bản được người dùng chọn. Có nhiều thay đổi chưa commit và assets chưa tracked: kiểm tra Git trước, giữ nguyên, không reset/clean.
- Không sửa bản gốc `/Users/nguyentanluc/orca/workspaces/tanluc-portfolio/feature-work-and-showcase` ở port 3000 hoặc bản CJ ở 3001.
- Giữ nguyên **bốn section CJ**, hero, About, Photography, MedicHIMS, ISB. Không mở rộng nhiệm vụ sang MedicHIMS theo handoff cũ.
- File `docs/handoff-cafemaps-medichims.md` là handoff lịch sử, nhiều mô tả đã cũ. File hiện tại và code trong workspace là mốc tiếp tục.

## Hiện trạng đã triển khai

- `src/content/home-showcase.ts`: title và navigation là Cafe Maps; anchor vẫn `#work-cafemaps`. Stats: **15,000+ visitors · 40,000+ page views**; giữ nguyên ý nghĩa.
- `src/components/home/WorkShowcase.tsx`:
  - `CafeScreenTour`: dùng lại cho hai tour, timer hiện **8500 ms**. Trượt dọc 1,2 giây, tự dừng ngoài viewport, tab ẩn, reduced motion, global Pause motion, hover/focus trên vùng ảnh.
  - Chọn màn thủ công sẽ giữ màn đó; Play chạy tiếp. Chỉ link của màn hiện tại nhận focus (`inert`/`aria-hidden` cho màn khác).
  - `CafeMapsMedia`: ô lớn mới có Explore + Cafe details. Bên phải gallery và quiz **tĩnh**.
  - Tour CMS mới có Catalogue + Submissions + Review; bên cạnh là ảnh Media editor tĩnh.
- `src/components/home/WorkShowcase.module.css`: toàn bộ style bắt đầu bằng `cafe`; hai tour có kích thước ổn định, ảnh dùng `object-fit: contain`.
- `scripts/check-work-showcase.mjs`: có kiểm tra chọn màn, tự chạy, Pause, reduced motion, link focus, desktop/mobile. Hiện hardcode danh sách 2 màn public và 3 màn CMS: phải cập nhật theo nội dung cuối.

Không cần thiết kế lại toàn bộ. Mở rộng danh sách màn và điều chỉnh nhịp/chỗ ảnh phụ nếu trùng nội dung. Giữ UI đủ lớn; cắt ở ranh giới nhóm hoàn chỉnh, không cắt ngang card/chữ. Mobile không tràn ngang hoặc làm cụm chọn màn quá chật.

## Assets và nguồn UI thật

Assets English đang dùng: `public/images/work/cafemaps/`

- `en-discovery.webp`: discovery English ở viewport 1200, giữ trọn hàng **hai** card Em có và Cà rề; các mô tả/nhãn hiển thị là English. Không còn bố cục ba card lớn cũ.
- `en-detail.webp`: trang chi tiết; còn một action hardcode tiếng Việt trong frontend thật. Không sửa DOM để giả bản dịch. Chọn nhóm UI phù hợp hoặc báo giới hạn nếu ảnh hưởng.
- `en-quiz.webp`: câu hỏi thứ hai của quiz bằng English, đã tải đầy đủ.
- `en-cms-cafes.webp`, `en-cms-submissions.webp`, `en-cms-review.webp`, `en-cms-media.webp`: CMS English thật. Ảnh Submissions/Review **đã che thông tin người gửi**.
- `editorial-gallery.webp`: nhóm gallery hoàn chỉnh, vẫn đang dùng.
- Các `preview-*.webp` cũ chủ yếu tiếng Việt; không tái dùng cho tour English.

Chưa có ảnh English phù hợp cho Saved, Contribute, CMS Overview và màn Editing toàn cảnh. Cần vào UI thật để chọn/chụp thêm.

Review lịch sử và index: `docs/cafemaps-ui-review/README.md`.
Ảnh PNG nguồn English còn ở `/tmp/cafemaps-en/`; ảnh cũ ở `/tmp/cafemaps-ui-captures/`. `/tmp` có thể mất: không phụ thuộc duy nhất vào đó.

## Local apps — kiểm tra tiến trình trước khi chạy

- **CMS mới của người dùng:** http://localhost:5173/dashboard
  - CWD thực tế: `/Users/nguyentanluc/orca/workspaces/cms/feat-multi-language`.
  - Có combobox Language; chọn **English** qua UI.
  - Không nhầm với CMS cũ `/Users/nguyentanluc/tanlucdev/cafe/cms`.
  - Có hai process ở port 5173: bản mới bind IPv6 `::1`, bản cũ bind IPv4 `127.0.0.1`. `localhost` đã mở bản mới. Xác minh giao diện và CWD, không tự dừng server người dùng.
  - `.env` bản mới trỏ API remote `https://cafe-finder-be.onrender.com/api`. Phiên chụp trước chuyển request **chỉ trong browser capture context** sang `http://127.0.0.1:3005/api` bằng `route.fetch` + `route.fulfill`. Không sửa `.env` hoặc runtime server của người dùng.
- **Frontend:** `/Users/nguyentanluc/tanlucdev/cafe/fe-uiux`, http://localhost:3010/en
- **Backend:** `/Users/nguyentanluc/tanlucdev/cafe/be`, http://localhost:3005/api
- DB riêng cho preview: `cafe_portfolio_preview`, bản sao local của `cafe_finder_local`. Không ghi source DB hoặc remote Supabase.
- Launcher `/tmp/run-cafemaps-preview.py`: `python3 /tmp/run-cafemaps-preview.py fe-uiux` hoặc `be` nếu server cần chạy lại. Đọc trước khi dùng. Không dùng nhánh `cms` để thay server CMS mới.
- Node 22: `/Users/nguyentanluc/.nvm/versions/node/v22.23.1/bin`.
- Admin credentials đã được người dùng cung cấp trong hội thoại Orca. Không ghi lại mật khẩu vào repo, tài liệu, output hoặc screenshot. Auth states và script chứa credentials của phiên trước đã xóa.

Frontend có thay đổi sẵn của người dùng, không revert. Nhiệm vụ chỉ sửa portfolio; không chỉnh source ứng dụng để dàn dựng screenshot.

## Kinh nghiệm chụp

Dùng browser skill và công cụ đang có. Kết nối in-app Browser các lần trước lỗi `Cannot redefine property: process`; đã dùng Chrome + Playwright local để chụp/test:

- Module: `/Users/nguyentanluc/.nvm/versions/node/v22.23.1/lib/node_modules/rea-agents/node_modules/playwright-core/index.mjs`
- Chrome: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- `goto`/`waitForURL`: `waitUntil: 'domcontentloaded'`, tránh chờ assets vô hạn.
- Chờ fonts và decode **ảnh đang hiện**, không chờ mọi ảnh lazy/hidden; đặt timeout hữu hạn. Media editor từng chụp quá sớm thành ảnh trắng: kiểm tra trực quan trước khi dùng.
- CMS login English: input `name=email`, `name=password`; nút **Log in**.
- CMS nav: Dashboard, Cafes, Blog, Submissions. Editor tabs: Basic, Location, Hours & pricing, Media, Details, Publish.
- Tìm Em có bằng textbox `Search cafe name, district, vibe...`, chọn row có Nguyễn Trãi; có hai quán Em có khác nhau.
- Editor panel: `page.locator('#cafe-drawer-form').locator('..')`.
- Submissions: mở row Cotton hub → Review. Overlay phải đóng bằng `Close review panel` trước khi click sidebar. Tab `Review & respond` có các control English.
- Che dữ liệu người gửi khi chụp: mask `tbody tr td:nth-child(3) p`; không đưa screenshots chứa email/tên cá nhân vào public.
- Dashboard hiện thiếu Vercel analytics; Blog trống. Không giả số liệu hoặc đưa skeleton vào showcase. Nếu Overview chưa có ảnh đủ tốt, chọn màn quản trị thật khác có giá trị, ghi rõ lựa chọn trong kết quả.
- FE login English: input `name=email`, `name=password`, nút `Let’s go`.
- Saved đã có 3 quán trong DB bản sao, thư mục Yêu thích. Có thể dùng bộ lọc All bằng English; tên riêng/thư mục từ dữ liệu thật không tự dịch giả.
- Quiz: chọn `button.group.relative:visible`, đợi câu h2 thay đổi. Submit **Lock this mood**, chờ **Brew again**. Kết quả English đã test; backend còn vài tags tiếng Việt. Shared-link preview có notice, không giả làm kết quả hoàn thành.
- Chặn analytics/external writes trong capture context. Không upload, publish, approve/reject, gửi email hoặc lưu admin chỉ để có screenshot. Kiểm tra UI đọc là đủ.

## Kiểm tra và hoàn tất

1. Đọc AGENTS.md và guide Next.js liên quan trong `node_modules/next/dist/docs/` trước khi sửa.
2. Chụp thêm màn English còn thiếu; lưu WebP hợp lý, xác minh ảnh thật tải đủ, không lộ thông tin người gửi.
3. Tour public đủ năm chặng; tour CMS thể hiện nhiều nhiệm vụ. Dừng 5–7 giây, controls gọn, hỗ trợ keyboard/reduced motion/global Pause/offscreen.
4. Cập nhật regression có sẵn theo danh sách màn cuối, giữ kiểm tra hành vi thay vì chỉ đếm ảnh.
5. Chạy build, lint, regression, xem screenshot desktop/mobile. Lint hiện có warnings `no-img-element`; không có lỗi.
6. Giữ mọi sửa đổi trong worktree `feature-cafemaps-editorial-study`; không commit/push/deploy hoặc sửa bản 3000/3001.
7. Trả URL http://localhost:3002/#work-cafemaps và nói rõ tour có những màn nào. Không tuyên bố đã sửa nếu mới chụp assets.

Lệnh regression từ worktree:

```sh
BASE_URL=http://localhost:3002 PLAYWRIGHT_MODULE=/Users/nguyentanluc/.nvm/versions/node/v22.23.1/lib/node_modules/rea-agents/node_modules/playwright-core/index.mjs CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node scripts/check-work-showcase.mjs
```

Mốc gần nhất: build, lint và toàn bộ regression đã pass cho phiên bản **2 public + 3 CMS**. Đây chưa phải tiêu chí hoàn tất yêu cầu mở rộng mới.
