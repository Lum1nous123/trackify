Mình kiểm tra “Recent Activity” và có thể giải thích đúng hiện tượng bạn thấy như sau:

## Vì sao có 2 dòng “trùng” (cùng công ty + cùng pill status)?
- UI hiển thị từng item trong `recentItems`:
  - `fe/src/features/dashboard/components/RecentActivity.tsx`
- `recentItems` được build từ **nhiều activity event**:
  - `fe/src/app/dashboard/page.tsx`
  - Dùng `(kanban.cards[].activity[]).flatMap(...)` rồi `sort` theo `activity.changedAt` và `slice(0,4)`.
- Mỗi `activity` (tức 1 bản ghi history theo thời gian) map thành **1 dòng** trong RecentActivity.

👉 Vì vậy nếu **một job/card** đã có **2 lần thay đổi** trong thời gian gần (2 record `JobStatusHistory` khác nhau), thì sẽ có **2 dòng** cùng công ty/position. Đây là “trùng” theo cảm nhận người dùng, nhưng thực chất là “2 event”.

## Vì sao pill status giống nhau nhưng thời gian khác nhau?
Trong `dashboard/page.tsx`:
- **Thời gian** lấy từ `activity.changedAt` → `whenText: ... relTimeFromIso(activity.changedAt)`
- **pill status** lại lấy từ `card.status hiện tại` (không lấy theo event):
  - `stText = statusText(card.status)`
  - `tint = tintFromStatus(card.status)`

👉 Nên có thể xảy ra cảnh:
- Job có 2 activity event khác thời điểm (2 dòng khác nhau)
- Nhưng sau nhiều lần cập nhật, **trạng thái hiện tại (`card.status`) vẫn đang là INTERVIEW**, nên cả 2 dòng đều hiện pill “Interviewing”, dù thời điểm khác nhau.

## Luồng dữ liệu liên quan
- FE fetch kanban: `GET /api/jobs/kanban`
- Backend map timeline từ history: `JobStatusHistory -> JobStatusActivityResponse`
- FE flatten `card.activity[]` → biến thành các dòng recent

Nếu bạn muốn, mình sẽ đọc tiếp `JobStatusActivityResponse` (BE) và xem activity payload có mang đủ “toStatus/fromStatus” hay “jobId/cardId” không. Nếu có, dedupe/correct pill “theo event” sẽ làm chuẩn hơn (thay vì dùng `card.status` hiện tại).