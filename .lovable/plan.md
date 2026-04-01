

## Plan: 3 Fixes

### 1. Credits default to 0
- **`src/types/calculator.ts`**: In `createNewCourse()`, change `credits: 3` → `credits: 0`
- **`src/hooks/use-persisted-grades.ts`**: In `sanitizeCourse()`, change `ensureFinite(obj.credits, 3), 1, 10` → `ensureFinite(obj.credits, 0), 0, 10`

### 2. Payments page + 24-hour popup

**Create `src/pages/Payments.tsx`**
- Styled page with "Support Us" heading, description about GradeGuru being free
- Razorpay button embedded via `useEffect` that creates a `<form>` with the payment script (`pl_SYI2BQkDOwgax4`) appended to a ref div

**Create `src/components/PaymentPopup.tsx`**
- Modal with dark backdrop, framer-motion `AnimatePresence` entrance/exit
- Checks `localStorage` key `payment_popup_last_shown` — shows only if missing or >24 hours old, after 1500ms delay
- Contains close button, "Maybe later" skip, "Support GradeGuru" heading, short message, same Razorpay button via `useEffect` + ref
- On show, saves `Date.now()` to localStorage

### 3. Routing & Nav integration

**`src/App.tsx`**
- Import `Payments` and `PaymentPopup`
- Add route: `<Route path="/payments" element={<ErrorBoundary><Payments /></ErrorBoundary>} />`
- Add `<PaymentPopup />` before `</BrowserRouter>`

**`src/components/Navbar.tsx`**
- Import `CreditCard` from lucide-react
- Add `{ to: "/payments", label: "Payments", icon: CreditCard }` to `navItems`

### Files

| Action | File |
|--------|------|
| Edit | `src/types/calculator.ts` (credits default) |
| Edit | `src/hooks/use-persisted-grades.ts` (credits clamp) |
| Create | `src/pages/Payments.tsx` |
| Create | `src/components/PaymentPopup.tsx` |
| Edit | `src/App.tsx` (route + popup) |
| Edit | `src/components/Navbar.tsx` (nav item) |

No new dependencies. No database changes.

