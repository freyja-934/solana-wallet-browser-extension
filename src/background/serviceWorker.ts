// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First-time installation
    console.log('Solana Wallet extension installed');
    
    // Initialize storage with default values
    chrome.storage.local.set({
      walletConnected: false,
      lastPage: 'onboarding'
    });
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_WALLET_STATUS') {
    // Return wallet connection status
    chrome.storage.local.get(['walletConnected'], (result) => {
      sendResponse({ connected: result.walletConnected || false });
    });
    return true; // Required for async sendResponse
  }
  
  if (message.type === 'SET_WALLET_STATUS') {
    // Update wallet connection status
    chrome.storage.local.set({ walletConnected: message.connected });
    sendResponse({ success: true });
  }
  
  if (message.type === 'SAVE_LAST_PAGE') {
    // Save the last visited page
    chrome.storage.local.set({ lastPage: message.page });
    sendResponse({ success: true });
  }
  
  if (message.type === 'GET_LAST_PAGE') {
    // Get the last visited page
    chrome.storage.local.get(['lastPage'], (result) => {
      sendResponse({ page: result.lastPage || 'onboarding' });
    });
    return true; // Required for async sendResponse
  }
}); 