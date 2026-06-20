# Submission Deadline Enforcement Report

The highly requested **Submission Deadline Framework** has been securely wired into the core authentication and upload flow.

### Implementation Checklist
- ✅ **Database Migration:** `007_settings.sql` safely introduced the `competition_settings` singleton table.
- ✅ **Server Validation:** `src/actions/submission.ts` reads the global submission deadline immediately upon request reception and reliably bounces any upload received after the chronological window closes.
- ✅ **UI Dashboards:** `src/app/page.tsx` and `src/app/dashboard/page.tsx` directly render the deadline status (`OPEN` vs `CLOSED`) to eliminate user confusion during the window closure sequence.
- ✅ **Admin Controls:** `src/app/admin/settings/page.tsx` implements a streamlined UI letting the tournament organizers hot-swap the deadline down to the exact minute.
- ✅ **Automated Tests:** `deadline.test.ts` has been integrated with simulated time-jumping to strictly enforce boundary limits (`T = 1s after deadline` fails correctly).

### Usage Notes for Match Day
The default state allows indefinite uploads. You must manually define your cutoff in the Admin Dashboard at least 24 hours prior to the tournament kick-off.
