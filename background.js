// --- FEATURE 1: Click Icon to Append /_odoo/support ---
chrome.action.onClicked.addListener((tab) => {
  if (tab.url) {
    try {
      let url = new URL(tab.url);
      if (!url.pathname.startsWith('/_odoo/support')) {
        url.pathname = '/_odoo/support';
        chrome.tabs.update(tab.id, { url: url.href });
      }
    } catch (error) {
      console.error("Could not parse the URL.", error);
    }
  }
});

// --- FEATURE 2: Auto-Detect and Display Odoo Version ---
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Execute only when the page finishes loading and is a valid web URL
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      world: "MAIN", // Crucial: allows access to the page's actual window object
      func: () => {
        // Check the global Odoo object for the server version
        const version = window.odoo?.session_info?.server_version || window.odoo?.info?.server_version;
        return version || null;
      }
    }).then(results => {
      if (results && results[0] && results[0].result) {
        const fullVersion = results[0].result;
        
        // Extract just the major/minor version numbers (e.g., extracts "18.0" from "saas~18.0+e")
        const match = fullVersion.match(/(\d+\.\d+)/);
        
        if (match) {
          chrome.action.setBadgeText({ text: match[1], tabId: tabId });
          // Sets the badge background color to Odoo's classic purple
          chrome.action.setBadgeBackgroundColor({ color: "#714B67", tabId: tabId });
        }
      } else {
        // Clear the badge if no Odoo version is found
        chrome.action.setBadgeText({ text: "", tabId: tabId });
      }
    }).catch(err => {
       // Ignore errors on restricted pages (like chrome:// settings pages)
    });
  }
});