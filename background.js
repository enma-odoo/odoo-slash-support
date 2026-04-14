chrome.action.onClicked.addListener((tab) => {
  // Check if the tab has a valid URL
  if (tab.url) {
    try {
      let url = new URL(tab.url);
      
      // Prevent it from doing anything if you're already on the support page
      if (!url.pathname.startsWith('/_odoo/support')) {
        
        // Change the path to the support route
        url.pathname = '/_odoo/support';
        
        // Update the current tab to navigate to the new URL
        chrome.tabs.update(tab.id, { url: url.href });
      }
    } catch (error) {
      console.error("Could not parse the URL.", error);
    }
  }
});