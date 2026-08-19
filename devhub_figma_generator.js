// ============================================================================
// 💎 DEVHUB PRODUCTION MOBILE DESIGN SYSTEM - MASTER FIGMA GENERATOR
// ============================================================================
// 1. Open your Figma File: https://www.figma.com/design/lV43yXloGSQ2iPfia4DsLl/Untitled
// 2. Open Console: Press Ctrl + Shift + I (or Right Click -> Inspect -> Console)
// 3. Paste this code and press Enter!
// ============================================================================

(async function generateMasterpiece() {
  console.log("🚀 Generating Ultra-Premium DevHub Production Mobile Design System...");

  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Medium" }),
    figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  ]).catch(async () => {
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
    await figma.loadFontAsync({ family: "Roboto", style: "Bold" });
  });

  const page = figma.currentPage;
  page.children.filter(n => n.name.startsWith("📱") || n.name.startsWith("🎨")).forEach(n => n.remove());
  page.name = "📱 DevHub Mobile Production Design";

  const C = {
    bg: { r: 9/255, g: 10/255, b: 15/255 },             // #090A0F (Deep Obsidian)
    card: { r: 18/255, g: 20/255, b: 28/255 },         // #12141C (Surface Card)
    cardBorder: { r: 30/255, g: 34/255, b: 48/255 },   // #1E2230
    codeBg: { r: 7/255, g: 8/255, b: 11/255 },         // #07080B
    cyan: { r: 0/255, g: 240/255, b: 255/255 },         // #00F0FF (Neon Cyan Brand)
    indigo: { r: 99/255, g: 102/255, b: 241/255 },     // #6366F1
    emerald: { r: 16/255, g: 185/255, b: 129/255 },    // #10B981
    rose: { r: 244/255, g: 63/255, b: 94/255 },        // #F43F5E
    amber: { r: 245/255, g: 158/255, b: 11/255 },      // #F59E0B
    white: { r: 1, g: 1, b: 1 },
    tPrimary: { r: 248/255, g: 250/255, b: 252/255 },  // #F8FAFC
    tSecondary: { r: 148/255, g: 163/255, b: 184/255 },// #94A3B8
    tMuted: { r: 100/255, g: 116/255, b: 139/255 }     // #64748B
  };

  function txt(content, size = 13, weight = "Regular", color = C.tPrimary, autoResize = "WIDTH_AND_HEIGHT") {
    const t = figma.createText();
    t.characters = content;
    t.fontSize = size;
    try { t.fontName = { family: "Inter", style: weight }; } catch(e) {}
    t.fills = [{ type: "SOLID", color: { r: color.r, g: color.g, b: color.b } }];
    t.textAutoResize = autoResize;
    return t;
  }

  function createIcon(type, size = 20, color = C.tSecondary) {
    const f = figma.createFrame();
    f.name = "icon_" + type;
    f.resize(size, size);
    f.fills = [];
    f.clipsContent = false;

    const colFill = [{ type: "SOLID", color: { r: color.r, g: color.g, b: color.b } }];
    const strokeCol = [{ type: "SOLID", color: { r: color.r, g: color.g, b: color.b } }];

    if (type === "home") {
      const v = figma.createVector();
      v.vectorPaths = [{ windingRule: "NONZERO", data: "M 2 10 L 10 2 L 18 10 L 18 20 L 13 20 L 13 13 L 7 13 L 7 20 L 2 20 Z" }];
      v.resize(size * 0.9, size * 0.9);
      v.x = size * 0.05; v.y = size * 0.05;
      v.fills = colFill;
      f.appendChild(v);
    } else if (type === "network") {
      const c1 = figma.createEllipse(); c1.resize(5, 5); c1.x = size/2 - 2.5; c1.y = 2; c1.fills = colFill;
      const c2 = figma.createEllipse(); c2.resize(5, 5); c2.x = 2; c2.y = size - 7; c2.fills = colFill;
      const c3 = figma.createEllipse(); c3.resize(5, 5); c3.x = size - 7; c3.y = size - 7; c3.fills = colFill;
      const l1 = figma.createLine(); l1.x = size/2; l1.y = 5; l1.resize(size * 0.6, 0); l1.rotation = 120; l1.strokes = strokeCol; l1.strokeWeight = 1.5;
      const l2 = figma.createLine(); l2.x = size/2; l2.y = 5; l2.resize(size * 0.6, 0); l2.rotation = 60; l2.strokes = strokeCol; l2.strokeWeight = 1.5;
      f.appendChild(l1); f.appendChild(l2); f.appendChild(c1); f.appendChild(c2); f.appendChild(c3);
    } else if (type === "chat") {
      const v = figma.createVector();
      v.vectorPaths = [{ windingRule: "NONZERO", data: "M 2 4 L 18 4 L 18 15 L 7 15 L 2 19 Z" }];
      v.resize(size * 0.9, size * 0.85);
      v.x = size * 0.05; v.y = size * 0.05;
      v.fills = colFill;
      f.appendChild(v);
    } else if (type === "heart") {
      const v = figma.createVector();
      v.vectorPaths = [{ windingRule: "NONZERO", data: "M 10 18 L 2 10 C 0 5 6 1 10 6 C 14 1 20 5 18 10 Z" }];
      v.resize(size * 0.85, size * 0.85);
      v.x = size * 0.075; v.y = size * 0.075;
      v.fills = colFill;
      f.appendChild(v);
    } else if (type === "check") {
      const bg = figma.createEllipse();
      bg.resize(size, size);
      bg.fills = [{ type: "SOLID", color: C.cyan }];
      f.appendChild(bg);
      const v = figma.createVector();
      v.vectorPaths = [{ windingRule: "NONE", data: "M 3 7 L 6 10 L 11 4" }];
      v.strokes = [{ type: "SOLID", color: C.bg }];
      v.strokeWeight = 2;
      v.strokeCap = "ROUND";
      v.strokeJoin = "ROUND";
      v.fills = [];
      v.resize(size * 0.6, size * 0.45);
      v.x = size * 0.2; v.y = size * 0.28;
      f.appendChild(v);
    } else if (type === "search") {
      const c = figma.createEllipse();
      c.resize(size * 0.6, size * 0.6);
      c.x = 2; c.y = 2;
      c.fills = [];
      c.strokes = strokeCol;
      c.strokeWeight = 1.8;
      const l = figma.createLine();
      l.x = size * 0.6; l.y = size * 0.6;
      l.resize(size * 0.35, 0);
      l.rotation = 45;
      l.strokes = strokeCol;
      l.strokeWeight = 2;
      f.appendChild(c); f.appendChild(l);
    } else if (type === "bell") {
      const b = figma.createVector();
      b.vectorPaths = [{ windingRule: "NONZERO", data: "M 4 14 L 16 14 L 14 10 L 14 6 C 14 4 12 2 10 2 C 8 2 6 4 6 6 L 6 10 Z" }];
      b.resize(size * 0.8, size * 0.7);
      b.x = size * 0.1; b.y = 2;
      b.fills = colFill;
      const dot = figma.createEllipse();
      dot.resize(4, 4); dot.x = size/2 - 2; dot.y = size - 4; dot.fills = colFill;
      f.appendChild(b); f.appendChild(dot);
    } else if (type === "repost") {
      const v = figma.createVector();
      v.vectorPaths = [{ windingRule: "NONZERO", data: "M 4 6 L 14 6 L 12 3 L 14 3 L 18 7 L 14 11 L 12 11 L 14 8 L 4 8 Z M 16 14 L 6 14 L 8 17 L 6 17 L 2 13 L 6 9 L 8 9 L 6 12 L 16 12 Z" }];
      v.resize(size * 0.85, size * 0.7);
      v.x = size * 0.075; v.y = size * 0.15;
      v.fills = colFill;
      f.appendChild(v);
    } else if (type === "bookmark") {
      const v = figma.createVector();
      v.vectorPaths = [{ windingRule: "NONZERO", data: "M 3 2 L 15 2 L 15 18 L 9 13 L 3 18 Z" }];
      v.resize(size * 0.75, size * 0.85);
      v.x = size * 0.125; v.y = size * 0.075;
      v.fills = colFill;
      f.appendChild(v);
    } else if (type === "comment") {
      const v = figma.createVector();
      v.vectorPaths = [{ windingRule: "NONZERO", data: "M 2 4 C 2 3 3 2 4 2 L 16 2 C 17 2 18 3 18 4 L 18 12 C 18 13 17 14 16 14 L 6 14 L 2 18 Z" }];
      v.resize(size * 0.85, size * 0.8);
      v.x = size * 0.075; v.y = size * 0.1;
      v.fills = colFill;
      f.appendChild(v);
    } else {
      const d = figma.createEllipse();
      d.resize(size * 0.5, size * 0.5);
      d.x = size * 0.25; d.y = size * 0.25;
      d.fills = colFill;
      f.appendChild(d);
    }
    return f;
  }

  async function loadImg(url) {
    try {
      const img = await figma.createImageAsync(url);
      return [{ type: "IMAGE", scaleMode: "FILL", imageHash: img.hash }];
    } catch(e) {
      return [{ type: "SOLID", color: C.card }];
    }
  }

  const [av1, av2, av3, av4, av5] = await Promise.all([
    loadImg("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop"),
    loadImg("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop"),
    loadImg("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop"),
    loadImg("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop"),
    loadImg("https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&fit=crop")
  ]);

  function createDot(size = 8, color = C.cyan) {
    const d = figma.createEllipse();
    d.resize(size, size);
    d.fills = [{ type: "SOLID", color }];
    return d;
  }

  function buildStatusBar() {
    const bar = figma.createFrame();
    bar.name = "iOS 18 Status Bar";
    bar.resize(393, 48);
    bar.fills = [];
    bar.layoutMode = "HORIZONTAL";
    bar.primaryAxisAlignItems = "SPACE_BETWEEN";
    bar.counterAxisAlignItems = "CENTER";
    bar.paddingLeft = 24;
    bar.paddingRight = 24;
    bar.appendChild(txt("9:41", 15, "Semi Bold", C.white));

    const island = figma.createFrame();
    island.resize(124, 30);
    island.cornerRadius = 15;
    island.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
    island.strokes = [{ type: "SOLID", color: C.white, opacity: 0.12 }];
    bar.appendChild(island);

    const rightSide = figma.createFrame();
    rightSide.fills = [];
    rightSide.layoutMode = "HORIZONTAL";
    rightSide.itemSpacing = 6;
    rightSide.counterAxisAlignItems = "CENTER";
    rightSide.appendChild(txt("5G", 12, "Bold", C.white));
    bar.appendChild(rightSide);
    return bar;
  }

  function buildDock(activeTab = "feed") {
    const dock = figma.createFrame();
    dock.name = "Floating Bottom Dock";
    dock.resize(361, 68);
    dock.x = 16;
    dock.y = 756;
    dock.cornerRadius = 34;
    dock.fills = [{ type: "SOLID", color: C.card, opacity: 0.96 }];
    dock.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.25 }];
    dock.strokeWeight = 1;
    dock.effects = [{
      type: "DROP_SHADOW",
      color: { r: 0, g: 240/255, b: 255/255, a: 0.15 },
      offset: { x: 0, y: 8 },
      radius: 24,
      spread: 0,
      visible: true
    }];

    dock.layoutMode = "HORIZONTAL";
    dock.primaryAxisAlignItems = "SPACE_BETWEEN";
    dock.counterAxisAlignItems = "CENTER";
    dock.paddingLeft = 20;
    dock.paddingRight = 20;

    const items = [
      { id: "feed", type: "home", label: "Feed" },
      { id: "network", type: "network", label: "Network" },
      { id: "create", isCta: true },
      { id: "messages", type: "chat", label: "Messages" },
      { id: "profile", isAv: true, label: "Profile" }
    ];

    items.forEach(it => {
      if (it.isCta) {
        const cta = figma.createFrame();
        cta.resize(46, 46);
        cta.cornerRadius = 23;
        cta.fills = [{ type: "SOLID", color: C.cyan }];
        cta.effects = [{
          type: "DROP_SHADOW",
          color: { r: 0, g: 240/255, b: 255/255, a: 0.4 },
          offset: { x: 0, y: 4 },
          radius: 16,
          spread: 0,
          visible: true
        }];
        cta.layoutMode = "HORIZONTAL";
        cta.primaryAxisAlignItems = "CENTER";
        cta.counterAxisAlignItems = "CENTER";
        cta.appendChild(txt("+", 24, "Bold", C.bg));
        dock.appendChild(cta);
      } else if (it.isAv) {
        const pCol = figma.createFrame();
        pCol.fills = [];
        pCol.layoutMode = "VERTICAL";
        pCol.counterAxisAlignItems = "CENTER";
        pCol.itemSpacing = 3;
        const avMini = figma.createFrame();
        avMini.resize(22, 22);
        avMini.cornerRadius = 11;
        avMini.fills = av1;
        avMini.strokes = [{ type: "SOLID", color: activeTab === "profile" ? C.cyan : C.tMuted }];
        avMini.strokeWeight = 1.5;
        pCol.appendChild(avMini);
        pCol.appendChild(txt(it.label, 10, "Medium", activeTab === "profile" ? C.cyan : C.tMuted));
        dock.appendChild(pCol);
      } else {
        const col = figma.createFrame();
        col.fills = [];
        col.layoutMode = "VERTICAL";
        col.counterAxisAlignItems = "CENTER";
        col.itemSpacing = 3;
        const isAct = activeTab === it.id;
        col.appendChild(createIcon(it.type, 20, isAct ? C.cyan : C.tMuted));
        col.appendChild(txt(it.label, 10, isAct ? "Semi Bold" : "Medium", isAct ? C.cyan : C.tMuted));
        dock.appendChild(col);
      }
    });
    return dock;
  }

  // ==========================================================================
  // 📱 SCREEN 1: HOME SOCIAL FEED (PIXEL-PERFECT)
  // ==========================================================================
  const feedScreen = figma.createFrame();
  feedScreen.name = "📱 01 - Home Feed";
  feedScreen.resize(393, 852);
  feedScreen.x = 0; feedScreen.y = 0;
  feedScreen.fills = [{ type: "SOLID", color: C.bg }];
  feedScreen.cornerRadius = 50;
  feedScreen.clipsContent = true;
  feedScreen.appendChild(buildStatusBar());

  // Top App Header
  const appHeader = figma.createFrame();
  appHeader.resize(361, 44);
  appHeader.x = 16; appHeader.y = 52;
  appHeader.fills = [];
  appHeader.layoutMode = "HORIZONTAL";
  appHeader.primaryAxisAlignItems = "SPACE_BETWEEN";
  appHeader.counterAxisAlignItems = "CENTER";

  const brandGroup = figma.createFrame();
  brandGroup.fills = [];
  brandGroup.layoutMode = "HORIZONTAL";
  brandGroup.itemSpacing = 10;
  brandGroup.counterAxisAlignItems = "CENTER";

  const userAv = figma.createFrame();
  userAv.resize(36, 36);
  userAv.cornerRadius = 18;
  userAv.fills = av1;
  userAv.strokes = [{ type: "SOLID", color: C.cyan }];
  userAv.strokeWeight = 1.5;
  brandGroup.appendChild(userAv);
  brandGroup.appendChild(txt("DevHub", 19, "Bold", C.white));
  appHeader.appendChild(brandGroup);

  const feedSwitcher = figma.createFrame();
  feedSwitcher.resize(150, 32);
  feedSwitcher.cornerRadius = 16;
  feedSwitcher.fills = [{ type: "SOLID", color: C.card }];
  feedSwitcher.layoutMode = "HORIZONTAL";
  feedSwitcher.primaryAxisAlignItems = "SPACE_BETWEEN";
  feedSwitcher.counterAxisAlignItems = "CENTER";
  feedSwitcher.paddingLeft = 4; feedSwitcher.paddingRight = 4;

  const tabForYou = figma.createFrame();
  tabForYou.resize(70, 24);
  tabForYou.cornerRadius = 12;
  tabForYou.fills = [{ type: "SOLID", color: C.cyan, opacity: 0.15 }];
  tabForYou.layoutMode = "HORIZONTAL";
  tabForYou.primaryAxisAlignItems = "CENTER";
  tabForYou.counterAxisAlignItems = "CENTER";
  tabForYou.appendChild(txt("For You", 11.5, "Bold", C.cyan));

  const tabFollowing = figma.createFrame();
  tabFollowing.resize(70, 24);
  tabFollowing.fills = [];
  tabFollowing.layoutMode = "HORIZONTAL";
  tabFollowing.primaryAxisAlignItems = "CENTER";
  tabFollowing.counterAxisAlignItems = "CENTER";
  tabFollowing.appendChild(txt("Following", 11.5, "Medium", C.tMuted));

  feedSwitcher.appendChild(tabForYou);
  feedSwitcher.appendChild(tabFollowing);
  appHeader.appendChild(feedSwitcher);

  const bellBtn = figma.createFrame();
  bellBtn.resize(34, 34);
  bellBtn.cornerRadius = 17;
  bellBtn.fills = [{ type: "SOLID", color: C.card }];
  bellBtn.strokes = [{ type: "SOLID", color: C.white, opacity: 0.08 }];
  bellBtn.layoutMode = "HORIZONTAL";
  bellBtn.primaryAxisAlignItems = "CENTER";
  bellBtn.counterAxisAlignItems = "CENTER";
  bellBtn.appendChild(createIcon("bell", 16, C.tSecondary));
  appHeader.appendChild(bellBtn);
  feedScreen.appendChild(appHeader);

  // Stories Carousel
  const storiesReel = figma.createFrame();
  storiesReel.resize(393, 86);
  storiesReel.x = 0; storiesReel.y = 104;
  storiesReel.fills = [];
  storiesReel.layoutMode = "HORIZONTAL";
  storiesReel.itemSpacing = 14;
  storiesReel.paddingLeft = 16;

  [
    { name: "Your Story", img: av1, isSelf: true },
    { name: "Sarah Chen", img: av2 },
    { name: "Alex Rivera", img: av3 },
    { name: "David Kim", img: av4 },
    { name: "Elena R.", img: av5 }
  ].forEach(st => {
    const sItem = figma.createFrame();
    sItem.fills = [];
    sItem.layoutMode = "VERTICAL";
    sItem.counterAxisAlignItems = "CENTER";
    sItem.itemSpacing = 4;
    const ring = figma.createFrame();
    ring.resize(56, 56);
    ring.cornerRadius = 28;
    ring.fills = st.img;
    ring.strokes = [{ type: "SOLID", color: st.isSelf ? C.tMuted : C.cyan }];
    ring.strokeWeight = 2.5;
    sItem.appendChild(ring);
    sItem.appendChild(txt(st.name, 11, "Medium", st.isSelf ? C.tMuted : C.tSecondary));
    storiesReel.appendChild(sItem);
  });
  feedScreen.appendChild(storiesReel);

  // Post Card 1 (Engineering Post with Mac Code Box)
  const post1 = figma.createFrame();
  post1.name = "Post Card - Code Snippet";
  post1.resize(361, 335);
  post1.x = 16; post1.y = 200;
  post1.cornerRadius = 20;
  post1.fills = [{ type: "SOLID", color: C.card }];
  post1.strokes = [{ type: "SOLID", color: C.cardBorder }];
  post1.strokeWeight = 1;
  post1.layoutMode = "VERTICAL";
  post1.paddingLeft = 16; post1.paddingRight = 16; post1.paddingTop = 16; post1.paddingBottom = 16;
  post1.itemSpacing = 12;

  const aRow1 = figma.createFrame();
  aRow1.layoutAlign = "STRETCH";
  aRow1.fills = [];
  aRow1.layoutMode = "HORIZONTAL";
  aRow1.primaryAxisAlignItems = "SPACE_BETWEEN";
  aRow1.counterAxisAlignItems = "CENTER";

  const aLeft1 = figma.createFrame();
  aLeft1.fills = [];
  aLeft1.layoutMode = "HORIZONTAL";
  aLeft1.counterAxisAlignItems = "CENTER";
  aLeft1.itemSpacing = 10;

  const aPhoto1 = figma.createFrame();
  aPhoto1.resize(42, 42);
  aPhoto1.cornerRadius = 21;
  aPhoto1.fills = av2;
  aPhoto1.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.3 }];
  aLeft1.appendChild(aPhoto1);

  const aMeta1 = figma.createFrame();
  aMeta1.fills = [];
  aMeta1.layoutMode = "VERTICAL";
  aMeta1.itemSpacing = 2;
  const nameCheck1 = figma.createFrame();
  nameCheck1.fills = [];
  nameCheck1.layoutMode = "HORIZONTAL";
  nameCheck1.itemSpacing = 5;
  nameCheck1.counterAxisAlignItems = "CENTER";
  nameCheck1.appendChild(txt("Sarah Chen", 14, "Bold", C.white));
  nameCheck1.appendChild(createIcon("check", 14, C.cyan));
  aMeta1.appendChild(nameCheck1);
  aMeta1.appendChild(txt("Staff AI Architect @DeepTech • 2h ago", 11, "Medium", C.tSecondary));
  aLeft1.appendChild(aMeta1);
  aRow1.appendChild(aLeft1);

  const followBtn = figma.createFrame();
  followBtn.resize(74, 28);
  followBtn.cornerRadius = 14;
  followBtn.fills = [{ type: "SOLID", color: C.bg }];
  followBtn.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.4 }];
  followBtn.layoutMode = "HORIZONTAL";
  followBtn.primaryAxisAlignItems = "CENTER";
  followBtn.counterAxisAlignItems = "CENTER";
  followBtn.appendChild(txt("Follow", 11, "Bold", C.cyan));
  aRow1.appendChild(followBtn);
  post1.appendChild(aRow1);

  const pBody1 = txt("Rewrote our real-time WebSocket broker in Rust + Tokio. Dropped P99 latency from 140ms down to 1.8ms! 🚀", 13, "Regular", C.tPrimary, "HEIGHT");
  pBody1.layoutAlign = "STRETCH";
  post1.appendChild(pBody1);

  const codeBox = figma.createFrame();
  codeBox.layoutAlign = "STRETCH";
  codeBox.cornerRadius = 12;
  codeBox.fills = [{ type: "SOLID", color: C.codeBg }];
  codeBox.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.35 }];
  codeBox.layoutMode = "VERTICAL";
  codeBox.paddingLeft = 14; codeBox.paddingRight = 14; codeBox.paddingTop = 10; codeBox.paddingBottom = 12;
  codeBox.itemSpacing = 8;

  const winBar = figma.createFrame();
  winBar.layoutAlign = "STRETCH";
  winBar.fills = [];
  winBar.layoutMode = "HORIZONTAL";
  winBar.primaryAxisAlignItems = "SPACE_BETWEEN";
  winBar.counterAxisAlignItems = "CENTER";
  const dots = figma.createFrame();
  dots.fills = [];
  dots.layoutMode = "HORIZONTAL";
  dots.itemSpacing = 5;
  dots.appendChild(createDot(8, C.rose));
  dots.appendChild(createDot(8, C.amber));
  dots.appendChild(createDot(8, C.emerald));
  winBar.appendChild(dots);
  winBar.appendChild(txt("broker.rs", 10.5, "Medium", C.tMuted));
  codeBox.appendChild(winBar);

  codeBox.appendChild(txt("pub async fn dispatch_event(&self, payload: Bytes) {\n    let clients = self.subscribers.read().await;\n    clients.broadcast(payload).await;\n}", 11, "Regular", C.cyan));
  post1.appendChild(codeBox);

  // Vector Reaction Bar
  const actBar1 = figma.createFrame();
  actBar1.layoutAlign = "STRETCH";
  actBar1.fills = [];
  actBar1.layoutMode = "HORIZONTAL";
  actBar1.primaryAxisAlignItems = "SPACE_BETWEEN";
  actBar1.counterAxisAlignItems = "CENTER";
  actBar1.paddingTop = 4;

  const acts = [
    { label: "1.4k", type: "heart", color: C.rose },
    { label: "128", type: "comment", color: C.tSecondary },
    { label: "64", type: "repost", color: C.tSecondary },
    { label: "", type: "bookmark", color: C.tSecondary }
  ];

  acts.forEach(ac => {
    const pill = figma.createFrame();
    pill.fills = [];
    pill.layoutMode = "HORIZONTAL";
    pill.itemSpacing = 6;
    pill.counterAxisAlignItems = "CENTER";
    pill.appendChild(createIcon(ac.type, 16, ac.color));
    if (ac.label) pill.appendChild(txt(ac.label, 11.5, "Semi Bold", ac.color));
    actBar1.appendChild(pill);
  });
  post1.appendChild(actBar1);
  feedScreen.appendChild(post1);

  // Post 2 Card (Project Showcase & Star Counter)
  const post2 = figma.createFrame();
  post2.name = "Post Card - Project Showcase";
  post2.resize(361, 195);
  post2.x = 16; post2.y = 548;
  post2.cornerRadius = 20;
  post2.fills = [{ type: "SOLID", color: C.card }];
  post2.strokes = [{ type: "SOLID", color: C.cardBorder }];
  post2.layoutMode = "VERTICAL";
  post2.paddingLeft = 16; post2.paddingRight = 16; post2.paddingTop = 16; post2.paddingBottom = 16;
  post2.itemSpacing = 10;

  const aRow2 = figma.createFrame();
  aRow2.layoutAlign = "STRETCH";
  aRow2.fills = [];
  aRow2.layoutMode = "HORIZONTAL";
  aRow2.primaryAxisAlignItems = "SPACE_BETWEEN";
  aRow2.counterAxisAlignItems = "CENTER";
  const aLeft2 = figma.createFrame();
  aLeft2.fills = [];
  aLeft2.layoutMode = "HORIZONTAL";
  aLeft2.counterAxisAlignItems = "CENTER";
  aLeft2.itemSpacing = 10;
  const aPhoto2 = figma.createFrame();
  aPhoto2.resize(42, 42);
  aPhoto2.cornerRadius = 21;
  aPhoto2.fills = av3;
  aLeft2.appendChild(aPhoto2);
  const aMeta2 = figma.createFrame();
  aMeta2.fills = [];
  aMeta2.layoutMode = "VERTICAL";
  aMeta2.itemSpacing = 2;
  const nameRow2 = figma.createFrame();
  nameRow2.fills = [];
  nameRow2.layoutMode = "HORIZONTAL";
  nameRow2.itemSpacing = 4;
  nameRow2.appendChild(txt("Alex Rivera", 14, "Bold", C.white));
  nameRow2.appendChild(createIcon("check", 14, C.cyan));
  aMeta2.appendChild(nameRow2);
  aMeta2.appendChild(txt("Mobile Lead @Stripe • 4h ago", 11, "Medium", C.tSecondary));
  aLeft2.appendChild(aMeta2);
  aRow2.appendChild(aLeft2);
  post2.appendChild(aRow2);

  const pBody2 = txt("Open-sourcing DevHub React Native design system today! 60 FPS on iOS & Android.", 13, "Regular", C.tPrimary, "HEIGHT");
  pBody2.layoutAlign = "STRETCH";
  post2.appendChild(pBody2);

  const repoBox = figma.createFrame();
  repoBox.layoutAlign = "STRETCH";
  repoBox.resize(329, 44);
  repoBox.cornerRadius = 12;
  repoBox.fills = [{ type: "SOLID", color: C.codeBg }];
  repoBox.strokes = [{ type: "SOLID", color: C.indigo, opacity: 0.4 }];
  repoBox.layoutMode = "HORIZONTAL";
  repoBox.primaryAxisAlignItems = "SPACE_BETWEEN";
  repoBox.counterAxisAlignItems = "CENTER";
  repoBox.paddingLeft = 12; repoBox.paddingRight = 12;
  const repoTitle = figma.createFrame();
  repoTitle.fills = [];
  repoTitle.layoutMode = "HORIZONTAL";
  repoTitle.itemSpacing = 8;
  repoTitle.counterAxisAlignItems = "CENTER";
  repoTitle.appendChild(txt("📦", 13, "Regular", C.indigo));
  repoTitle.appendChild(txt("devhub/mobile-core", 12, "Semi Bold", C.white));
  repoBox.appendChild(repoTitle);
  repoBox.appendChild(txt("★ 3.4k", 11.5, "Bold", C.amber));
  post2.appendChild(repoBox);

  feedScreen.appendChild(post2);
  feedScreen.appendChild(buildDock("feed"));

  // ==========================================================================
  // 📱 SCREEN 2: PROFILE & PORTFOLIO (PIXEL-PERFECT)
  // ==========================================================================
  const profScreen = figma.createFrame();
  profScreen.name = "📱 02 - Profile & Portfolio";
  profScreen.resize(393, 852);
  profScreen.x = 430; profScreen.y = 0;
  profScreen.fills = [{ type: "SOLID", color: C.bg }];
  profScreen.cornerRadius = 50;
  profScreen.clipsContent = true;
  profScreen.appendChild(buildStatusBar());

  const pNav = figma.createFrame();
  pNav.resize(361, 44);
  pNav.x = 16; pNav.y = 52;
  pNav.fills = [];
  pNav.layoutMode = "HORIZONTAL";
  pNav.primaryAxisAlignItems = "SPACE_BETWEEN";
  pNav.counterAxisAlignItems = "CENTER";
  pNav.appendChild(txt("←", 20, "Bold", C.white));
  pNav.appendChild(txt("@subhan_dev", 15, "Bold", C.white));
  pNav.appendChild(txt("⚙", 18, "Regular", C.tSecondary));
  profScreen.appendChild(pNav);

  const heroCard = figma.createFrame();
  heroCard.resize(361, 230);
  heroCard.x = 16; heroCard.y = 102;
  heroCard.fills = [];
  heroCard.layoutMode = "VERTICAL";
  heroCard.counterAxisAlignItems = "CENTER";
  heroCard.itemSpacing = 8;

  const mainAvatar = figma.createFrame();
  mainAvatar.resize(88, 88);
  mainAvatar.cornerRadius = 44;
  mainAvatar.fills = av1;
  mainAvatar.strokes = [{ type: "SOLID", color: C.cyan }];
  mainAvatar.strokeWeight = 3;
  heroCard.appendChild(mainAvatar);

  const heroNameRow = figma.createFrame();
  heroNameRow.fills = [];
  heroNameRow.layoutMode = "HORIZONTAL";
  heroNameRow.itemSpacing = 6;
  heroNameRow.counterAxisAlignItems = "CENTER";
  heroNameRow.appendChild(txt("Subhan Chaudhry", 19, "Bold", C.white));
  heroNameRow.appendChild(createIcon("check", 16, C.cyan));
  heroCard.appendChild(heroNameRow);

  heroCard.appendChild(txt("Senior Full-Stack Architect | React Native & Rust", 12.5, "Medium", C.cyan));
  heroCard.appendChild(txt("📍 San Francisco, CA • 👥 142 Mutual Connections", 11.5, "Regular", C.tSecondary));

  const ctaGroup = figma.createFrame();
  ctaGroup.fills = [];
  ctaGroup.layoutMode = "HORIZONTAL";
  ctaGroup.itemSpacing = 10;
  ctaGroup.paddingTop = 6;

  const btnConnect = figma.createFrame();
  btnConnect.resize(155, 42);
  btnConnect.cornerRadius = 21;
  btnConnect.fills = [{ type: "SOLID", color: C.cyan }];
  btnConnect.layoutMode = "HORIZONTAL";
  btnConnect.primaryAxisAlignItems = "CENTER";
  btnConnect.counterAxisAlignItems = "CENTER";
  btnConnect.appendChild(txt("Connect", 13, "Bold", C.bg));

  const btnMsg = figma.createFrame();
  btnMsg.resize(155, 42);
  btnMsg.cornerRadius = 21;
  btnMsg.fills = [{ type: "SOLID", color: C.card }];
  btnMsg.strokes = [{ type: "SOLID", color: C.white, opacity: 0.15 }];
  btnMsg.layoutMode = "HORIZONTAL";
  btnMsg.primaryAxisAlignItems = "CENTER";
  btnMsg.counterAxisAlignItems = "CENTER";
  btnMsg.appendChild(txt("Message", 13, "Bold", C.white));

  ctaGroup.appendChild(btnConnect);
  ctaGroup.appendChild(btnMsg);
  heroCard.appendChild(ctaGroup);
  profScreen.appendChild(heroCard);

  const counterBox = figma.createFrame();
  counterBox.resize(361, 74);
  counterBox.x = 16; counterBox.y = 344;
  counterBox.cornerRadius = 20;
  counterBox.fills = [{ type: "SOLID", color: C.card }];
  counterBox.strokes = [{ type: "SOLID", color: C.cardBorder }];
  counterBox.layoutMode = "HORIZONTAL";
  counterBox.primaryAxisAlignItems = "SPACE_BETWEEN";
  counterBox.counterAxisAlignItems = "CENTER";
  counterBox.paddingLeft = 24; counterBox.paddingRight = 24;
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
    col.appendChild(txt(stat.v, 17, "Bold", C.white));
    col.appendChild(txt(stat.l, 11, "Medium", C.tSecondary));
    counterBox.appendChild(col);
  });
  profScreen.appendChild(counterBox);

  const techCard = figma.createFrame();
  techCard.resize(361, 150);
  techCard.x = 16; techCard.y = 432;
  techCard.cornerRadius = 20;
  techCard.fills = [{ type: "SOLID", color: C.card }];
  techCard.strokes = [{ type: "SOLID", color: C.cardBorder }];
  techCard.layoutMode = "VERTICAL";
  techCard.paddingLeft = 16; techCard.paddingRight = 16; techCard.paddingTop = 16;
  techCard.itemSpacing = 12;
  techCard.appendChild(txt("Verified Tech Stack", 14, "Bold", C.white));

  const rowA = figma.createFrame();
  rowA.fills = [];
  rowA.layoutMode = "HORIZONTAL";
  rowA.itemSpacing = 8;
  ["React Native", "TypeScript", "Node.js", "GraphQL"].forEach(s => {
    const p = figma.createFrame();
    p.cornerRadius = 10;
    p.fills = [{ type: "SOLID", color: C.bg }];
    p.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.3 }];
    p.paddingLeft = 12; p.paddingRight = 12; p.paddingTop = 7; p.paddingBottom = 7;
    p.appendChild(txt(s, 11.5, "Medium", C.cyan));
    rowA.appendChild(p);
  });
  techCard.appendChild(rowA);
  profScreen.appendChild(techCard);
  profScreen.appendChild(buildDock("profile"));

  // ==========================================================================
  // 📱 SCREEN 3: DIRECT MESSAGING / CHAT (PIXEL-PERFECT)
  // ==========================================================================
  const chatScreen = figma.createFrame();
  chatScreen.name = "📱 03 - Direct Messaging";
  chatScreen.resize(393, 852);
  chatScreen.x = 860; chatScreen.y = 0;
  chatScreen.fills = [{ type: "SOLID", color: C.bg }];
  chatScreen.cornerRadius = 50;
  chatScreen.clipsContent = true;
  chatScreen.appendChild(buildStatusBar());

  const cTop = figma.createFrame();
  cTop.resize(361, 52);
  cTop.x = 16; cTop.y = 52;
  cTop.fills = [{ type: "SOLID", color: C.card }];
  cTop.cornerRadius = 20;
  cTop.strokes = [{ type: "SOLID", color: C.cardBorder }];
  cTop.layoutMode = "HORIZONTAL";
  cTop.primaryAxisAlignItems = "SPACE_BETWEEN";
  cTop.counterAxisAlignItems = "CENTER";
  cTop.paddingLeft = 14; cTop.paddingRight = 14;

  const cLeft = figma.createFrame();
  cLeft.fills = [];
  cLeft.layoutMode = "HORIZONTAL";
  cLeft.counterAxisAlignItems = "CENTER";
  cLeft.itemSpacing = 10;
  const cAvMini = figma.createFrame();
  cAvMini.resize(36, 36);
  cAvMini.cornerRadius = 18;
  cAvMini.fills = av2;
  cLeft.appendChild(cAvMini);
  const cInfo = figma.createFrame();
  cInfo.fills = [];
  cInfo.layoutMode = "VERTICAL";
  cInfo.itemSpacing = 2;
  const cNameCheck = figma.createFrame();
  cNameCheck.fills = [];
  cNameCheck.layoutMode = "HORIZONTAL";
  cNameCheck.itemSpacing = 4;
  cNameCheck.appendChild(txt("Sarah Chen", 13.5, "Bold", C.white));
  cNameCheck.appendChild(createIcon("check", 13, C.cyan));
  cInfo.appendChild(cNameCheck);
  cInfo.appendChild(txt("🟢 Online • Active Now", 10.5, "Medium", C.emerald));
  cLeft.appendChild(cInfo);
  cTop.appendChild(cLeft);
  chatScreen.appendChild(cTop);

  const bRecv = figma.createFrame();
  bRecv.resize(280, 68);
  bRecv.x = 16; bRecv.y = 120;
  bRecv.cornerRadius = 20;
  bRecv.fills = [{ type: "SOLID", color: C.card }];
  bRecv.strokes = [{ type: "SOLID", color: C.cardBorder }];
  bRecv.paddingLeft = 16; bRecv.paddingRight = 16; bRecv.paddingTop = 14; bRecv.paddingBottom = 14;
  bRecv.appendChild(txt("Hey Subhan! Checked out your latest React Native bridge code. Really clean architecture! 👏", 12.5, "Regular", C.tPrimary, "HEIGHT"));
  chatScreen.appendChild(bRecv);

  const bSent = figma.createFrame();
  bSent.resize(270, 64);
  bSent.x = 107; bSent.y = 202;
  bSent.cornerRadius = 20;
  bSent.fills = [{ type: "SOLID", color: C.cyan }];
  bSent.paddingLeft = 16; bSent.paddingRight = 16; bSent.paddingTop = 14; bSent.paddingBottom = 14;
  bSent.appendChild(txt("Thanks Sarah! We reduced bridge serialization overhead by 70%. Here is the snippet:", 12.5, "Medium", C.bg, "HEIGHT"));
  chatScreen.appendChild(bSent);

  const bCode = figma.createFrame();
  bCode.resize(300, 100);
  bCode.x = 77; bCode.y = 280;
  bCode.cornerRadius = 16;
  bCode.fills = [{ type: "SOLID", color: C.codeBg }];
  bCode.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.4 }];
  bCode.layoutMode = "VERTICAL";
  bCode.paddingLeft = 14; bCode.paddingRight = 14; bCode.paddingTop = 12; bCode.paddingBottom = 12;
  bCode.itemSpacing = 4;
  bCode.appendChild(txt("// JSI Direct Invocation", 10.5, "Medium", C.tMuted));
  bCode.appendChild(txt("global.DevHubBridge = {\n  syncPayload: (data) => JSI_HostFunction(data)\n};", 11, "Regular", C.cyan));
  chatScreen.appendChild(bCode);

  const chatInput = figma.createFrame();
  chatInput.resize(361, 56);
  chatInput.x = 16; chatInput.y = 756;
  chatInput.cornerRadius = 28;
  chatInput.fills = [{ type: "SOLID", color: C.card }];
  chatInput.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.35 }];
  chatInput.layoutMode = "HORIZONTAL";
  chatInput.primaryAxisAlignItems = "SPACE_BETWEEN";
  chatInput.counterAxisAlignItems = "CENTER";
  chatInput.paddingLeft = 18; chatInput.paddingRight = 8;
  chatInput.appendChild(txt("Write a developer message...", 13, "Regular", C.tMuted));

  const sendBtn = figma.createFrame();
  sendBtn.resize(42, 42);
  sendBtn.cornerRadius = 21;
  sendBtn.fills = [{ type: "SOLID", color: C.cyan }];
  sendBtn.layoutMode = "HORIZONTAL";
  sendBtn.primaryAxisAlignItems = "CENTER";
  sendBtn.counterAxisAlignItems = "CENTER";
  sendBtn.appendChild(txt("➤", 14, "Bold", C.bg));
  chatInput.appendChild(sendBtn);
  chatScreen.appendChild(chatInput);

  // ==========================================================================
  // 📱 SCREEN 4: NETWORK & CONNECTIONS HUB
  // ==========================================================================
  const netScreen = figma.createFrame();
  netScreen.name = "📱 04 - Network & Developers";
  netScreen.resize(393, 852);
  netScreen.x = 1290; netScreen.y = 0;
  netScreen.fills = [{ type: "SOLID", color: C.bg }];
  netScreen.cornerRadius = 50;
  netScreen.clipsContent = true;
  netScreen.appendChild(buildStatusBar());

  const nTop = figma.createFrame();
  nTop.resize(361, 44);
  nTop.x = 16; nTop.y = 52;
  nTop.fills = [];
  nTop.layoutMode = "HORIZONTAL";
  nTop.primaryAxisAlignItems = "SPACE_BETWEEN";
  nTop.counterAxisAlignItems = "CENTER";
  nTop.appendChild(txt("Developer Network", 19, "Bold", C.white));
  nTop.appendChild(createIcon("search", 18, C.tSecondary));
  netScreen.appendChild(nTop);

  const tabRow = figma.createFrame();
  tabRow.resize(393, 38);
  tabRow.x = 0; tabRow.y = 104;
  tabRow.fills = [];
  tabRow.layoutMode = "HORIZONTAL";
  tabRow.itemSpacing = 8;
  tabRow.paddingLeft = 16;
  ["All Developers", "Frontend", "Backend", "AI / ML", "Mobile"].forEach((t, i) => {
    const pill = figma.createFrame();
    pill.cornerRadius = 12;
    pill.fills = [{ type: "SOLID", color: i === 0 ? C.cyan : C.card }];
    pill.strokes = [{ type: "SOLID", color: i === 0 ? C.cyan : C.cardBorder }];
    pill.paddingLeft = 14; pill.paddingRight = 14; pill.paddingTop = 8; pill.paddingBottom = 8;
    pill.appendChild(txt(t, 11.5, "Bold", i === 0 ? C.bg : C.tSecondary));
    tabRow.appendChild(pill);
  });
  netScreen.appendChild(tabRow);

  [
    { name: "Elena Rostova", role: "Staff Rust Engineer @Web3Labs", mut: "18 mutuals", av: av3 },
    { name: "David Kim", role: "Lead DevOps & Kubernetes Architect", mut: "34 mutuals", av: av4 },
    { name: "Aria Takahashi", role: "Full-Stack AI Researcher @Stanford", mut: "9 mutuals", av: av5 }
  ].forEach((d, i) => {
    const card = figma.createFrame();
    card.resize(361, 90);
    card.x = 16; card.y = 156 + (i * 102);
    card.cornerRadius = 20;
    card.fills = [{ type: "SOLID", color: C.card }];
    card.strokes = [{ type: "SOLID", color: C.cardBorder }];
    card.layoutMode = "HORIZONTAL";
    card.primaryAxisAlignItems = "SPACE_BETWEEN";
    card.counterAxisAlignItems = "CENTER";
    card.paddingLeft = 16; card.paddingRight = 16;
    const left = figma.createFrame();
    left.fills = [];
    left.layoutMode = "HORIZONTAL";
    left.counterAxisAlignItems = "CENTER";
    left.itemSpacing = 12;
    const av = figma.createFrame();
    av.resize(46, 46);
    av.cornerRadius = 23;
    av.fills = d.av;
    av.strokes = [{ type: "SOLID", color: C.cyan, opacity: 0.3 }];
    left.appendChild(av);
    const info = figma.createFrame();
    info.fills = [];
    info.layoutMode = "VERTICAL";
    info.itemSpacing = 2;
    const nameRow = figma.createFrame();
    nameRow.fills = [];
    nameRow.layoutMode = "HORIZONTAL";
    nameRow.itemSpacing = 4;
    nameRow.appendChild(txt(d.name, 14, "Bold", C.white));
    nameRow.appendChild(createIcon("check", 13, C.cyan));
    info.appendChild(nameRow);
    info.appendChild(txt(d.role, 11, "Medium", C.tSecondary));
    info.appendChild(txt("👥 " + d.mut, 10.5, "Medium", C.cyan));
    left.appendChild(info);
    card.appendChild(left);

    const cBtn = figma.createFrame();
    cBtn.resize(84, 34);
    cBtn.cornerRadius = 17;
    cBtn.fills = [{ type: "SOLID", color: C.cyan }];
    cBtn.layoutMode = "HORIZONTAL";
    cBtn.primaryAxisAlignItems = "CENTER";
    cBtn.counterAxisAlignItems = "CENTER";
    cBtn.appendChild(txt("Connect", 12, "Bold", C.bg));
    card.appendChild(cBtn);

    netScreen.appendChild(card);
  });
  netScreen.appendChild(buildDock("network"));

  // ==========================================================================
  // 🎨 BOARD 5: DESIGN TOKENS & SPECS
  // ==========================================================================
  const dsBoard = figma.createFrame();
  dsBoard.name = "🎨 05 - Design Tokens & Styles";
  dsBoard.resize(393, 852);
  dsBoard.x = 1720; dsBoard.y = 0;
  dsBoard.fills = [{ type: "SOLID", color: C.card }];
  dsBoard.cornerRadius = 50;
  dsBoard.paddingLeft = 24; dsBoard.paddingRight = 24; dsBoard.paddingTop = 44;
  dsBoard.layoutMode = "VERTICAL";
  dsBoard.itemSpacing = 16;
  dsBoard.appendChild(txt("DevHub Design Tokens", 20, "Bold", C.cyan));
  dsBoard.appendChild(txt("Silicon Valley Grade Tokens & Mobile Specs", 12.5, "Regular", C.tSecondary));

  [
    { name: "Cyan Neon (Primary Brand)", hex: "#00F0FF", color: C.cyan },
    { name: "Deep Obsidian (App Background)", hex: "#090A0F", color: C.bg },
    { name: "Surface Card Canvas", hex: "#12141C", color: C.card },
    { name: "Code Syntax Canvas", hex: "#07080B", color: C.codeBg },
    { name: "Indigo Secondary Accent", hex: "#6366F1", color: C.indigo },
    { name: "Emerald Online Status", hex: "#10B981", color: C.emerald },
    { name: "Rose Reactions", hex: "#F43F5E", color: C.rose }
  ].forEach(s => {
    const row = figma.createFrame();
    row.resize(345, 46);
    row.cornerRadius = 14;
    row.fills = [{ type: "SOLID", color: C.bg }];
    row.strokes = [{ type: "SOLID", color: C.cardBorder }];
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
    chip.resize(24, 24);
    chip.cornerRadius = 6;
    chip.fills = [{ type: "SOLID", color: s.color }];
    left.appendChild(chip);
    left.appendChild(txt(s.name, 12, "Medium", C.white));
    row.appendChild(left);
    row.appendChild(txt(s.hex, 11, "Semi Bold", C.tMuted));
    dsBoard.appendChild(row);
  });

  figma.viewport.scrollAndZoomIntoView([feedScreen, profScreen, chatScreen, netScreen, dsBoard]);
  console.log("🎉 SUCCESS: Pixel-Perfect DevHub Mobile Design System Generated!");
})();
