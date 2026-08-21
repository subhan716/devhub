# 🌓 DevHub Enterprise Unified Theme System Specification
### Universal Dark Obsidian & Light Studio Theme Engine with Multi-Page 0ms Sync & Industrial Button Architecture
**Standard:** LinkedIn, Meta (Instagram/Facebook), Stripe, GitHub, Linear Enterprise Token Architecture  
**Scope:** 100% Real-Time Synchronized Theme Switching Across Every Single Page, Modal, and Component in DevHub.

---

## 1. Executive Summary & Design System Philosophy

The DevHub Theme Engine establishes two distinct, state-of-the-art visual experiences tailored to their respective color spaces:

1. **🌙 Dark Obsidian (Developer Dark Mode):**
   - Background: `#0A0A0A`
   - Surface Cards: `#111116` with `border: rgba(255, 255, 255, 0.08)`
   - Subsurfaces & Inputs: `#050508`
   - Primary Buttons: **Electric Cyan `#00F0FF` with `#000000` text**
   - Typography: `#FFFFFF` (Primary) / `#9CA3AF` (Secondary)

2. **☀️ Light Studio (LinkedIn / Meta / Stripe Enterprise White Mode):**
   - Background: `#F8FAFC` (Clean Slate 50)
   - Surface Cards: `#FFFFFF` (Pure White) with subtle `#E2E8F0` borders & gentle elevation shadow
   - Subsurfaces & Inputs: `#F1F5F9` (Slate 100)
   - Primary Buttons: **LinkedIn / Meta Deep Tech Royal Blue `#0A66C2` (or Deep Cobalt `#0284C7`) with `#FFFFFF` crisp white text!**
   - Typography: `#0F172A` (Slate 900) / `#475569` (Slate 600)

---

## 2. Industrial Button & Accent Matrix (Dark Mode vs Light Mode)

