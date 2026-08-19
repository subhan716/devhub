// ============================================================================
// 💎 DEVHUB ULTRA-PREMIUM FIGMA DESIGN SYSTEM (PRO PRODUCTION EDITION)
// ============================================================================
// 1. Open your Figma File: https://www.figma.com/design/lV43yXloGSQ2iPfia4DsLl/Untitled
// 2. Open Console: Press Ctrl + Shift + I (or Right Click -> Inspect -> Console)
// 3. Paste this code and hit Enter!
// ============================================================================

(async function generateMasterpiece() {
  console.log("🚀 Generating Ultra-Premium DevHub Figma Design System...");

  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Medium" }),
    figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  ]).catch(async () => {
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
  });

  const page = figma.currentPage;
  const oldNodes = page.children.filter(n => n.name.startsWith("📱") || n.name.startsWith("🎨"));
  oldNodes.forEach(n => n.remove());

  page.name = "📱 DevHub Mobile Production App";

  const C = {
    bg: { r: 8/255, g: 8/255, b: 8/255 },
    card: { r: 17/255, g: 17/255, b: 17/255 },
    cardHover: { r: 26/255, g: 26/255, b: 26/255 },
    codeBg: { r: 5/255, g: 5/255, b: 5/255 },
    cyan: { r: 0/255, g: 240/255, b: 255/255 },
    purple: { r: 168/255, g: 85/255, b: 247/255 },
    emerald: { r: 16/255, g: 185/255, b: 129/255 },
    rose: { r: 244/255, g: 63/255, b: 94/255 },
    white: { r: 1, g: 1, b: 1 },
    gray300: { r: 209/255, g: 213/255, b: 219/255 },
    gray500: { r: 107/255, g: 114/255, b: 128/255 },
    gray700: { r: 55/255, g: 65/255, b: 81/255 },
  };

  function txt(content, size = 13, weight = "Regular", color = C.white, opacity = 1) {
    const t = figma.createText();
    t.characters = content;
    t.fontSize = size;
    try { t.fontName = { family: "Inter", style: weight }; } catch(e) {}
    t.fills = [{ type: "SOLID", color: { r: color.r, g: color.g, b: color.b }, opacity }];
    return t;
  }

  function addGlow(node, color = C.cyan, radius = 16, opacity = 0.25) {
    node.effects = [{
      type: "DROP_SHADOW",
      color: { r: color.r, g: color.g, b: color.b, a: opacity },
      offset: { x: 0, y: 4 },
      radius: radius,
      spread: 0,
      visible: true,
      blendMode: "NORMAL"
    }];
  }

  async function loadAvatar(url) {
    try {
      const image = await figma.createImageAsync(url);
      return [{ type: "IMAGE", scaleMode: "FILL", imageHash: image.hash }];
    } catch(e) {
      return [{ type: "SOLID", color: C.cardHover }];
    }
  }

  function createIOSStatusBar() {
    const bar = figma.createFrame();
    bar.name = "iOS Status Bar";
    bar.resize(393, 50);
    bar.fills = [];
    bar.layoutMode = "HORIZONTAL";
    bar.primaryAxisAlignItems = "SPACE_BETWEEN";
    bar.counterAxisAlignItems = "CENTER";
    bar.paddingLeft = 28;
    bar.paddingRight = 28;

    const time = txt("9:41", 14, "Semi Bold", C.white);
    const island = figma.createFrame();
    island.resize(110, 28);
    island.cornerRadius = 14;
    island.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
    island.strokes = [{ type: "SOLID", color: C.white, opacity: 0.1 }];

    const icons = figma.createFrame();
    icons.fills = [];
    icons.layoutMode = "HORIZONTAL";
    icons.itemSpacing = 6;
    icons.counterAxisAlignItems = "CENTER";
    icons.appendChild(txt("5G", 11, "Bold", C.white));
    icons.appendChild(txt("100%", 11, "Medium", C.white));

    bar.appendChild(time);
    bar.appendChild(island);
    bar.appendChild(icons);
    return bar;
  }

  function createBottomNav(activeTab = "feed") {
    const nav = figma.createFrame();
    nav.name = "Floating Bottom Nav";
    nav.resize(353, 66);
    nav.x = 20;
    nav.y = 756;
    nav.cornerRadius = 33;
    nav.fills = [{ type: "SOLID", color: C.card, opacity: 0.95 }];
    nav.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.25 }];
    nav.strokeWeight = 1.5;
    addGlow(nav, C.cyan, 24, 0.2);

    nav.layoutMode = "HORIZONTAL";
    nav.primaryAxisAlignItems = "SPACE_BETWEEN";
    nav.counterAxisAlignItems = "CENTER";
    nav.paddingLeft = 20;
    nav.paddingRight = 20;

    const tabs = [
      { id: "feed", icon: "⌂", label: "Feed" },
      { id: "network", icon: "⌬", label: "Network" },
      { id: "create", icon: "+", label: "Post", isCta: true },
      { id: "messages", icon: "✉", label: "Chat" },
      { id: "profile", icon: "👤", label: "Profile" }
    ];

    tabs.forEach(t => {
      if (t.isCta) {
        const ctaBtn = figma.createFrame();
        ctaBtn.resize(44, 44);
        ctaBtn.cornerRadius = 22;
        ctaBtn.fills = [{ type: "SOLID", color: C.cyan }];
        ctaBtn.layoutMode = "HORIZONTAL";
        ctaBtn.primaryAxisAlignItems = "CENTER";
        ctaBtn.counterAxisAlignItems = "CENTER";
        addGlow(ctaBtn, C.cyan, 16, 0.5);
        ctaBtn.appendChild(txt("+", 22, "Bold", C.bg));
        nav.appendChild(ctaBtn);
      } else {
        const tabCol = figma.createFrame();
        tabCol.fills = [];
        tabCol.layoutMode = "VERTICAL";
        tabCol.counterAxisAlignItems = "CENTER";
        tabCol.itemSpacing = 2;
        const isActive = activeTab === t.id;
        tabCol.appendChild(txt(t.icon, 16, isActive ? "Bold" : "Regular", isActive ? C.cyan : C.gray500));
        tabCol.appendChild(txt(t.label, 10, isActive ? "Bold" : "Medium", isActive ? C.cyan : C.gray500));
        nav.appendChild(tabCol);
      }
    });
    return nav;
  }

  const avatar1 = await loadAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
  const avatar2 = await loadAvatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150");
  const avatar3 = await loadAvatar("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150");
  const avatar4 = await loadAvatar("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150");
  const avatar5 = await loadAvatar("https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150");

  // --- SCREEN 1: FEED ---
  const feed = figma.createFrame();
  feed.name = "📱 01 - Home Feed";
  feed.resize(393, 852);
  feed.x = 0; feed.y = 0;
  feed.fills = [{ type: "SOLID", color: C.bg }];
  feed.cornerRadius = 48;
  feed.clipsContent = true;
  feed.appendChild(createIOSStatusBar());

  const topBar = figma.createFrame();
  topBar.resize(353, 44);
  topBar.x = 20; topBar.y = 54;
  topBar.fills = [];
  topBar.layoutMode = "HORIZONTAL";
  topBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  topBar.counterAxisAlignItems = "CENTER";

  const brand = figma.createFrame();
  brand.fills = [];
  brand.layoutMode = "HORIZONTAL";
  brand.itemSpacing = 8;
  brand.counterAxisAlignItems = "CENTER";
  const brandLogo = figma.createFrame();
  brandLogo.resize(28, 28);
  brandLogo.cornerRadius = 8;
  brandLogo.fills = [{ type: "SOLID", color: C.cyan, opacity: 0.15 }];
  brandLogo.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.4 }];
  brandLogo.appendChild(txt("D", 15, "Bold", C.cyan));
  brandLogo.layoutMode = "HORIZONTAL";
  brandLogo.primaryAxisAlignItems = "CENTER";
  brandLogo.counterAxisAlignItems = "CENTER";
  brand.appendChild(brandLogo);
  brand.appendChild(txt("DevHub", 18, "Bold", C.white));
  topBar.appendChild(brand);

  const topActions = figma.createFrame();
  topActions.fills = [];
  topActions.layoutMode = "HORIZONTAL";
  topActions.itemSpacing = 10;
  ["🔍", "🔔"].forEach(ic => {
    const btn = figma.createFrame();
    btn.resize(36, 36);
    btn.cornerRadius = 18;
    btn.fills = [{ type: "SOLID", color: C.card }];
    btn.strokes = [{ type: "SOLID", color: C.white, opacity: 0.08 }];
    btn.layoutMode = "HORIZONTAL";
    btn.primaryAxisAlignItems = "CENTER";
    btn.counterAxisAlignItems = "CENTER";
    btn.appendChild(txt(ic, 13, "Regular", C.gray300));
    topActions.appendChild(btn);
  });
  topBar.appendChild(topActions);
  feed.appendChild(topBar);

  const stories = figma.createFrame();
  stories.resize(393, 85);
  stories.x = 0; stories.y = 106;
  stories.fills = [];
  stories.layoutMode = "HORIZONTAL";
  stories.itemSpacing = 14;
  stories.paddingLeft = 20;

  [
    { name: "Your Story", av: avatar1, isMe: true },
    { name: "Sarah Chen", av: avatar2 },
    { name: "Alex T.", av: avatar3 },
    { name: "David K.", av: avatar4 },
    { name: "Elena R.", av: avatar5 }
  ].forEach(u => {
    const item = figma.createFrame();
    item.fills = [];
    item.layoutMode = "VERTICAL";
    item.counterAxisAlignItems = "CENTER";
    item.itemSpacing = 4;

    const ring = figma.createFrame();
    ring.resize(54, 54);
    ring.cornerRadius = 27;
    ring.fills = u.av;
    ring.strokes = [{ type: "SOLID", color: u.isMe ? C.gray700 : C.cyan }];
    ring.strokeWeight = 2.5;
    if (!u.isMe) addGlow(ring, C.cyan, 10, 0.4);

    item.appendChild(ring);
    item.appendChild(txt(u.name, 11, "Medium", u.isMe ? C.gray500 : C.white));
    stories.appendChild(item);
  });
  feed.appendChild(stories);

  const card = figma.createFrame();
  card.resize(353, 340);
  card.x = 20; card.y = 204;
  card.cornerRadius = 24;
  card.fills = [{ type: "SOLID", color: C.card }];
  card.strokes = [{ type: "SOLID", color: C.white, opacity: 0.08 }];
  card.strokeWeight = 1;
  card.layoutMode = "VERTICAL";
  card.paddingLeft = 16; card.paddingRight = 16; card.paddingTop = 16; card.paddingBottom = 16;
  card.itemSpacing = 12;

  const pHeader = figma.createFrame();
  pHeader.fills = [];
  pHeader.layoutMode = "HORIZONTAL";
  pHeader.primaryAxisAlignItems = "SPACE_BETWEEN";
  pHeader.counterAxisAlignItems = "CENTER";
  pHeader.layoutAlign = "STRETCH";

  const authorBlock = figma.createFrame();
  authorBlock.fills = [];
  authorBlock.layoutMode = "HORIZONTAL";
  authorBlock.counterAxisAlignItems = "CENTER";
  authorBlock.itemSpacing = 10;

  const aImg = figma.createFrame();
  aImg.resize(40, 40);
  aImg.cornerRadius = 20;
  aImg.fills = avatar2;
  aImg.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.4 }];
  authorBlock.appendChild(aImg);

  const aMeta = figma.createFrame();
  aMeta.fills = [];
  aMeta.layoutMode = "VERTICAL";
  aMeta.itemSpacing = 2;
  const aNameRow = figma.createFrame();
  aNameRow.fills = [];
  aNameRow.layoutMode = "HORIZONTAL";
  aNameRow.itemSpacing = 4;
  aNameRow.counterAxisAlignItems = "CENTER";
  aNameRow.appendChild(txt("Sarah Chen", 13, "Bold", C.white));
  aNameRow.appendChild(txt("✓", 11, "Bold", C.cyan));
  aMeta.appendChild(aNameRow);
  aMeta.appendChild(txt("Staff AI Architect @DeepTech • 2h ago", 10.5, "Regular", C.gray500));
  authorBlock.appendChild(aMeta);
  pHeader.appendChild(authorBlock);
  pHeader.appendChild(txt("•••", 14, "Bold", C.gray500));
  card.appendChild(pHeader);

  const pText = txt("Built a custom WebSocket event multiplexer for real-time mobile push notifications in DevHub. Benchmarked 100k msgs/sec with zero latency! ⚡🚀", 12.5, "Regular", C.gray300);
  pText.layoutAlign = "STRETCH";
  card.appendChild(pText);

  const codeCard = figma.createFrame();
  codeCard.layoutAlign = "STRETCH";
  codeCard.resize(321, 105);
  codeCard.cornerRadius = 14;
  codeCard.fills = [{ type: "SOLID", color: C.codeBg }];
  codeCard.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.3 }];
  codeCard.strokeWeight = 1;
  codeCard.layoutMode = "VERTICAL";
  codeCard.paddingLeft = 14; codeCard.paddingRight = 14; codeCard.paddingTop = 12; codeCard.paddingBottom = 12;
  codeCard.itemSpacing = 4;
  codeCard.appendChild(txt("// WebSocket Multiplexer (Node.js + Turbo)", 10.5, "Medium", C.gray500));
  codeCard.appendChild(txt("const io = new SocketServer({ wsEngine: 'turbo' });\nio.of('/live-feed').on('connection', (socket) => {\n  socket.join('user:' + socket.userId);\n});", 11, "Regular", C.cyan));
  card.appendChild(codeCard);

  const rBar = figma.createFrame();
  rBar.fills = [];
  rBar.layoutMode = "HORIZONTAL";
  rBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  rBar.counterAxisAlignItems = "CENTER";
  rBar.layoutAlign = "STRETCH";
  rBar.paddingTop = 4;
  [
    { icon: "♥", count: "1,248", active: true },
    { icon: "💬", count: "84" },
    { icon: "🔄", count: "42" },
    { icon: "🔖", count: "" }
  ].forEach(r => {
    const rItem = figma.createFrame();
    rItem.fills = [];
    rItem.layoutMode = "HORIZONTAL";
    rItem.itemSpacing = 5;
    rItem.counterAxisAlignItems = "CENTER";
    rItem.appendChild(txt(r.icon, 13, "Bold", r.active ? C.rose : C.gray500));
    if (r.count) rItem.appendChild(txt(r.count, 11, "Semi Bold", r.active ? C.rose : C.gray500));
    rBar.appendChild(rItem);
  });
  card.appendChild(rBar);
  feed.appendChild(card);
  feed.appendChild(createBottomNav("feed"));

  // --- SCREEN 2: PROFILE ---
  const profile = figma.createFrame();
  profile.name = "📱 02 - Profile & Portfolio";
  profile.resize(393, 852);
  profile.x = 440; profile.y = 0;
  profile.fills = [{ type: "SOLID", color: C.bg }];
  profile.cornerRadius = 48;
  profile.clipsContent = true;
  profile.appendChild(createIOSStatusBar());

  const profNav = figma.createFrame();
  profNav.resize(353, 44);
  profNav.x = 20; profNav.y = 54;
  profNav.fills = [];
  profNav.layoutMode = "HORIZONTAL";
  profNav.primaryAxisAlignItems = "SPACE_BETWEEN";
  profNav.counterAxisAlignItems = "CENTER";
  profNav.appendChild(txt("←", 18, "Bold", C.white));
  profNav.appendChild(txt("@subhan_dev", 14, "Bold", C.white));
  profNav.appendChild(txt("⚙", 16, "Regular", C.gray500));
  profile.appendChild(profNav);

  const bioCard = figma.createFrame();
  bioCard.resize(353, 230);
  bioCard.x = 20; bioCard.y = 104;
  bioCard.fills = [];
  bioCard.layoutMode = "VERTICAL";
  bioCard.counterAxisAlignItems = "CENTER";
  bioCard.itemSpacing = 6;

  const mainAv = figma.createFrame();
  mainAv.resize(84, 84);
  mainAv.cornerRadius = 42;
  mainAv.fills = avatar1;
  mainAv.strokes = [{ type: "SOLID", color: C.cyan }];
  mainAv.strokeWeight = 3;
  addGlow(mainAv, C.cyan, 20, 0.4);
  bioCard.appendChild(mainAv);

  const nameTitle = figma.createFrame();
  nameTitle.fills = [];
  nameTitle.layoutMode = "HORIZONTAL";
  nameTitle.itemSpacing = 6;
  nameTitle.counterAxisAlignItems = "CENTER";
  nameTitle.appendChild(txt("Subhan Chaudhry", 18, "Bold", C.white));
  nameTitle.appendChild(txt("✓", 14, "Bold", C.cyan));
  bioCard.appendChild(nameTitle);

  bioCard.appendChild(txt("Senior Full-Stack Architect | React Native & Node.js", 12, "Medium", C.cyan));
  bioCard.appendChild(txt("📍 San Francisco, CA • 👥 142 Mutual Connections", 11, "Regular", C.gray500));

  const ctaBox = figma.createFrame();
  ctaBox.fills = [];
  ctaBox.layoutMode = "HORIZONTAL";
  ctaBox.itemSpacing = 10;
  ctaBox.paddingTop = 6;

  const connectCta = figma.createFrame();
  connectCta.resize(150, 40);
  connectCta.cornerRadius = 20;
  connectCta.fills = [{ type: "SOLID", color: C.cyan }];
  connectCta.layoutMode = "HORIZONTAL";
  connectCta.primaryAxisAlignItems = "CENTER";
  connectCta.counterAxisAlignItems = "CENTER";
  addGlow(connectCta, C.cyan, 14, 0.3);
  connectCta.appendChild(txt("➕ Connect", 12.5, "Bold", C.bg));

  const msgCta = figma.createFrame();
  msgCta.resize(150, 40);
  msgCta.cornerRadius = 20;
  msgCta.fills = [{ type: "SOLID", color: C.card }];
  msgCta.strokes = [{ type: "SOLID", color: C.white, opacity: 0.15 }];
  msgCta.strokeWeight = 1;
  msgCta.layoutMode = "HORIZONTAL";
  msgCta.primaryAxisAlignItems = "CENTER";
  msgCta.counterAxisAlignItems = "CENTER";
  msgCta.appendChild(txt("💬 Message", 12.5, "Bold", C.white));
  ctaBox.appendChild(connectCta);
  ctaBox.appendChild(msgCta);
  bioCard.appendChild(ctaBox);
  profile.appendChild(bioCard);

  const countGrid = figma.createFrame();
  countGrid.resize(353, 72);
  countGrid.x = 20; countGrid.y = 344;
  countGrid.cornerRadius = 18;
  countGrid.fills = [{ type: "SOLID", color: C.card }];
  countGrid.strokes = [{ type: "SOLID", color: C.white, opacity: 0.08 }];
  countGrid.strokeWeight = 1;
  countGrid.layoutMode = "HORIZONTAL";
  countGrid.primaryAxisAlignItems = "SPACE_BETWEEN";
  countGrid.counterAxisAlignItems = "CENTER";
  countGrid.paddingLeft = 24; countGrid.paddingRight = 24;
  [
    { v: "1.4k", l: "Connections" },
    { v: "248", l: "Posts" },
    { v: "34", l: "Repositories" }
  ].forEach(stat => {
    const col = figma.createFrame();
    col.fills = [];
    col.layoutMode = "VERTICAL";
    col.counterAxisAlignItems = "CENTER";
    col.itemSpacing = 2;
    col.appendChild(txt(stat.v, 16, "Bold", C.white));
    col.appendChild(txt(stat.l, 10.5, "Regular", C.gray500));
    countGrid.appendChild(col);
  });
  profile.appendChild(countGrid);

  const skillCard = figma.createFrame();
  skillCard.resize(353, 140);
  skillCard.x = 20; skillCard.y = 428;
  skillCard.cornerRadius = 18;
  skillCard.fills = [{ type: "SOLID", color: C.card }];
  skillCard.strokes = [{ type: "SOLID", color: C.white, opacity: 0.08 }];
  skillCard.strokeWeight = 1;
  skillCard.layoutMode = "VERTICAL";
  skillCard.paddingLeft = 16; skillCard.paddingRight = 16; skillCard.paddingTop = 16;
  skillCard.itemSpacing = 12;
  skillCard.appendChild(txt("Verified Tech Stack", 13, "Bold", C.white));

  const pillsRow1 = figma.createFrame();
  pillsRow1.fills = [];
  pillsRow1.layoutMode = "HORIZONTAL";
  pillsRow1.itemSpacing = 8;
  ["React Native", "TypeScript", "Node.js", "GraphQL"].forEach(s => {
    const p = figma.createFrame();
    p.cornerRadius = 8;
    p.fills = [{ type: "SOLID", color: C.cardHover }];
    p.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.25 }];
    p.strokeWeight = 1;
    p.paddingLeft = 10; p.paddingRight = 10; p.paddingTop = 6; p.paddingBottom = 6;
    p.appendChild(txt(s, 11, "Medium", C.cyan));
    pillsRow1.appendChild(p);
  });
  skillCard.appendChild(pillsRow1);

  const pillsRow2 = figma.createFrame();
  pillsRow2.fills = [];
  pillsRow2.layoutMode = "HORIZONTAL";
  pillsRow2.itemSpacing = 8;
  ["MongoDB", "AWS Cloud", "Docker", "Socket.io"].forEach(s => {
    const p = figma.createFrame();
    p.cornerRadius = 8;
    p.fills = [{ type: "SOLID", color: C.cardHover }];
    p.strokes = [{ type: "SOLID", color: C.purple, opacity: 0.25 }];
    p.strokeWeight = 1;
    p.paddingLeft = 10; p.paddingRight = 10; p.paddingTop = 6; p.paddingBottom = 6;
    p.appendChild(txt(s, 11, "Medium", C.purple));
    pillsRow2.appendChild(p);
  });
  skillCard.appendChild(pillsRow2);
  profile.appendChild(skillCard);
  profile.appendChild(createBottomNav("profile"));

  // --- SCREEN 3: CHAT ---
  const chat = figma.createFrame();
  chat.name = "📱 03 - Real-Time Chat";
  chat.resize(393, 852);
  chat.x = 880; chat.y = 0;
  chat.fills = [{ type: "SOLID", color: C.bg }];
  chat.cornerRadius = 48;
  chat.clipsContent = true;
  chat.appendChild(createIOSStatusBar());

  const chatHeader = figma.createFrame();
  chatHeader.resize(353, 50);
  chatHeader.x = 20; chatHeader.y = 54;
  chatHeader.fills = [{ type: "SOLID", color: C.card }];
  chatHeader.cornerRadius = 18;
  chatHeader.strokes = [{ type: "SOLID", color: C.white, opacity: 0.08 }];
  chatHeader.strokeWeight = 1;
  chatHeader.layoutMode = "HORIZONTAL";
  chatHeader.primaryAxisAlignItems = "SPACE_BETWEEN";
  chatHeader.counterAxisAlignItems = "CENTER";
  chatHeader.paddingLeft = 14; chatHeader.paddingRight = 14;

  const chatAuthor = figma.createFrame();
  chatAuthor.fills = [];
  chatAuthor.layoutMode = "HORIZONTAL";
  chatAuthor.counterAxisAlignItems = "CENTER";
  chatAuthor.itemSpacing = 10;
  const cAv = figma.createFrame();
  cAv.resize(34, 34); cAv.cornerRadius = 17; cAv.fills = avatar2;
  chatAuthor.appendChild(cAv);
  const cMeta = figma.createFrame();
  cMeta.fills = [];
  cMeta.layoutMode = "VERTICAL";
  cMeta.itemSpacing = 2;
  cMeta.appendChild(txt("Sarah Chen ✓", 12.5, "Bold", C.white));
  cMeta.appendChild(txt("🟢 Online • Active Now", 10, "Medium", C.emerald));
  chatAuthor.appendChild(cMeta);
  chatHeader.appendChild(chatAuthor);

  const chatIcons = figma.createFrame();
  chatIcons.fills = [];
  chatIcons.layoutMode = "HORIZONTAL";
  chatIcons.itemSpacing = 8;
  chatIcons.appendChild(txt("📞", 13, "Regular", C.gray300));
  chatIcons.appendChild(txt("📹", 13, "Regular", C.gray300));
  chatHeader.appendChild(chatIcons);
  chat.appendChild(chatHeader);

  const bubble1 = figma.createFrame();
  bubble1.resize(270, 64);
  bubble1.x = 20; bubble1.y = 120;
  bubble1.cornerRadius = 18;
  bubble1.fills = [{ type: "SOLID", color: C.card }];
  bubble1.strokes = [{ type: "SOLID", color: C.white, opacity: 0.08 }];
  bubble1.strokeWeight = 1;
  bubble1.paddingLeft = 14; bubble1.paddingRight = 14; bubble1.paddingTop = 12; bubble1.paddingBottom = 12;
  bubble1.appendChild(txt("Hey Subhan! Checked out your latest React Native bridge code. Really clean architecture! 👏", 12, "Regular", C.gray300));
  chat.appendChild(bubble1);

  const bubble2 = figma.createFrame();
  bubble2.resize(260, 58);
  bubble2.x = 113; bubble2.y = 196;
  bubble2.cornerRadius = 18;
  bubble2.fills = [{ type: "SOLID", color: C.cyan }];
  addGlow(bubble2, C.cyan, 16, 0.25);
  bubble2.paddingLeft = 14; bubble2.paddingRight = 14; bubble2.paddingTop = 12; bubble2.paddingBottom = 12;
  bubble2.appendChild(txt("Thanks Sarah! We reduced bridge serialization overhead by 70%. Here is the snippet:", 12, "Medium", C.bg));
  chat.appendChild(bubble2);

  const chatCode = figma.createFrame();
  chatCode.resize(290, 95);
  chatCode.x = 83; chatCode.y = 266;
  chatCode.cornerRadius = 14;
  chatCode.fills = [{ type: "SOLID", color: C.codeBg }];
  chatCode.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.4 }];
  chatCode.strokeWeight = 1;
  chatCode.paddingLeft = 12; chatCode.paddingTop = 10; chatCode.paddingRight = 12;
  chatCode.layoutMode = "VERTICAL";
  chatCode.itemSpacing = 3;
  chatCode.appendChild(txt("// JSI Direct Invocation", 10, "Medium", C.gray500));
  chatCode.appendChild(txt("global.DevHubNativeBridge = {\n  syncPayload: (data) => JSI_HostFunction(data)\n};", 11, "Regular", C.cyan));
  chat.appendChild(chatCode);

  const inputBar = figma.createFrame();
  inputBar.resize(353, 56);
  inputBar.x = 20; inputBar.y = 760;
  inputBar.cornerRadius = 28;
  inputBar.fills = [{ type: "SOLID", color: C.card }];
  inputBar.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.3 }];
  inputBar.strokeWeight = 1.5;
  inputBar.layoutMode = "HORIZONTAL";
  inputBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  inputBar.counterAxisAlignItems = "CENTER";
  inputBar.paddingLeft = 18; inputBar.paddingRight = 8;
  inputBar.appendChild(txt("Write a developer message...", 12.5, "Regular", C.gray500));

  const sendBtn = figma.createFrame();
  sendBtn.resize(40, 40);
  sendBtn.cornerRadius = 20;
  sendBtn.fills = [{ type: "SOLID", color: C.cyan }];
  sendBtn.layoutMode = "HORIZONTAL";
  sendBtn.primaryAxisAlignItems = "CENTER";
  sendBtn.counterAxisAlignItems = "CENTER";
  addGlow(sendBtn, C.cyan, 12, 0.4);
  sendBtn.appendChild(txt("➤", 13, "Bold", C.bg));
  inputBar.appendChild(sendBtn);
  chat.appendChild(inputBar);

  // --- SCREEN 4: NETWORK ---
  const network = figma.createFrame();
  network.name = "📱 04 - Network & Developers";
  network.resize(393, 852);
  network.x = 1320; network.y = 0;
  network.fills = [{ type: "SOLID", color: C.bg }];
  network.cornerRadius = 48;
  network.clipsContent = true;
  network.appendChild(createIOSStatusBar());

  const netTop = figma.createFrame();
  netTop.resize(353, 44);
  netTop.x = 20; netTop.y = 54;
  netTop.fills = [];
  netTop.layoutMode = "HORIZONTAL";
  netTop.primaryAxisAlignItems = "SPACE_BETWEEN";
  netTop.counterAxisAlignItems = "CENTER";
  netTop.appendChild(txt("Developer Network", 18, "Bold", C.white));
  netTop.appendChild(txt("🔍", 15, "Regular", C.gray300));
  network.appendChild(netTop);

  const netTabs = figma.createFrame();
  netTabs.resize(393, 38);
  netTabs.x = 0; netTabs.y = 106;
  netTabs.fills = [];
  netTabs.layoutMode = "HORIZONTAL";
  netTabs.itemSpacing = 8;
  netTabs.paddingLeft = 20;

  ["All Developers", "Frontend", "Backend", "AI / ML", "Mobile"].forEach((t, i) => {
    const pill = figma.createFrame();
    pill.cornerRadius = 10;
    pill.fills = [{ type: "SOLID", color: i === 0 ? C.cyan : C.card }];
    pill.strokes = [{ type: "SOLID", color: i === 0 ? C.cyan : C.white, opacity: 0.08 }];
    pill.strokeWeight = 1;
    pill.paddingLeft = 12; pill.paddingRight = 12; pill.paddingTop = 7; pill.paddingBottom = 7;
    if (i === 0) addGlow(pill, C.cyan, 12, 0.3);
    pill.appendChild(txt(t, 11, "Bold", i === 0 ? C.bg : C.gray300));
    netTabs.appendChild(pill);
  });
  network.appendChild(netTabs);

  [
    { name: "Elena Rostova", role: "Staff Rust Engineer @Web3Labs", mut: "18 mutuals", av: avatar3 },
    { name: "David Kim", role: "Lead DevOps & Kubernetes Architect", mut: "34 mutuals", av: avatar4 },
    { name: "Aria Takahashi", role: "Full-Stack AI Researcher @Stanford", mut: "9 mutuals", av: avatar5 }
  ].forEach((d, i) => {
    const dCard = figma.createFrame();
    dCard.resize(353, 86);
    dCard.x = 20; dCard.y = 158 + (i * 98);
    dCard.cornerRadius = 18;
    dCard.fills = [{ type: "SOLID", color: C.card }];
    dCard.strokes = [{ type: "SOLID", color: C.white, opacity: 0.08 }];
    dCard.strokeWeight = 1;
    dCard.layoutMode = "HORIZONTAL";
    dCard.primaryAxisAlignItems = "SPACE_BETWEEN";
    dCard.counterAxisAlignItems = "CENTER";
    dCard.paddingLeft = 14; dCard.paddingRight = 14;

    const left = figma.createFrame();
    left.fills = [];
    left.layoutMode = "HORIZONTAL";
    left.counterAxisAlignItems = "CENTER";
    left.itemSpacing = 12;

    const av = figma.createFrame();
    av.resize(44, 44);
    av.cornerRadius = 22;
    av.fills = d.av;
    av.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.3 }];
    av.strokeWeight = 1.5;
    left.appendChild(av);

    const info = figma.createFrame();
    info.fills = [];
    info.layoutMode = "VERTICAL";
    info.itemSpacing = 2;
    info.appendChild(txt(d.name + " ✓", 13, "Bold", C.white));
    info.appendChild(txt(d.role, 10.5, "Regular", C.gray500));
    info.appendChild(txt("👥 " + d.mut, 10, "Medium", C.cyan));
    left.appendChild(info);
    dCard.appendChild(left);

    const cBtn = figma.createFrame();
    cBtn.resize(84, 34);
    cBtn.cornerRadius = 17;
    cBtn.fills = [{ type: "SOLID", color: C.cyan }];
    cBtn.layoutMode = "HORIZONTAL";
    cBtn.primaryAxisAlignItems = "CENTER";
    cBtn.counterAxisAlignItems = "CENTER";
    addGlow(cBtn, C.cyan, 10, 0.3);
    cBtn.appendChild(txt("Connect", 11.5, "Bold", C.bg));
    dCard.appendChild(cBtn);

    network.appendChild(dCard);
  });
  network.appendChild(createBottomNav("network"));

  // --- BOARD 5: DESIGN TOKENS ---
  const dsBoard = figma.createFrame();
  dsBoard.name = "🎨 05 - Design Tokens & Styles";
  dsBoard.resize(393, 852);
  dsBoard.x = 1760; dsBoard.y = 0;
  dsBoard.fills = [{ type: "SOLID", color: C.card }];
  dsBoard.cornerRadius = 48;
  dsBoard.paddingLeft = 24; dsBoard.paddingRight = 24; dsBoard.paddingTop = 40;
  dsBoard.layoutMode = "VERTICAL";
  dsBoard.itemSpacing = 16;

  dsBoard.appendChild(txt("DevHub Design Tokens", 20, "Bold", C.cyan));
  dsBoard.appendChild(txt("Master Color Palette & Components for Mobile Dev", 12, "Regular", C.gray500));

  [
    { name: "Cyan Neon (Primary)", hex: "#00F0FF", color: C.cyan },
    { name: "Obsidian Dark (Background)", hex: "#080808", color: C.bg },
    { name: "Charcoal Glass (Card Surface)", hex: "#111111", color: C.cardHover },
    { name: "Code Snippet Canvas", hex: "#050505", color: C.codeBg },
    { name: "Purple Syntax Accent", hex: "#A855F7", color: C.purple },
    { name: "Emerald Online Status", hex: "#10B981", color: C.emerald },
    { name: "Rose Reactions", hex: "#F43F5E", color: C.rose }
  ].forEach(s => {
    const row = figma.createFrame();
    row.resize(345, 44);
    row.cornerRadius = 12;
    row.fills = [{ type: "SOLID", color: C.bg }];
    row.strokes = [{ type: "SOLID", color: C.white, opacity: 0.08 }];
    row.strokeWeight = 1;
    row.layoutMode = "HORIZONTAL";
    row.primaryAxisAlignItems = "SPACE_BETWEEN";
    row.counterAxisAlignItems = "CENTER";
    row.paddingLeft = 12; row.paddingRight = 14;

    const left = figma.createFrame();
    left.fills = [];
    left.layoutMode = "HORIZONTAL";
    left.itemSpacing = 10;
    left.counterAxisAlignItems = "CENTER";

    const chip = figma.createFrame();
    chip.resize(22, 22);
    chip.cornerRadius = 6;
    chip.fills = [{ type: "SOLID", color: s.color }];
    left.appendChild(chip);
    left.appendChild(txt(s.name, 11.5, "Medium", C.white));
    row.appendChild(left);
    row.appendChild(txt(s.hex, 11, "Semi Bold", C.gray500));
    dsBoard.appendChild(row);
  });

  figma.viewport.scrollAndZoomIntoView([feed, profile, chat, network, dsBoard]);
  console.log("🎉 SUCCESS: Ultra-Premium DevHub Mobile Design System generated with Real Images & Tokens!");
})();
