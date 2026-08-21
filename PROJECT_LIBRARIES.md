# 📦 DevHub Project Libraries & Dependencies

This document provides a comprehensive and detailed catalog of all external libraries, frameworks, tools, and packages integrated across the **DevHub** frontend and backend ecosystems.

---

## 🎨 Frontend Stack (`frontend/package.json`)

### Core & Framework
| Package Name | Version | Purpose & Usage in DevHub |
| :--- | :--- | :--- |
| `react` | `^19.2.7` | Core UI component library. |
| `react-dom` | `^19.2.7` | React DOM rendering and portal management. |
| `react-router-dom` | `^7.18.1` | Declarative client-side routing, navigation, search params, and protected routes. |
| `vite` | `^8.1.1` | Next-generation ultra-fast frontend build tool and hot module replacement (HMR) dev server. |

### Styling & Design System
| Package Name | Version | Purpose & Usage in DevHub |
| :--- | :--- | :--- |
| `tailwindcss` | `^4.3.2` | Utility-first CSS styling engine for sleek dark neon aesthetic. |
| `@tailwindcss/vite` | `^4.3.2` | Official Vite integration plugin for Tailwind CSS v4. |
| `tailwind-scrollbar` | `^4.0.2` | Custom themed dark/cyan scrollbars across scrollable containers. |
| `lucide-react` | `^1.23.0` | Modern, consistent vector SVG icon library. |
| `postcss` | `^8.5.16` | CSS transformation and tooling pipeline. |
| `autoprefixer` | `^10.5.2` | Automatic vendor prefixing for cross-browser CSS support. |

### Animations, 3D & Rich UI
| Package Name | Version | Purpose & Usage in DevHub |
| :--- | :--- | :--- |
| `framer-motion` | `^12.42.2` | Production-grade spring animations, modal overlays, and layout transitions. |
| `lenis` | `^1.3.25` | Smooth inertial scrolling for landing pages and slide-over panels. |
| `three` | `^0.185.1` | WebGL 3D graphics engine for interactive network mesh background. |
| `@react-three/fiber` | `^9.6.1` | Declarative Three.js scene graph renderer in React. |
| `@react-three/drei` | `^10.7.7` | Collection of useful helpers and camera controls for React Three Fiber. |
| `@splinetool/react-spline` | `^4.1.0` | Interactive 3D Spline scene component for hero sections. |
| `@splinetool/runtime` | `^1.12.98` | Core WebGL runtime engine executing Spline 3D scenes. |

### Forms, State & Validation
| Package Name | Version | Purpose & Usage in DevHub |
| :--- | :--- | :--- |
| `zustand` | `^5.0.14` | High-performance, lightweight global state store for auth, chat, and app states. |
| `react-hook-form` | `^7.80.0` | Uncontrolled performant form state management and input handling. |
| `@hookform/resolvers` | `^5.4.0` | Validation resolvers connecting React Hook Form with Zod schemas. |
| `zod` | `^4.4.3` | TypeScript-first schema validation with runtime data sanitization. |

### Data, Networking & Utilities
| Package Name | Version | Purpose & Usage in DevHub |
| :--- | :--- | :--- |
| `axios` | `^1.18.1` | Promise-based HTTP client for API requests with cookie credentials. |
| `socket.io-client` | `^4.8.3` | Real-time WebSocket client for live 1-to-1 messaging, typing indicators, and instant notifications. |
| `date-fns` | `^4.4.0` | Modern, modular JavaScript date formatting, time intervals, and parsing utility. |
| `react-hot-toast` | `^2.6.0` | Lightweight, customizable notification toasts for user feedback. |
| `emoji-picker-react` | `^4.19.1` | Native emoji picker keyboard for real-time messaging and comment inputs. |
| `react-syntax-highlighter` | `^16.1.1` | Syntax highlighting engine for code snippets in posts with VS2015 dark theme. |
| `react-virtuoso` | `^4.18.11` | Virtualized list renderer for high-performance rendering of massive feeds and chat histories. |
| `html2canvas` | `^1.4.1` | DOM-to-canvas snapshot generator for generating clean PDF resumes. |
| `jspdf` | `^4.2.1` | Client-side PDF generation engine for 1-click CV/Resume downloads. |
| `purify.es` | Built-in / bundled | HTML sanitization protecting against XSS vulnerabilities. |

---

## ⚙️ Backend Stack (`backend/package.json`)

### Core Server & API
| Package Name | Version | Purpose & Usage in DevHub |
| :--- | :--- | :--- |
| `express` | `^5.2.1` | Fast, robust Node.js web server framework powering all API routes. |
| `dotenv` | `^17.4.2` | Zero-dependency module loading environment variables from `.env`. |
| `cors` | `^2.8.6` | Cross-Origin Resource Sharing middleware enabling secure frontend communication. |
| `cookie-parser` | `^1.4.7` | Parse HTTP request cookie headers for JWT session handling. |

### 🗄️ Database & ORM (Supabase PostgreSQL)
| Package Name | Version | Purpose & Usage in DevHub |
| :--- | :--- | :--- |
| `prisma` | `^7.9.1` | Next-generation ORM and schema migration engine for Supabase PostgreSQL. |
| `@prisma/client` | `^7.9.1` | Auto-generated type-safe database query builder for all DevHub models. |
| `@prisma/adapter-pg` | `^7.9.1` | High-performance PostgreSQL driver adapter connecting Prisma with Supabase connection poolers. |
| `pg` | `^8.16.0` | Non-blocking PostgreSQL client for Node.js powering connection pools and queries. |

### Real-Time & Communications
| Package Name | Version | Purpose & Usage in DevHub |
| :--- | :--- | :--- |
| `socket.io` | `^4.8.3` | Real-time WebSocket server handling instant messaging, online user presence, and live notifications. |
| `nodemailer` | `^9.0.5` | Transactional email engine delivering OTP verification codes and account updates. |

### Authentication, Security & Protection
| Package Name | Version | Purpose & Usage in DevHub |
| :--- | :--- | :--- |
| `jsonwebtoken` | `^9.0.3` | Cryptographic JWT signing and verification for session management. |
| `bcryptjs` | `^3.0.3` | Salted hashing algorithm securing user passwords in the database. |
| `helmet` | `^8.2.0` | Security middleware configuring essential HTTP response headers. |
| `express-rate-limit` | `^8.6.2` | Basic rate-limiting middleware preventing brute-force attacks and abuse. |
| `express-validator` | `^7.3.2` | Server-side validation and sanitization middleware for request bodies. |

### Media Upload & Storage
| Package Name | Version | Purpose & Usage in DevHub |
| :--- | :--- | :--- |
| `cloudinary` | `^1.41.3` | Cloud media service SDK for storing avatars, cover photos, and chat attachments. |
| `multer` | `^2.2.0` | Node.js middleware for handling `multipart/form-data` file uploads. |
| `multer-storage-cloudinary` | `^4.0.0` | Direct streaming storage engine routing Multer uploads directly to Cloudinary. |

### Background Tasks, Logging & Maintenance
| Package Name | Version | Purpose & Usage in DevHub |
| :--- | :--- | :--- |
| `node-cron` | `^4.6.0` | Task scheduler for background jobs (nightly network connection suggestions pre-computation). |
| `morgan` | `^1.11.0` | HTTP request logger middleware for monitoring incoming requests. |
| `winston` | `^3.19.0` | Logging library with configurable log levels, transports, and formatting. |
| `nodemon` | `^3.1.14` | *(DevDependency)* Auto-restarting development server on backend file edits. |
