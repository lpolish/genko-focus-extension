// Background script for Productivity Blocker
let timeLimits = {};
let timeSpent = {};
let reminderMessages = {};
let blockedMessage = 'Time limit exceeded. Focus on your goals!';

const defaultSettings = {
  sites: {
    'facebook.com': { enabled: true, timeLimit: 7, message: 'Stay productive! Avoid distractions.' },
    'twitter.com': { enabled: true, timeLimit: 7, message: 'Focus on your goals!' },
    'instagram.com': { enabled: true, timeLimit: 7, message: 'Time to be productive!' },
    'tiktok.com': { enabled: true, timeLimit: 7, message: 'Distractions blocked. Get back to work!' },
    'reddit.com': { enabled: true, timeLimit: 7, message: 'Prioritize productivity!' },
    'youtube.com': { enabled: true, timeLimit: 3600, message: 'YouTube time up. Focus on tasks!' }
  },
  defaultTime: 300,
  reminderMessage: 'Stay focused and productive! Avoid distractions.',
  blockedMessage: 'Time limit exceeded. Redirecting to help you stay on track.'
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Productivity Blocker extension installed.');
  // Initialize settings if not exist
  chrome.storage.sync.get(defaultSettings, (settings) => {
    chrome.storage.sync.set(settings);
    loadSettings();
  });
  // Open options page for new users
  chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
});

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    timeLimits = {};
    reminderMessages = {};
    for (const [domain, config] of Object.entries(settings.sites)) {
      if (config.enabled) {
        timeLimits[domain] = config.timeLimit * 1000; // convert to ms
        reminderMessages[domain] = config.message;
      }
    }
    blockedMessage = settings.blockedMessage;
  });
}

// Reload settings when changed
chrome.storage.onChanged.addListener(() => {
  loadSettings();
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
            message: reminderMessages[domain] || 'Focus on your productivity!'
          });
        }
      }
    }
  } catch (e) {
    // Ignore errors, e.g., invalid URL
  }
}, 1000);