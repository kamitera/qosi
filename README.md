# Testimony Brochure Builder

A simple tool for a Quaker meeting (or any small group) to turn a short
values survey into a printable, US-Letter tri-fold outreach brochure — one
per member, or several combined into a shared brochure. No desktop
publishing software involved: members answer a few questions, and a
finished, print-ready PDF comes out the other end.

- **Survey** — a tap-to-rank values survey (Simplicity, Peace, Integrity,
  Community, Equality, Stewardship — "SPICE"), styled after
  [qosi.org's "How SPICY Are You?" survey](https://qosi.org/how-spicy-are-you-survey/),
  plus a couple of short written questions.
- **Personal brochures** — each respondent gets their own tri-fold PDF
  built around their answers.
- **Compiled brochures** — an admin can pick up to 3 members' testimonies
  and combine them into one shared brochure.
- **Photos** — members can optionally add one photo to their brochure,
  either uploaded from their own device or found via Unsplash search
  (Unsplash search needs a one-time setup step — see below; upload always
  works with no setup).
- **CMS** — admins edit the survey questions and the brochure's fixed
  text/logo/colors from plain web forms. No code, no drag-and-drop canvas.

## How it's built (in plain terms)

Everything lives on **Netlify** — one account covers hosting, the sign-in
system for admins, and the storage for submissions. You don't need a
database, WordPress, or any other service.

- The website itself (React, built with Vite).
- A handful of small serverless functions (`netlify/functions/`) that save
  and load data, and generate the PDF.
- **A simple admin password** — one shared password gates `/admin` (see
  "Admin login" below for why this isn't Netlify Identity).
- **Netlify Blobs** — built-in storage for the survey config, brochure
  template, and submissions.

## Try it locally first (optional, no account needed)

If you have Node.js installed:

```bash
npm install
npm run dev
```

Open the printed localhost URL. Because there's no Netlify backend
connected yet, the app runs in **demo mode** — you'll see a banner saying
so — and everything (survey answers, admin edits, generated PDFs) is kept
only in your browser's local storage. It's a safe way to click through the
whole thing, including downloading a real PDF, before deploying anything.

You can also sanity-check the PDF layout directly:

```bash
npm run test:pdf
```

This writes `scripts/out-personal.pdf` and `scripts/out-compiled.pdf` with
sample data.

## Deploying to Netlify (step by step)

1. **Get the code onto GitHub.** Create a new repository (e.g. on
   [github.com/new](https://github.com/new)) and push this folder to it.
   Netlify builds from GitHub automatically — you won't need Node.js
   installed on your own computer for this part.

2. **Create a Netlify site.** At [app.netlify.com](https://app.netlify.com),
   choose "Add new site" → "Import an existing project" → connect the
   GitHub repo you just created. Netlify will detect the build settings
   from `netlify.toml` automatically (`npm run build`, publish `dist`,
   functions in `netlify/functions`). Click deploy.

3. **Set an admin password.** In **Site configuration → Environment
   variables → Add a variable**, add two:
   - `ADMIN_PASSWORD` — whatever password admins should use to log into
     `/admin`. Everyone who needs admin access uses this same password
     (see "Admin login" below for why it's not individual named accounts).
   - `ADMIN_SESSION_SECRET` — any long random string (e.g. mash the
     keyboard for 40+ characters). This isn't a password anyone types —
     it's used internally to sign login sessions so they can't be forged.
     Nobody needs to remember it.

4. **Give the site a storage token and site ID.** Netlify Blobs (what
   stores the survey config and submissions) is supposed to configure
   itself automatically, but that doesn't always work in practice — if it
   doesn't, every page will silently sit in "demo mode" instead of really
   saving anything. To make it reliable, set it up explicitly once:
   - Click your avatar (top right) → **User settings** → **Applications**
     → **Personal access tokens** → **New access token**. Set expiration
     to **No expiration** (a short-lived token would make storage quietly
     break again once it expires). Name it something like "Blobs storage"
     and generate it — copy the token (you won't be able to see it
     again).
   - Find your site's ID: **Site configuration → General → Site details**
     — look for **Site ID** (a long string like
     `1a2b3c4d-5e6f-...`), and copy it.
   - Back in **Site configuration → Environment variables → Add a
     variable**, add two variables:
     - `NETLIFY_BLOBS_TOKEN` — the token you generated.
     - `NETLIFY_BLOBS_SITE_ID` — the Site ID you copied.
   - **Deploys → Trigger deploy** to pick both up.
   - Note the token grants broad account access (not just Blobs) — treat
     it like a password, and you can revoke/regenerate it anytime from
     **User settings → Applications**.

5. **Visit your site.** Your public survey is at your site's root URL
   (e.g. `https://your-meeting.netlify.app/`) — that's the link to share
   with members. The admin area is at `/admin` — log in with the
   `ADMIN_PASSWORD` you set in step 3. If the "Demo mode" banner is still
   showing after step 4, the site isn't actually saving data yet — see
   "Storage isn't working"
   below.

That's it — no database to set up, no extra accounts.

### Optional: a custom domain

In the Netlify dashboard under **Domain management**, you can point your
own domain (e.g. `outreach.yourmeeting.org`) at the site, or use the free
`*.netlify.app` address Netlify gives you.

### Optional: turn on Unsplash photo search

Without this step, members can still add a photo by uploading one from
their own device — that always works. This step only adds the "Search
Unsplash" option.

1. Go to [unsplash.com/developers](https://unsplash.com/developers) and
   create a free account, then click **New Application** (accept their API
   guidelines). A "Demo" application is fine — it's limited to 50 searches
   per hour, which is plenty for occasional survey use.
2. Copy the app's **Access Key**.
3. In your Netlify site: **Site configuration → Environment variables →
   Add a variable**. Name it `UNSPLASH_ACCESS_KEY` and paste in the key.
4. Redeploy the site (**Deploys → Trigger deploy**) so the new variable
   takes effect.

If you skip this (or haven't redeployed yet), the survey's "Search
Unsplash" tab just tells members it isn't set up yet and points them to
the upload option instead — nothing breaks.

## Using it day to day

- **Dashboard** (`/admin`) has a "Copy Link" button for the survey — send
  that to your meeting.
- **Survey Questions** — edit the intro text, the values people rank, and
  the follow-up questions.
- **Brochure Template** — set your meeting's name, logo, color theme
  (pick from 5 preset swatches — no hex codes to type), contact info, and
  the heading/body text for each of the brochure's 6 panels. Every panel
  can also have its own optional image (a "Choose File" button, same as
  the logo) — no design software needed.
- **Submissions** — see everyone who's taken the survey, lightly edit
  their testimony text before it's printed, and download their brochure.
- **Compile Brochure** — pick up to 3 submissions and build one shared
  brochure for outreach tables/events.

## Printing the brochure correctly

Each generated PDF is 2 pages, both letter-size landscape. This is
standard for a tri-fold and is **not** a mistake:

- Page 1 is the *outside* of the folded brochure (back cover, back flap,
  front cover, left to right).
- Page 2 is the *inside* (the 3-panel spread you see once unfolded).

Print page 1, flip the paper over (short-edge flip if your printer offers
double-sided printing), print page 2 on the back, then fold the right
third in first, and the left third over that.

## Project structure

```
shared/                    Code shared between the browser and the server
  defaultQuestions.js       Starting survey definition
  defaultTemplate.js        Starting brochure template
  colorThemes.js             The 5 color themes
  testimony.js               Turns survey answers into a draft testimony
  panelContent.js             Builds the 6 brochure panels' content
  brochureDocument.js        The actual PDF layout (@react-pdf/renderer)
netlify/functions/         The serverless backend
  questions.js / template.js / submissions.js / brochures.js
  generate-pdf.js            Renders the PDF server-side
  admin-login.js             Checks ADMIN_PASSWORD, issues a session token
  _session.js                 Signs/verifies that session token
src/                       The React app (survey + admin CMS)
  api.js                     Talks to the backend, or falls back to demo mode
  adminAuth.js                Admin login/logout, session token storage
scripts/test-pdf.mjs       Local sanity check for the PDF layout
scripts/test-session.mjs   Local sanity check for the admin session tokens
```

## Notes on the "demo mode" fallback

`src/api.js` checks whether real Netlify Functions are reachable. If not
(e.g. you're running `vite` directly instead of through Netlify), it
transparently stores data in `localStorage` and generates PDFs right in
the browser using the same layout code the server uses. This is why you
can try the entire app before deploying anything — but it also means demo
mode data doesn't carry over between browsers/devices, and admin sign-in
is skipped entirely in that mode. Once deployed to Netlify with
`ADMIN_PASSWORD` set, real sign-in is required for every admin action.

## Admin login: why a shared password instead of named accounts

This app originally used **Netlify Identity** for real per-person named
admin logins. Netlify has since moved Identity behind a paid plan (it's no
longer available on the free tier), so this now uses a much simpler
scheme instead: one shared password (`ADMIN_PASSWORD`), checked by a
small serverless function, that issues a signed 30-day login session — see
`netlify/functions/_session.js` and `admin-login.js`. Good enough to gate
who can edit the survey/brochure; not meant to be bank-grade (there's one
password for everyone, and no login-attempt rate limiting). If you want
real named-per-person accounts and audit logs later, that would mean
either upgrading to a paid Netlify plan for Identity, or wiring in a
proper auth provider (e.g. Supabase Auth's free tier) — worth revisiting
if this tool grows beyond a handful of trusted admins.

## Troubleshooting: "Demo mode" banner on the live site

If your *deployed* site (not localhost) still shows the "Demo mode" banner,
the backend functions aren't actually saving data — everything (including
Unsplash search, which only works server-side) will silently misbehave.
This almost always means step 4 above (the storage token) hasn't been done
yet, or the site hasn't redeployed since. To confirm, open your site and
check what a function actually returns:

```
https://your-site.netlify.app/.netlify/functions/questions
```

If that shows real JSON (starting with `{"introTitle":...`), storage is
working. If it shows an error mentioning `MissingBlobsEnvironmentError`,
go do step 4 — both `NETLIFY_BLOBS_TOKEN` and `NETLIFY_BLOBS_SITE_ID` need
to be set (missing either one falls back to the same broken
auto-detection), then redeploy.

## Troubleshooting: can't log into `/admin`

- **"Incorrect password"** — double-check `ADMIN_PASSWORD` in Netlify's
  environment variables matches what you're typing (it's case-sensitive).
- **A generic/server error on login** — most likely `ADMIN_SESSION_SECRET`
  isn't set. Both `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` need to be
  set for login to work at all.
- Changed either variable? **Deploys → Trigger deploy** to pick it up —
  environment variable changes don't apply until the next deploy.
