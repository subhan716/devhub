// ============================================================================
// 🎨 DEVHUB MOBILE APP - FIGMA CANVAS AUTO-GENERATOR SCRIPT
// ============================================================================
// How to run in Figma:
// 1. Open your Figma File: https://www.figma.com/design/lV43yXloGSQ2iPfia4DsLl/Untitled
// 2. Open Figma Console: Press Ctrl + Shift + I (or Right Click -> Inspect -> Console)
//    OR go to: Menu -> Plugins -> Development -> Open Console
// 3. Paste this entire code into the Console and press Enter!
// ============================================================================

(async function generateDevHubDesign() {
  console.log("🚀 Starting DevHub Mobile Design System generation...");

  // Load essential fonts
  try {
    await Promise.all([
      figma.loadFontAsync({ family: "Inter", style: "Regular" }),
      figma.loadFontAsync({ family: "Inter", style: "Medium" }),
      figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
      figma.loadFontAsync({ family: "Inter", style: "Bold" })
    ]);
  } catch (e) {
    console.log("Loading fallback font...");
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" });
  }

  const page = figma.currentPage;
  page.name = "📱 DevHub Mobile App";

  // Color Palette Constants (sRGB 0-1)
  const COLORS = {
    bgDark: { r: 8/255, g: 8/255, b: 8/255 },        // #080808
    cardBg: { r: 17/255, g: 17/255, b: 17/255 },     // #111111
    cardHover: { r: 24/255, g: 24/255, b: 24/255 },  // #181818
    cyan: { r: 0/255, g: 240/255, b: 255/255 },       // #00F0FF (Primary Neon)
    purple: { r: 168/255, g: 85/255, b: 247/255 },   // #A855F7
    green: { r: 16/255, g: 185/255, b: 129/255 },    // #10B981
    rose: { r: 244/255, g: 63/255, b: 94/255 },      // #F43F5E
    white: { r: 1, g: 1, b: 1 },
    gray300: { r: 209/255, g: 213/255, b: 219/255 },
    gray500: { r: 107/255, g: 114/255, b: 128/255 },
    border: { r: 255/255, g: 255/255, b: 255/255, a: 0.08 }
  };

  function createText(content, fontSize = 14, weight = "Regular", color = COLORS.white, opacity = 1) {
    const text = figma.createText();
    text.characters = content;
    text.fontSize = fontSize;
    try {
      text.fontName = { family: "Inter", style: weight };
    } catch(e) {}
    text.fills = [{ type: "SOLID", color: { r: color.r, g: color.g, b: color.b }, opacity: opacity }];
    return text;
  }

  // --------------------------------------------------------------------------
  // SCREEN 1: HOME FEED (iPhone 16 Pro: 393 x 852)
  // --------------------------------------------------------------------------
  const feedScreen = figma.createFrame();
  feedScreen.name = "📱 01 - Home Feed";
  feedScreen.resize(393, 852);
  feedScreen.x = 0;
  feedScreen.y = 0;
  feedScreen.fills = [{ type: "SOLID", color: COLORS.bgDark }];
  feedScreen.cornerRadius = 48;
  feedScreen.clipsContent = true;

  // Header
  const header = figma.createFrame();
  header.name = "Header";
  header.resize(393, 60);
  header.y = 44; // below dynamic island
  header.fills = [];
  header.layoutMode = "HORIZONTAL";
  header.primaryAxisAlignItems = "SPACE_BETWEEN";
  header.counterAxisAlignItems = "CENTER";
  header.paddingLeft = 20;
  header.paddingRight = 20;
  header.itemSpacing = 10;

  const logoText = createText("DevHub", 20, "Bold", COLORS.cyan);
  header.appendChild(logoText);
  feedScreen.appendChild(header);

  // Stories Reel
  const storiesContainer = figma.createFrame();
  storiesContainer.name = "Stories / Status Reel";
  storiesContainer.resize(393, 90);
  storiesContainer.y = 110;
  storiesContainer.fills = [];
  storiesContainer.layoutMode = "HORIZONTAL";
  storiesContainer.paddingLeft = 20;
  storiesContainer.itemSpacing = 14;

  const storyUsers = ["You", "Alex", "Sarah", "Dev_Max", "Elena"];
  storyUsers.forEach((name, i) => {
    const storyItem = figma.createFrame();
    storyItem.resize(60, 80);
    storyItem.fills = [];
    storyItem.layoutMode = "VERTICAL";
    storyItem.counterAxisAlignItems = "CENTER";
    storyItem.itemSpacing = 4;

    const avatarRing = figma.createFrame();
    avatarRing.resize(52, 52);
    avatarRing.cornerRadius = 26;
    avatarRing.fills = [{ type: "SOLID", color: COLORS.cardHover }];
    avatarRing.strokes = [{ type: "SOLID", color: i === 0 ? COLORS.gray500 : COLORS.cyan }];
    avatarRing.strokeWeight = 2;

    const storyLabel = createText(name, 11, "Medium", i === 0 ? COLORS.gray500 : COLORS.white);
    storyItem.appendChild(avatarRing);
    storyItem.appendChild(storyLabel);
    storiesContainer.appendChild(storyItem);
  });
  feedScreen.appendChild(storiesContainer);

  // Post Card
  const postCard = figma.createFrame();
  postCard.name = "Post Card";
  postCard.resize(353, 340);
  postCard.x = 20;
  postCard.y = 210;
  postCard.cornerRadius = 20;
  postCard.fills = [{ type: "SOLID", color: COLORS.cardBg }];
  postCard.strokes = [{ type: "SOLID", color: COLORS.white, opacity: 0.08 }];
  postCard.strokeWeight = 1;
  postCard.layoutMode = "VERTICAL";
  postCard.paddingLeft = 16;
  postCard.paddingRight = 16;
  postCard.paddingTop = 16;
  postCard.paddingBottom = 16;
  postCard.itemSpacing = 12;

  // Post Author Row
  const authorRow = figma.createFrame();
  authorRow.fills = [];
  authorRow.layoutMode = "HORIZONTAL";
  authorRow.counterAxisAlignItems = "CENTER";
  authorRow.itemSpacing = 10;
  authorRow.resize(321, 40);

  const authorAvatar = figma.createFrame();
  authorAvatar.resize(38, 38);
  authorAvatar.cornerRadius = 19;
  authorAvatar.fills = [{ type: "SOLID", color: COLORS.cyan }];

  const authorInfo = figma.createFrame();
  authorInfo.fills = [];
  authorInfo.layoutMode = "VERTICAL";
  authorInfo.itemSpacing = 2;
  authorInfo.appendChild(createText("Alex Thompson  ✓", 13, "Bold", COLORS.white));
  authorInfo.appendChild(createText("Senior Mobile Architect • 2h ago", 11, "Regular", COLORS.gray500));

  authorRow.appendChild(authorAvatar);
  authorRow.appendChild(authorInfo);
  postCard.appendChild(authorRow);

  // Post Body
  postCard.appendChild(createText("Optimizing our React Native build pipeline for speed! Check out this new CI/CD workflow with TurboModules 🚀", 13, "Regular", COLORS.gray300));

  // Code Snippet Card
  const codeBox = figma.createFrame();
  codeBox.name = "Code Snippet Box";
  codeBox.resize(321, 110);
  codeBox.cornerRadius = 12;
  codeBox.fills = [{ type: "SOLID", color: { r: 5/255, g: 5/255, b: 5/255 } }];
  codeBox.strokes = [{ type: "SOLID", color: COLORS.cyan, opacity: 0.3 }];
  codeBox.strokeWeight = 1;
  codeBox.paddingLeft = 12;
  codeBox.paddingTop = 12;
  codeBox.appendChild(createText("// TurboModule Config\nimport { NativeModules } from 'react-native';\nexport const TurboBridge = NativeModules.DevHubBridge;\nTurboBridge.initialize();", 11, "Regular", COLORS.cyan));
  postCard.appendChild(codeBox);

  // Action Buttons
  const actionsRow = figma.createFrame();
  actionsRow.fills = [];
  actionsRow.layoutMode = "HORIZONTAL";
  actionsRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  actionsRow.resize(321, 30);
  actionsRow.appendChild(createText("❤️ 842", 12, "Medium", COLORS.cyan));
  actionsRow.appendChild(createText("💬 115", 12, "Medium", COLORS.gray500));
  actionsRow.appendChild(createText("🔄 67", 12, "Medium", COLORS.gray500));
  actionsRow.appendChild(createText("📤 Share", 12, "Medium", COLORS.gray500));
  postCard.appendChild(actionsRow);

  feedScreen.appendChild(postCard);

  // Floating Bottom Navigation Bar
  const navBar = figma.createFrame();
  navBar.name = "Floating Bottom Nav Bar";
  navBar.resize(353, 64);
  navBar.x = 20;
  navBar.y = 750;
  navBar.cornerRadius = 32;
  navBar.fills = [{ type: "SOLID", color: COLORS.cardBg, opacity: 0.95 }];
  navBar.strokes = [{ type: "SOLID", color: COLORS.cyan, opacity: 0.2 }];
  navBar.strokeWeight = 1;
  navBar.layoutMode = "HORIZONTAL";
  navBar.primaryAxisAlignItems = "SPACE_AROUND";
  navBar.counterAxisAlignItems = "CENTER";

  navBar.appendChild(createText("🏠 Feed", 12, "Bold", COLORS.cyan));
  navBar.appendChild(createText("🌐 Network", 12, "Regular", COLORS.gray500));
  navBar.appendChild(createText("➕", 18, "Bold", COLORS.cyan));
  navBar.appendChild(createText("💬 Chat", 12, "Regular", COLORS.gray500));
  navBar.appendChild(createText("👤 Profile", 12, "Regular", COLORS.gray500));

  feedScreen.appendChild(navBar);

  // --------------------------------------------------------------------------
  // SCREEN 2: USER PROFILE & PORTFOLIO (iPhone 16 Pro: 393 x 852)
  // --------------------------------------------------------------------------
  const profileScreen = figma.createFrame();
  profileScreen.name = "📱 02 - Profile & Portfolio";
  profileScreen.resize(393, 852);
  profileScreen.x = 440;
  profileScreen.y = 0;
  profileScreen.fills = [{ type: "SOLID", color: COLORS.bgDark }];
  profileScreen.cornerRadius = 48;
  profileScreen.clipsContent = true;

  // Profile Header Avatar & Info
  const profileHeader = figma.createFrame();
  profileHeader.resize(353, 240);
  profileHeader.x = 20;
  profileHeader.y = 60;
  profileHeader.fills = [];
  profileHeader.layoutMode = "VERTICAL";
  profileHeader.counterAxisAlignItems = "CENTER";
  profileHeader.itemSpacing = 8;

  const profAvatar = figma.createFrame();
  profAvatar.resize(80, 80);
  profAvatar.cornerRadius = 40;
  profAvatar.fills = [{ type: "SOLID", color: COLORS.cardHover }];
  profAvatar.strokes = [{ type: "SOLID", color: COLORS.cyan }];
  profAvatar.strokeWeight = 3;
  profileHeader.appendChild(profAvatar);

  profileHeader.appendChild(createText("Subhan Chaudhry ✓", 18, "Bold", COLORS.white));
  profileHeader.appendChild(createText("Senior Full-Stack Architect | React Native & Node.js", 12, "Medium", COLORS.cyan));
  profileHeader.appendChild(createText("📍 San Francisco, CA • 42 Mutual Connections", 11, "Regular", COLORS.gray500));

  // CTA Buttons Row
  const ctaRow = figma.createFrame();
  ctaRow.fills = [];
  ctaRow.layoutMode = "HORIZONTAL";
  ctaRow.itemSpacing = 12;
  ctaRow.resize(320, 42);

  const connectBtn = figma.createFrame();
  connectBtn.resize(150, 42);
  connectBtn.cornerRadius = 14;
  connectBtn.fills = [{ type: "SOLID", color: COLORS.cyan }];
  connectBtn.layoutMode = "HORIZONTAL";
  connectBtn.primaryAxisAlignItems = "CENTER";
  connectBtn.counterAxisAlignItems = "CENTER";
  connectBtn.appendChild(createText("➕ Connect", 12, "Bold", COLORS.bgDark));

  const msgBtn = figma.createFrame();
  msgBtn.resize(150, 42);
  msgBtn.cornerRadius = 14;
  msgBtn.fills = [{ type: "SOLID", color: COLORS.cardBg }];
  msgBtn.strokes = [{ type: "SOLID", color: COLORS.white, opacity: 0.15 }];
  msgBtn.strokeWeight = 1;
  msgBtn.layoutMode = "HORIZONTAL";
  msgBtn.primaryAxisAlignItems = "CENTER";
  msgBtn.counterAxisAlignItems = "CENTER";
  msgBtn.appendChild(createText("💬 Message", 12, "Bold", COLORS.white));

  ctaRow.appendChild(connectBtn);
  ctaRow.appendChild(msgBtn);
  profileHeader.appendChild(ctaRow);
  profileScreen.appendChild(profileHeader);

  // Stats Grid
  const statsBox = figma.createFrame();
  statsBox.resize(353, 70);
  statsBox.x = 20;
  statsBox.y = 310;
  statsBox.cornerRadius = 16;
  statsBox.fills = [{ type: "SOLID", color: COLORS.cardBg }];
  statsBox.strokes = [{ type: "SOLID", color: COLORS.white, opacity: 0.08 }];
  statsBox.strokeWeight = 1;
  statsBox.layoutMode = "HORIZONTAL";
  statsBox.primaryAxisAlignItems = "SPACE_AROUND";
  statsBox.counterAxisAlignItems = "CENTER";

  const statItems = [
    { label: "Connections", val: "1.4k" },
    { label: "Posts", val: "248" },
    { label: "Repositories", val: "34" }
  ];
  statItems.forEach(s => {
    const item = figma.createFrame();
    item.fills = [];
    item.layoutMode = "VERTICAL";
    item.counterAxisAlignItems = "CENTER";
    item.appendChild(createText(s.val, 16, "Bold", COLORS.white));
    item.appendChild(createText(s.label, 11, "Regular", COLORS.gray500));
    statsBox.appendChild(item);
  });
  profileScreen.appendChild(statsBox);

  // Skills Pills Section
  const skillsBox = figma.createFrame();
  skillsBox.resize(353, 140);
  skillsBox.x = 20;
  skillsBox.y = 395;
  skillsBox.cornerRadius = 16;
  skillsBox.fills = [{ type: "SOLID", color: COLORS.cardBg }];
  skillsBox.strokes = [{ type: "SOLID", color: COLORS.white, opacity: 0.08 }];
  skillsBox.strokeWeight = 1;
  skillsBox.paddingLeft = 16;
  skillsBox.paddingRight = 16;
  skillsBox.paddingTop = 16;
  skillsBox.layoutMode = "VERTICAL";
  skillsBox.itemSpacing = 10;

  skillsBox.appendChild(createText("Tech Stack & Skills", 13, "Bold", COLORS.white));

  const tagsRow = figma.createFrame();
  tagsRow.fills = [];
  tagsRow.layoutMode = "HORIZONTAL";
  tagsRow.itemSpacing = 8;

  ["React Native", "TypeScript", "Node.js", "GraphQL", "AWS"].forEach(tag => {
    const pill = figma.createFrame();
    pill.cornerRadius = 8;
    pill.fills = [{ type: "SOLID", color: COLORS.cardHover }];
    pill.strokes = [{ type: "SOLID", color: COLORS.cyan, opacity: 0.2 }];
    pill.strokeWeight = 1;
    pill.paddingLeft = 10;
    pill.paddingRight = 10;
    pill.paddingTop = 6;
    pill.paddingBottom = 6;
    pill.appendChild(createText(tag, 11, "Medium", COLORS.cyan));
    tagsRow.appendChild(pill);
  });
  skillsBox.appendChild(tagsRow);
  profileScreen.appendChild(skillsBox);

  // --------------------------------------------------------------------------
  // SCREEN 3: REAL-TIME CHAT (iPhone 16 Pro: 393 x 852)
  // --------------------------------------------------------------------------
  const chatScreen = figma.createFrame();
  chatScreen.name = "📱 03 - Real-Time Chat";
  chatScreen.resize(393, 852);
  chatScreen.x = 880;
  chatScreen.y = 0;
  chatScreen.fills = [{ type: "SOLID", color: COLORS.bgDark }];
  chatScreen.cornerRadius = 48;
  chatScreen.clipsContent = true;

  // Chat Top Bar
  const chatTopBar = figma.createFrame();
  chatTopBar.resize(393, 70);
  chatTopBar.y = 44;
  chatTopBar.fills = [{ type: "SOLID", color: COLORS.cardBg }];
  chatTopBar.strokes = [{ type: "SOLID", color: COLORS.white, opacity: 0.05 }];
  chatTopBar.strokeWeight = 1;
  chatTopBar.layoutMode = "HORIZONTAL";
  chatTopBar.counterAxisAlignItems = "CENTER";
  chatTopBar.paddingLeft = 20;
  chatTopBar.itemSpacing = 12;

  const chatAvatar = figma.createFrame();
  chatAvatar.resize(40, 40);
  chatAvatar.cornerRadius = 20;
  chatAvatar.fills = [{ type: "SOLID", color: COLORS.purple }];

  const chatMeta = figma.createFrame();
  chatMeta.fills = [];
  chatMeta.layoutMode = "VERTICAL";
  chatMeta.itemSpacing = 2;
  chatMeta.appendChild(createText("Sarah Chen ✓", 13, "Bold", COLORS.white));
  chatMeta.appendChild(createText("🟢 Active Now • Senior AI Engineer", 10, "Regular", COLORS.green));

  chatTopBar.appendChild(createText("←", 16, "Bold", COLORS.white));
  chatTopBar.appendChild(chatAvatar);
  chatTopBar.appendChild(chatMeta);
  chatScreen.appendChild(chatTopBar);

  // Received Bubble
  const recvBubble = figma.createFrame();
  recvBubble.resize(260, 60);
  recvBubble.x = 20;
  recvBubble.y = 140;
  recvBubble.cornerRadius = 16;
  recvBubble.fills = [{ type: "SOLID", color: COLORS.cardBg }];
  recvBubble.strokes = [{ type: "SOLID", color: COLORS.white, opacity: 0.08 }];
  recvBubble.strokeWeight = 1;
  recvBubble.paddingLeft = 14;
  recvBubble.paddingTop = 12;
  recvBubble.appendChild(createText("Hey Subhan! Loved your latest post on React Native architecture.", 12, "Regular", COLORS.gray300));
  chatScreen.appendChild(recvBubble);

  // Sent Bubble
  const sentBubble = figma.createFrame();
  sentBubble.resize(250, 60);
  sentBubble.x = 123;
  sentBubble.y = 215;
  sentBubble.cornerRadius = 16;
  sentBubble.fills = [{ type: "SOLID", color: COLORS.cyan }];
  sentBubble.paddingLeft = 14;
  sentBubble.paddingTop = 12;
  sentBubble.appendChild(createText("Thanks Sarah! Here is the repo snippet we used for the bridge:", 12, "Medium", COLORS.bgDark));
  chatScreen.appendChild(sentBubble);

  // Chat Input Bar
  const chatInput = figma.createFrame();
  chatInput.resize(353, 56);
  chatInput.x = 20;
  chatInput.y = 760;
  chatInput.cornerRadius = 28;
  chatInput.fills = [{ type: "SOLID", color: COLORS.cardBg }];
  chatInput.strokes = [{ type: "SOLID", color: COLORS.cyan, opacity: 0.3 }];
  chatInput.strokeWeight = 1;
  chatInput.layoutMode = "HORIZONTAL";
  chatInput.primaryAxisAlignItems = "SPACE_BETWEEN";
  chatInput.counterAxisAlignItems = "CENTER";
  chatInput.paddingLeft = 16;
  chatInput.paddingRight = 8;

  chatInput.appendChild(createText("Write a developer message...", 12, "Regular", COLORS.gray500));

  const sendBtn = figma.createFrame();
  sendBtn.resize(40, 40);
  sendBtn.cornerRadius = 20;
  sendBtn.fills = [{ type: "SOLID", color: COLORS.cyan }];
  sendBtn.layoutMode = "HORIZONTAL";
  sendBtn.primaryAxisAlignItems = "CENTER";
  sendBtn.counterAxisAlignItems = "CENTER";
  sendBtn.appendChild(createText("➤", 14, "Bold", COLORS.bgDark));
  chatInput.appendChild(sendBtn);

  chatScreen.appendChild(chatInput);

  // Zoom to fit generated screens
  figma.viewport.scrollAndZoomIntoView([feedScreen, profileScreen, chatScreen]);
  console.log("🎉 SUCCESS: DevHub Mobile Screens generated on Figma Canvas!");
})();
