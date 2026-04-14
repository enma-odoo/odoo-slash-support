// ==========================================
// ICON & OVERLAY SETUP
// ==========================================

// Create a 16x16 completely transparent (invisible) image
const transparentIcon = new ImageData(16, 16);

// Create the default fallback "O" icon
function createDefaultIcon() {
  const canvas = new OffscreenCanvas(16, 16);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#714B67'; 
  ctx.beginPath();
  ctx.arc(8, 8, 7, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('O', 8, 8);
  return ctx.getImageData(0, 0, 16, 16);
}

const defaultIcon = createDefaultIcon();

// Start with the default icon
chrome.action.setIcon({ imageData: defaultIcon });

// ==========================================
// FEATURE 1: Click Icon to Append /_odoo/support
// ==========================================
chrome.action.onClicked.addListener((tab) => {
  if (tab.url) {
    try {
      let url = new URL(tab.url);
      if (!url.pathname.startsWith('/_odoo/support')) {
        url.pathname = '/_odoo/support';
        chrome.tabs.update(tab.id, { url: url.href });
      }
    } catch (e) { console.error(e); }
  }
});

// ==========================================
// FEATURE 2: Auto-Detect and Version Badging
// ==========================================
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('http')) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      world: "MAIN",
      func: () => {
        const v = window.odoo?.session_info?.server_version || window.odoo?.info?.server_version;
        const db = window.odoo?.session_info?.db || "Unknown DB";
        return { version: v || null, db: db };
      }
    }).then(results => {
      const res = results?.[0]?.result;
      if (res?.version) {
        const match = res.version.match(/(\d+\.\d+)/);
        if (match) {
          // 1. Set the Badge Text (Uses native Chrome positioning)
          chrome.action.setBadgeText({ text: match[1], tabId: tabId });
          
          // 2. Set the Badge Background Color
          let color = "#714B67"; // Purple
          if (res.version.includes("saas~")) {
            color = "#00A09D"; // Teal
          } else if (!res.version.includes("+e")) {
            color = "#666666"; // Gray
          }
          chrome.action.setBadgeBackgroundColor({ color: color, tabId: tabId });

          // 3. HIDE THE ICON (Switch to transparent)
          chrome.action.setIcon({ imageData: transparentIcon, tabId: tabId });

          // 4. Set Tooltip
          chrome.action.setTitle({ 
            title: `Database: ${res.db}\nVersion: ${res.version}`, 
            tabId: tabId 
          });
        }
      } else {
        // Reset to default on non-Odoo pages
        chrome.action.setBadgeText({ text: "", tabId: tabId });
        chrome.action.setIcon({ imageData: defaultIcon, tabId: tabId });
        chrome.action.setTitle({ title: "Odoo Support & Version", tabId: tabId });
      }
    }).catch(() => {});
  }
});