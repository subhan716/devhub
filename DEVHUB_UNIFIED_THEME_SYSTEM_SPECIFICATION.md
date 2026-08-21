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
   - Secondary Buttons: `bg-white/5 text-gray-200 border-white/10 hover:bg-white/10`
   - Typography: `#FFFFFF` (Primary) / `#9CA3AF` (Secondary)

2. **☀️ Light Studio (LinkedIn / Meta / Stripe Enterprise White Mode):**
   - Background: `#F8FAFC` (Clean Slate 50)
   - Surface Cards: `#FFFFFF` (Pure White) with subtle `#E2E8F0` borders & gentle elevation shadow
   - Subsurfaces & Inputs: `#F1F5F9` (Slate 100)
   - Primary Action Buttons: **LinkedIn / Meta Deep Tech Royal Blue `#0A66C2` with `#FFFFFF` crisp white text!**
   - Secondary Outline Buttons: **`bg-white text-[#0A66C2] border border-[#0A66C2] hover:bg-blue-50/70`**
   - Secondary Neutral Buttons: **`bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] font-semibold`** (Meta Standard) or **`bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-sm`** (LinkedIn Standard)
   - Typography: `#0F172A` (Slate 900) / `#475569` (Slate 600)

---

## 2. Authentic Industrial Button & Accent Matrix (LinkedIn / Meta Standard)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            INDUSTRIAL BUTTON & ACCENT MATRIX                                                │
├───────────────────────────┬──────────────────────────────────────────┬──────────────────────────────────────┤
│ ELEMENT / BUTTON TYPE     │ 🌙 DARK OBSIDIAN MODE                    │ ☀️ LIGHT STUDIO MODE (LINKEDIN/META) │
├───────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ 🔵 Primary Action Button   │ `bg-[#00F0FF]` (Electric Cyan)           │ `bg-[#0A66C2]` (LinkedIn Royal Blue) │
│    (Save, Post, Apply)    │ `text-black font-semibold`               │ `text-white font-semibold shadow-sm` │
│                           │ Hover: `bg-[#00D5E4]`                    │ Hover: `bg-[#004182]`                │
├───────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ 🔷 Secondary Outline      │ `bg-transparent text-[#00F0FF]`          │ `bg-white text-[#0A66C2]`            │
│    (Message, Connect,     │ `border border-[#00F0FF]/40`             │ `border-2 border-[#0A66C2]`          │
│     View Profile)         │ Hover: `bg-[#00F0FF]/10`                 │ Hover: `bg-blue-50 text-[#004182]`   │
├───────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ ⚪ Secondary Neutral       │ `bg-white/5 text-gray-200`               │ `bg-[#E4E6EB]` (Meta standard) OR    │
│    (Cancel, Edit, Filter) │ `border border-white/10`                 │ `bg-white text-slate-800 border`     │
│                           │ Hover: `bg-white/10 text-white`          │ `border-slate-300 shadow-sm`         │
├───────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ 🔴 Destructive Button     │ `bg-red-500/10 text-red-400`             │ `bg-[#DC2626]` (Solid Crimson)       │
│    (Delete, Sign Out)     │ `border border-red-500/20`               │ `text-white font-semibold shadow-sm` │
│                           │ Hover: `bg-red-500/20`                   │ Hover: `bg-[#B91C1C]`                │
├───────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ 🟢 Success / Work Badges  │ `bg-emerald-500/10 text-emerald-400`     │ `bg-emerald-50 text-emerald-700`     │
│    (#OpenToWork, Verified)│ `border border-emerald-500/20`           │ `border border-emerald-200 font-bold`│
├───────────────────────────┼──────────────────────────────────────────┼──────────────────────────────────────┤
│ 🏷️ Filter & Category Tabs │ `bg-[#00F0FF]/15 text-[#00F0FF]`         │ `bg-[#0A66C2] text-white font-bold`  │
│    (Active State)         │ `border border-[#00F0FF]/30`             │ `shadow-sm`                          │
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

---

## 4. Global CSS Design Tokens (`frontend/src/index.css`)

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
  
  /* Primary Action Button (LinkedIn Royal Blue) */
  --btn-primary-bg: #0A66C2;
  --btn-primary-hover: #004182;
  --btn-primary-text: #FFFFFF;
  
  /* Secondary Outline Button (LinkedIn Outline) */
  --btn-secondary-outline-bg: #FFFFFF;
  --btn-secondary-outline-text: #0A66C2;
  --btn-secondary-outline-border: #0A66C2;
  --btn-secondary-outline-hover: #EFF6FF;
  
  /* Secondary Neutral Button (Meta / Stripe Flat Gray) */
  --btn-secondary-bg: #E4E6EB;
  --btn-secondary-hover: #D8DADF;
  --btn-secondary-text: #050505;
  
  /* Destructive Button */
  --btn-destructive-bg: #DC2626;
  --btn-destructive-hover: #B91C1C;
  --btn-destructive-text: #FFFFFF;
  
  --card-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
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
  
  /* Secondary Outline Button */
  --btn-secondary-outline-bg: transparent;
  --btn-secondary-outline-text: #00F0FF;
  --btn-secondary-outline-border: rgba(0, 240, 255, 0.4);
  --btn-secondary-outline-hover: rgba(0, 240, 255, 0.1);
  
  /* Secondary Neutral Button */
  --btn-secondary-bg: rgba(255, 255, 255, 0.07);
  --btn-secondary-hover: rgba(255, 255, 255, 0.12);
  --btn-secondary-text: #FFFFFF;
  
  /* Destructive Button */
  --btn-destructive-bg: rgba(239, 68, 68, 0.15);
  --btn-destructive-hover: rgba(239, 68, 68, 0.25);
  --btn-destructive-text: #F87171;
  
  --card-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.6);
}
```

---

## 5. Scope: Every Single Page in DevHub (100% Coverage)

| Page / Route | Dark Mode Behavior | Light Mode Behavior (LinkedIn / Meta Palette) |
| :--- | :--- | :--- |
| **1. Feed Page (`/`)** | Obsidian feed, cyan post button, dark post cards | Clean slate feed, LinkedIn blue post button, white cards |
| **2. Profile Page (`/profile`)** | Dark banner, obsidian cards, cyan action pills | White banner, crisp white cards, LinkedIn blue outline buttons |
| **3. Messages Page (`/messages`)** | `#111` chat list, `#050508` conversation thread | Pure white chat list, slate-50 active chat thread |
| **4. Jobs Page (`/jobs`)** | Dark job cards, cyan "Apply" buttons | Crisp white job cards, LinkedIn blue "Apply" buttons |
| **5. Network Page (`/network`)** | Dark developer cards, cyan "Connect" pills | White developer cards, LinkedIn blue outline "Connect" pills |
| **6. Settings Page (`/settings`)** | Obsidian cards, dark inputs, cyan save button | Pure white cards, slate inputs, LinkedIn blue save button |
| **7. Legal Center (`/guidelines`..)** | Dark markdown policy reader | Crisp white document reader with slate typography |
| **8. Notifications (`/notifications`)** | Dark notification stream | Pure white notification stream with unread blue dots |
| **9. Search Page (`/search`)** | Dark search results | White search results with highlighted blue terms |
| **10. TopNavbar & Sidebars** | Obsidian glass blur with subtle white border | White frosted glass blur with subtle slate border |
| **11. All Modals & Popups** | Dark overlays with obsidian cards | Clean backdrop blur with pure white elevated modals |

---

*DevHub Global Engineering Standard • Universal Design System*
