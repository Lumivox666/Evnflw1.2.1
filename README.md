# EvnFlo — Calendar & Projects (v1.2.1, stability update)

A fresh, single-user planning app inspired by the *calendar-first* approach of Motion. This is an original app, not a copy of Motion, with no subscription or AI API required.

## Stability fixes and verification (November 9, 2026)

This package is a bug-fix update to the uploaded **EvnFlo_Branded_Railway_EasyStart.zip**. It preserves your existing projects, task data, app name, wordmark, and single-user Railway structure.

- Fixed `HEAD` support on the homepage and health endpoint for deployment probes.
- Fixed the **Try again** button on the connection-error screen: the previous inline handler was blocked by the app’s own content-security policy.
- Fixed **fixed-time clash warnings** so work tasks also warn when they overlap personal appointments (and vice versa).
- Rebuilds **overdue or partially missing automatic time blocks** after reopening the app; previously, an old plan could remain stuck in the past until you manually pressed Plan.
- Prevents cancelled task deletions or invalid task edits from replacing the last Undo snapshot.
- Signing out now reloads cleanly, including on installations without a configured workspace password.
- Bumped the service-worker cache version so previously installed copies pull the changed app files after redeployment.
- Fixed a **Railway deployment blocker**: removed the obsolete `NIXPACKS` builder pin, letting Railpack detect the Node app automatically.
- Expanded tests from 2 narrow server tests to 12 functional checks. Run `npm test` yourself, then use `npm run check` to verify JavaScript syntax.

**Verification limitation:** browser navigation is restricted in the testing environment, so the tests use live HTTP/API checks and an isolated browser-logic harness, not a complete visual tap/click test on iPhone or Samsung. This is a thoroughly tested release candidate, but cannot be guaranteed bug-free on every device.

## Task and subtask features (carried forward from v1.1)

- Open a main task and use **Add subtask**. You can also use the **+** shortcut on task inbox rows, project list rows, or Kanban cards.
- Each subtask has its **own priority, due date, estimate, notes, status, dependencies, and automatic or fixed calendar scheduling**. It inherits the main task’s project and Work/Personal space.
- Subtasks appear indented in **Project List** and **Timeline** views, as individually schedulable blocks on the calendar, and within the parent task’s Subtasks section. The Kanban board displays parent-task progress.
- Parent tasks with subtasks are **containers**: the scheduler does not reserve time for both the parent and its subtasks. Marking the parent complete finishes its subtasks; when all subtasks are completed, the parent completes automatically.
- Existing checklist items from version 1.0 are **migrated to real subtasks automatically** on first load. They become 30-minute scheduled subtasks by default; update their time estimates as needed.
- Subtasks are one level deep by design to keep the planner easy to navigate.

### Updating an existing Railway deployment

Replace the existing repository-root files with the contents of this ZIP and redeploy to the **same Railway service and persistent volume**. Your data remains in `$DATA_DIR/state.json`. Export a JSON backup from Settings **before updating**. Do not delete or replace your Railway volume. The data format and existing login cookie are compatible with v1.1.

## EvnFlo branding and interface (v1.2)

- The supplied **EvnFlo lettering is the only visual identity**: no checkmark, wave, monogram, or standalone brand symbol.
- A cropped transparent version of the exact selected black-plum wordmark appears in the desktop sidebar, phone header, sign-in screen, and app loading screen.
- Matching full-wordmark mobile install icons, title, browser theme, and manifest are included.
- A light plum-and-ivory palette, softened cards, clearer navigation states, and refined controls make the interface calmer and easier to scan.
- No change to how projects, task data, subtasks, scheduling, authentication, or persistence work.

## What it does

- **Calendar first:** Day, week and month views, fixed events, colour-coded tasks, and drag-and-drop to pin tasks to a time.
- **Smart scheduling:** Uses priority, deadline, duration, dependencies, working hours, lunch breaks and existing calendar events to create a realistic plan. Rebuilds your plan when you make changes (or on demand). Long tasks can be divided into separate calendar blocks.
- **Projects:** Board (drag between To do / In progress / Review / Done), List, and two-week Timeline views. Project target dates, task and subtask deadlines, fully scheduled subtasks, task dependencies, progress tracking, and notes.
- **Work / Personal:** Separate hours and an All/Work/Personal filter. Personal hours are different on weekdays and weekends.
- **Task inbox / Today:** Fast task capture, completion tracking, and a focused daily agenda.
- **Mobile friendly:** Responsive touch interface with bottom navigation, home-screen icon and installable web-app manifest.
- **Private:** Password-protected, single-user server. Local JSON backups can be exported and imported.