> [!IMPORTANT]
> **Light Mode Rule:** In Light Mode, neon/electric cyan (`#00F0FF`) with black text is strictly forbidden because it looks washed out on white backgrounds. Following **LinkedIn, Facebook, and Stripe**, all primary buttons in Light Mode switch to **Deep Tech Royal Blue (`#0A66C2`) with Pure White text (`#FFFFFF`)**.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            INDUSTRIAL BUTTON & ACCENT MATRIX                                                │
├───────────────────────────┬──────────────────────────────────────────┬──────────────────────────────────────┤
│ ELEMENT / BUTTON TYPE     │ 🌙 DARK OBSIDIAN MODE                    │ ☀️ LIGHT STUDIO MODE (LINKEDIN/META) │
├───────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ 🔵 Primary Action Button   │ `bg-[#00F0FF]` (Electric Cyan)           │ `bg-[#0A66C2]` (Deep Tech Blue)      │
│    (Save, Post, Connect)  │ `text-black font-semibold`               │ `text-white font-semibold shadow-sm` │
│                           │ Hover: `bg-[#00D5E4]`                    │ Hover: `bg-[#004182]`                │
├───────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ ⚪ Secondary Action Button │ `bg-white/5 text-gray-200 border-white/10`│ `bg-slate-100 text-slate-800 border` │
│    (Cancel, Edit, Filter) │ Hover: `bg-white/10 text-white`          │ Hover: `bg-slate-200 border-slate-300`│
├───────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ 🔴 Destructive Button     │ `bg-red-500/10 text-red-400 border-red`  │ `bg-red-600 text-white hover:bg-red7`│
│    (Delete, Sign Out)     │ Hover: `bg-red-500/20 text-red-300`      │ `shadow-sm font-semibold`            │
├───────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ 🟢 Success / Work Badges  │ `bg-emerald-500/10 text-emerald-400`     │ `bg-emerald-50 text-emerald-700`     │
│    (#OpenToWork, Verified)│ `border-emerald-500/20`                  │ `border border-emerald-200`          │
└───────────────────────────┴──────────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 3. How Every Single Page Stays 100% Synchronized (Technical Mechanism)

```
                            ┌──────────────────────────────────────────────┐
                            │    User Clicks Sun / Moon Toggle Button      │
                            │        (Top Navbar or Avatar Dropdown)       │
                            └──────────────────────┬───────────────────────┘
                                                   │
                                                   ▼
                            ┌──────────────────────────────────────────────┐
                            │         ThemeContext / Root Handler          │
                            │   1. document.documentElement.classList      │
                            │   2. localStorage.setItem('devhub_theme')    │
                            │   3. BroadcastChannel.postMessage('theme')   │
                            └──────────────────────┬───────────────────────┘
                                                   │
                                                   ▼
            ┌──────────────────────────────────────┴──────────────────────────────────────┐
            │                                                                             │
            ▼                                                                             ▼
┌───────────────────────────────────────┐                     ┌───────────────────────────────────────┐
│     Global CSS Tokens Repaint (0ms)   │                     │    Multi-Tab Real-Time Sync (0ms)     │
│  `--bg-app`, `--btn-primary-bg`, etc. │                     │ All open browser tabs update together │
└───────────────────┬───────────────────┘                     └───────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       EVERY SINGLE PAGE & MODAL IN DEVHUB UPDATES INSTANTLY                                 │
│  • Feed Page (`/`)                 • Profile Page (`/profile`)        • Jobs Page (`/jobs`)                 │
│  • Messages Page (`/messages`)     • Network Page (`/network`)        • Settings Page (`/settings`)         │
│  • Legal Center (`/guidelines`)    • Notifications (`/notifications`) • Search Page (`/search`)             │
│  • Shells (`Sidebar`, `TopNavbar`, `MobileNav`, `ConfirmModal`, `ImageViewerModal`, `MessagingPopup`)       │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 CSS Design Tokens Implementation (`frontend/src/index.css`)

```css
:root {
  /* LIGHT STUDIO MODE (LinkedIn / Meta / Stripe Standard) */
  --bg-app: #F8FAFC;
  --bg-surface: #FFFFFF;
  --bg-surface-secondary: #F1F5F9;
  --bg-surface-hover: #E2E8F0;
  
  --border-subtle: #E2E8F0;
  --border-strong: #CBD5E1;
  
  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #94A3B8;
  
  /* Primary Button Tokens (LinkedIn Tech Blue) */
  --btn-primary-bg: #0A66C2;
  --btn-primary-hover: #004182;
  --btn-primary-text: #FFFFFF;
  
  --card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
}

html.dark, [data-theme='dark'] {
  /* DARK OBSIDIAN MODE (Current High-End Mode) */
  --bg-app: #0A0A0A;
  --bg-surface: #111116;
  --bg-surface-secondary: #050508;
  --bg-surface-hover: rgba(255, 255, 255, 0.05);
  
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  
  --text-primary: #FFFFFF;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;
  
  /* Primary Button Tokens (Electric Cyan) */
  --btn-primary-bg: #00F0FF;
  --btn-primary-hover: rgba(0, 240, 255, 0.85);
  --btn-primary-text: #000000;
  
  --card-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.6);
}
```

---

## 4. UI Toggle Placement Across App Shell

1. **Top Navbar Header (`TopNavbar.jsx`):**
   - 1-Click Sun ☀️ / Moon 🌙 Icon button positioned next to Search and Notifications.
2. **Profile Avatar Dropdown Menu (`TopNavbar.jsx`):**
   - Menu item: `[ 🌙 Dark Mode / ☀️ Light Mode ]` with animated switch.
3. **Mobile Drawer (`MobileNav.jsx` / `Sidebar.jsx`):**
   - Bottom quick switch for mobile phone users.
4. **Settings Page:**
   - Appearance section with radio cards (`Dark Obsidian`, `Light Studio`).

---

## 5. Scope: Every Single Page in DevHub (100% Coverage)

| Page / Route | Dark Mode Behavior | Light Mode Behavior (LinkedIn / Meta Palette) |
| :--- | :--- | :--- |
| **1. Feed Page (`/`)** | Obsidian feed, cyan post button, dark post cards | Clean slate feed, LinkedIn blue post button, white cards |
| **2. Profile Page (`/profile`)** | Dark banner, obsidian cards, cyan action pills | White banner, crisp white cards, deep blue buttons |
| **3. Messages Page (`/messages`)** | `#111` chat list, `#050508` conversation thread | Pure white chat list, slate-50 active chat thread |
| **4. Jobs Page (`/jobs`)** | Dark job cards, cyan "Apply" buttons | Crisp white job cards, LinkedIn blue "Apply" buttons |
| **5. Network Page (`/network`)** | Dark developer cards, cyan "Connect" pills | White developer cards, LinkedIn blue "Connect" pills |
| **6. Settings Page (`/settings`)** | Obsidian cards, dark inputs, cyan save button | Pure white cards, slate inputs, blue save button |
| **7. Legal Center (`/guidelines`..)** | Dark markdown policy reader | Crisp white document reader with slate typography |
| **8. Notifications (`/notifications`)** | Dark notification stream | Pure white notification stream with unread blue dots |
| **9. Search Page (`/search`)** | Dark search results | White search results with highlighted blue terms |
| **10. TopNavbar & Sidebars** | Obsidian glass blur with subtle white border | White frosted glass blur with subtle slate border |
| **11. All Modals & Popups** | Dark overlays with obsidian cards | Clean backdrop blur with pure white elevated modals |

---

*DevHub Global Engineering Standard • Universal Design System*
