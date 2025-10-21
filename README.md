# Kanban Board (Svelte)

A clean, lightweight Kanban board built with Svelte. Tasks are persisted locally, can be shared via the Web Share API, exported as **ICS** (per task) and **CSV** (all tasks), and the app is installable as a **PWA**. Dates are rendered with `date-fns`; overdue items are highlighted; moving a task to **DONE** triggers a browser notification.

---

## Features

- **Local persistence** – All lanes and tasks (including their current lane) are saved to `localStorage`.
- **Task actions**
  - **Share** a single task (Web Share API, with clipboard fallback).
  - **Export ICS** for a single task (all-day event on its due date).
  - **Export All CSV** for all tasks across all lanes.
- **Friendly dates** – Absolute + relative time via `date-fns` (e.g., `21.10.2025 (in 3 Tagen)`).
- **Overdue warning** – Tasks past their due date get a visible warning ring.
- **Story Points per lane** – Lane header shows the sum of story points.
- **DONE → Notification** – Dropping a task into **DONE** fires a native notification.
- **User country** – Determined via Geo-API and displayed in the footer.
- **PWA** – App manifest + service worker; installable on desktop and mobile.

---

##  Tech Stack

- **Svelte** (via [`sv`](https://github.com/sveltejs/cli))
- **date-fns** for date formatting
- Utility-class styling in markup
- **Service Worker** + **Web App Manifest** for PWA

---

##Getting Started

###Install

