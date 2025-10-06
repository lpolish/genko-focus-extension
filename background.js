// Background script for Genko Focus Reminder
const timeLimits = {
  'facebook.com': 7000, // 7 seconds
  'twitter.com': 7000,
  'instagram.com': 7000,
  'tiktok.com': 7000,
  'reddit.com': 7000,
  'youtube.com': 3600000 // 1 hour
};

let timeSpent = {}; // { domain: milliseconds }

chrome.runtime.onInstalled.addListener(() => {
  console.log('Genko Focus Reminder extension installed.');
  // Initialize timeSpent from storage
  chrome.storage.local.get(['timeSpent'], (result) => {
    timeSpent = result.timeSpent || {};
  });
});

// Save timeSpent to storage periodically
setInterval(() => {
  chrome.storage.local.set({ timeSpent });
}, 10000); // every 10 seconds

// Check active tab every second
setInterval(async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const domain = url.hostname.replace('www.', '');
      if (timeLimits[domain]) {
        timeSpent[domain] = (timeSpent[domain] || 0) + 1000;
        if (timeSpent[domain] >= timeLimits[domain]) {
          // Redirect to blocked page
          const blockedUrl = chrome.runtime.getURL('blocked.html');
          chrome.tabs.update(tab.id, { url: blockedUrl });
          // Reset time or notify
          timeSpent[domain] = 0;
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.png',
            title: 'Time Limit Exceeded',
            message: `You've spent too much time on ${domain}. Focus on Genko!`
          });
        }
      }
    }
  } catch (e) {
    // Ignore errors, e.g., invalid URL
  }
}, 1000);