### Important current limits

This is a self-contained **first version**. It does **not** sync Google/Outlook/iCloud calendars, email, or Odoo; create AI-generated projects; send notifications; or support team logins. Manually add appointments as fixed events so the scheduler avoids them. The Timeline is a simple two-week planning view, not a full resource-constrained Gantt system. Calendar drag-and-drop is designed for desktop; on mobile, edit a task and select *Keep at a fixed time*.

## Deploy to Railway (flat GitHub-ready package)

**Railway 2026 compatibility fix:** The uploaded ZIP contained `railway.json` with `builder: NIXPACKS`. That is outdated and can prevent new Railway deployments. This release **omits `railway.json`** and uses Railway's default **Railpack** builder, which detects `package.json` and runs `npm start`. Railway's existing service settings may override this: select **Railpack** in Railway's Build settings if a previous deployment still shows Nixpacks. For existing services, if a custom Config as Code path points to `/railway.json`, remove that custom path.


1. Create a new **private** GitHub repository. Upload all files in this package **directly to the repository root**. Do not put them inside a second folder.
2. In **Railway**, choose **New Project → Deploy from GitHub Repo**, then select your repository.
3. Add a **volume** in Railway and mount it at `/data` so your information survives restarts and redeployments. (Some Railway screens call this Storage → New Volume.)
4. Under **Variables**, create:

   - `APP_PASSWORD` = optional; set a strong password of **at least 8 characters** if you want the login page
   - `DATA_DIR` = `/data`

5. Deploy. In Railway's **Networking**, generate a public domain. Open that HTTPS URL and sign in.
6. Go to **Settings → Export backup** periodically. A Railway volume is persistent storage, not a substitute for backups. If `APP_PASSWORD` is omitted, the app opens directly without login protection.

**No database, external API key, or Node dependencies are required.** Railway will run `npm start`. The server listens on Railway's `PORT` automatically. Changes made on a phone and laptop share the same server data.

If you skip the volume, Railway's local filesystem may be wiped during redeployments and you could lose your planner. **Do not use this app for important data on Railway without a mounted volume.**

## Run locally

Requires Node.js 20 or newer.

```bash
npm start
```

Open `http://localhost:3000`.

For a protected local instance, set `APP_PASSWORD` in your environment before starting. The app creates `storage/state.json` automatically if `DATA_DIR` is not set.

## Add to your phone's home screen

- **Android / Samsung:** Open your Railway HTTPS link in Chrome; use **⋮ → Add to Home screen** (or **Install app**).
- **iPhone:** Open the link in Safari; use **Share → Add to Home Screen**.

The app needs an internet connection to access its saved data. Home-screen installation does not mean full offline editing.

## First steps

1. Create a Work or Personal project, or select **Try sample projects** on the empty Projects page.
2. Add tasks with estimated time, priority and a deadline, if any.
3. Add your meetings and appointments using **New event** so they stay fixed.
4. Open **Settings** and customize your work / personal scheduling hours.
5. Select **Plan my week** on the Calendar. Drag a task to pin it to a specific time; pinned tasks will not be moved by auto-planning.

## Data and security

Data lives on **your** Railway service in a local JSON file (`$DATA_DIR/state.json`), not on a third-party task platform. The app signs login cookies, uses timing-safe password verification, rate-limits failed sign-ins, and checks origins on data-changing requests. It is intended for **one personal account**, not a multi-tenant or enterprise deployment. Keep your GitHub repository private and your Railway password secret. Export regular backups.

## Files

Everything is in the repository root: `server.js`, `app.js`, `styles.css`, `index.html`, `sw.js`, `manifest.webmanifest`, `manus-routes.json`, `evnflo-wordmark.png`, `evnflo-192.png`, `evnflo-512.png`, `package.json`, and `.gitignore`. The dependency-free server regression tests are in `test/server.test.js`; run them with `npm test`.
