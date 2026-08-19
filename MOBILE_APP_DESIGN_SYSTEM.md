# 📱 DevHub Production Mobile App — Figma Design System & Developer Specification

This specification documents the complete UI/UX design tokens, component library, and screen layouts for the **DevHub iOS & Android production mobile app**.

Figma Design File: [https://www.figma.com/design/lV43yXloGSQ2iPfia4DsLl/Untitled](https://www.figma.com/design/lV43yXloGSQ2iPfia4DsLl/Untitled)

---

## 🎨 1. Color Palette & Design Tokens

| Token Name | Hex Code | RGB (0-255) | Purpose |
| :--- | :--- | :--- | :--- |
| `color-bg-dark` | `#080808` | `8, 8, 8` | App background (Obsidian black) |
| `color-card-bg` | `#111111` | `17, 17, 17` | Feed cards, bottom nav bar, modals |
| `color-card-hover` | `#181818` | `24, 24, 24` | Active states, input backgrounds |
| `color-cyan-neon` | `#00F0FF` | `0, 240, 255` | Primary brand accent, verified badges, active tabs, CTA buttons |
| `color-purple` | `#A855F7` | `168, 85, 247` | Code snippets accent, secondary badges |
| `color-green` | `#10B981` | `16, 185, 129` | Online status dot, success toasts |
| `color-rose` | `#F43F5E` | `244, 63, 94` | Likes active state, delete/report buttons |
| `color-text-primary` | `#FFFFFF` | `255, 255, 255` | Headings, user names, primary text |
| `color-text-secondary` | `#9CA3AF` | `156, 163, 175` | Timestamps, subtitles, unread counters |
| `color-border` | `rgba(255,255,255,0.08)` | — | Card borders, divider lines |

---

## 📐 2. Mobile Screen Dimensions & Grid (iPhone 16 Pro Standard)

- **Canvas Size:** `393px × 852px` (Corner Radius: `48px` on physical device)
- **Safe Area Top:** `44px` (Dynamic Island / Status Bar)
- **Safe Area Bottom:** `34px` (Home Indicator)
- **Side Padding:** `20px` (Horizontal margins)
- **Grid System:** 8-point grid (`4px`, `8px`, `16px`, `24px`, `32px`)

---

## 📱 3. Core Screen Breakdown

### Screen 1: 🏠 Home Feed & Status Stories
1. **Top Header:** DevHub Neon Logo + Search Bar + Notification Bell with unread badge.
2. **Stories / Status Reel:** Horizontal scrolling avatar avatars with glowing neon rings (`#00F0FF`).
3. **Feed Post Card:**
   - Author Avatar (`38×38px`), Full Name, Verified Badge (`#00F0FF`), Headline, Time Ago.
   - Post Text content.
   - Syntax-highlighted **Code Snippet Card** with dark background (`#050505`) and cyan border.
   - Interactive Reaction Bar: ❤️ Likes, 💬 Comments, 🔄 Repost, 📤 Share.
4. **Floating Bottom Navigation Bar:**
   - Floating pill (`353×64px`, corner radius `32px`) with blurred glassmorphic background (`#111111` 95% opacity).
   - Icons: Feed, Network, (+) Create Post CTA, Messages, Profile.

### Screen 2: 👤 User Profile & Developer Portfolio
1. **Header Section:** Centered Avatar (`80×80px`) with glowing neon border, verified badge, Full Name, Title, Location, and Mutual Connections count.
2. **Action Buttons:** `➕ Connect` (Filled Neon Cyan) + `💬 Message` (Outlined Glassmorphism).
3. **Quick Stats Grid:** `1.4k Connections`, `248 Posts`, `34 Repositories`.
4. **Skills & Tech Stack:** Pill tags with `#00F0FF` text and dark background (`React Native`, `TypeScript`, `Node.js`, `AWS`, `GraphQL`).
5. **Activity Heat Map:** Mini GitHub-style activity grid displaying user consistency.

### Screen 3: 💬 Real-Time Direct Messaging (Chat)
1. **Chat Header:** Back button, User Avatar (`40×40px`), Name, Green Live Dot (`🟢 Active Now`), Audio/Video call icons.
2. **Message Stream:**
   - Received Message Bubble (`#111111` dark card, white/gray text).
   - Sent Message Bubble (`#00F0FF` solid cyan fill, dark text).
   - Code Attachment snippet card with syntax highlighting.
3. **Chat Input Bar:** Pill container (`353×56px`) with Attachment (+), Code snippet inserter, text input, and circular send button (`#00F0FF`).

---

## 🚀 4. How to Generate These Exact Screens on Figma Canvas (1-Click)

1. Open the Figma file: [https://www.figma.com/design/lV43yXloGSQ2iPfia4DsLl/Untitled](https://www.figma.com/design/lV43yXloGSQ2iPfia4DsLl/Untitled)
2. Open Figma Console: Press `Ctrl + Shift + I` (or Right-Click -> Inspect -> Console, or Menu -> Plugins -> Development -> Open Console).
3. Copy and paste the entire code from `devhub_figma_generator.js` into the console and hit `Enter`.
4. All frames, cards, colors, and components will instantly render on your Figma canvas with auto-layout!
