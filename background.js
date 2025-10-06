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
  blockedMessage: 'Time limit exceeded. Take a break and refocus on your priorities.'
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Productivity Blocker extension installed.');
  // Initialize settings if not exist
  chrome.storage.sync.get(defaultSettings, (settings) => {
    chrome.storage.sync.set(settings);
    loadSettings();
  });
  // Initialize timeSpent from storage
  chrome.storage.local.get(['timeSpent'], (result) => {
    timeSpent = result.timeSpent || {};
  });
  // Open options page for new users with a small delay
  setTimeout(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  }, 1000);
});

// Initialize on startup as well
chrome.runtime.onStartup.addListener(() => {
  loadSettings();
  chrome.storage.local.get(['timeSpent'], (result) => {
    timeSpent = result.timeSpent || {};
  });
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
    
    console.log('Settings loaded:', { timeLimits, reminderMessages });
    
    // Register content scripts dynamically
    registerContentScripts();
  });
}

// Register content scripts dynamically based on enabled sites
async function registerContentScripts() {
  try {
    // Unregister existing content scripts
    await chrome.scripting.unregisterContentScripts();
    console.log('Unregistered existing content scripts');
  } catch (e) {
    console.log('No existing content scripts to unregister or error:', e);
  }

  // Register new scripts for enabled domains
  const scripts = Object.keys(timeLimits).map(domain => ({
    id: `content-${domain}`,
    matches: [`*://*.${domain}/*`],
    js: ['content.js'],
    css: ['styles.css']
  }));

  if (scripts.length > 0) {
    try {
      await chrome.scripting.registerContentScripts(scripts);
      console.log('Content scripts registered for domains:', Object.keys(timeLimits));
    } catch (e) {
      console.error('Error registering content scripts:', e);
    }
  }
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
    if (tab && tab.url && tab.url.startsWith('http')) {
      const url = new URL(tab.url);
      const domain = url.hostname.replace('www.', '');
      
      console.log(`Checking domain: ${domain}, timeLimits:`, timeLimits);
      
      if (timeLimits[domain]) {
        timeSpent[domain] = (timeSpent[domain] || 0) + 1000;
        
        console.log(`Time spent on ${domain}: ${timeSpent[domain]}ms, limit: ${timeLimits[domain]}ms`);
        
        if (timeSpent[domain] >= timeLimits[domain]) {
          console.log(`Time limit exceeded for ${domain}, redirecting...`);
          
          // Redirect to blocked page
          const blockedUrl = chrome.runtime.getURL('blocked.html');
          chrome.tabs.update(tab.id, { url: blockedUrl });
          
          // Reset time
          timeSpent[domain] = 0;
          
          // Show notification
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
    console.error('Error in time checking:', e);
  }
}, 1000);