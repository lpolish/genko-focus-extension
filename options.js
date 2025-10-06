// Options page script
document.addEventListener('DOMContentLoaded', loadSettings);

const defaultSettings = {
  sites: {
    'facebook.com': { enabled: true, timeLimit: 7, message: 'Stay productive! Avoid distractions.' },
    'twitter.com': { enabled: true, timeLimit: 7, message: 'Focus on your goals!' },
    'instagram.com': { enabled: true, timeLimit: 7, message: 'Time to be productive!' },
    'tiktok.com': { enabled: true, timeLimit: 7, message: 'Distractions blocked. Get back to work!' },
    'reddit.com': { enabled: true, timeLimit: 7, message: 'Prioritize productivity!' },
    'youtube.com': { enabled: true, timeLimit: 3600, message: 'YouTube time up. Focus on tasks!' }
  },
  defaultTime: 300, // 5 minutes
  reminderMessage: 'Stay focused and productive! Avoid distractions.',
  blockedMessage: 'Time limit exceeded. Take a break and refocus on your priorities.'
};

function loadSettings() {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    document.getElementById('default-time').value = settings.defaultTime;
    document.getElementById('reminder-message').value = settings.reminderMessage;
    document.getElementById('blocked-message').value = settings.blockedMessage;
    renderSites(settings.sites);
  });
}

function renderSites(sites) {
  const container = document.getElementById('sites-list');
  container.innerHTML = '';
  for (const [domain, config] of Object.entries(sites)) {
    const div = document.createElement('div');
    div.className = 'site-item';
    div.innerHTML = `
      <input type="checkbox" ${config.enabled ? 'checked' : ''} data-domain="${domain}">
      <div class="site-name">${domain}</div>
      <div class="time-col"><input type="number" value="${config.timeLimit}" min="1" data-domain="${domain}" data-type="time"></div>
      <div class="message-col"><input type="text" value="${config.message}" data-domain="${domain}" data-type="message"></div>
      <div class="actions-col"><button data-domain="${domain}" class="remove-site">Remove</button></div>
    `;
    container.appendChild(div);
  }
}

document.getElementById('add-site-btn').addEventListener('click', () => {
  const newSite = document.getElementById('new-site').value.trim();
  if (newSite) {
    chrome.storage.sync.get(defaultSettings, (settings) => {
      if (!settings.sites[newSite]) {
        settings.sites[newSite] = { enabled: true, timeLimit: settings.defaultTime, message: settings.reminderMessage };
        chrome.storage.sync.set(settings, () => {
          renderSites(settings.sites);
          document.getElementById('new-site').value = '';
        });
      }
    });
  }
});

document.getElementById('save-btn').addEventListener('click', () => {
  chrome.storage.sync.get(defaultSettings, (settings) => {
    settings.defaultTime = parseInt(document.getElementById('default-time').value) || 300;
    settings.reminderMessage = document.getElementById('reminder-message').value || defaultSettings.reminderMessage;
    settings.blockedMessage = document.getElementById('blocked-message').value || defaultSettings.blockedMessage;

    // Update sites
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      const domain = cb.dataset.domain;
      if (settings.sites[domain]) {
        settings.sites[domain].enabled = cb.checked;
      }
    });

    const timeInputs = document.querySelectorAll('input[data-type="time"]');
    timeInputs.forEach(input => {
      const domain = input.dataset.domain;
      if (settings.sites[domain]) {
        settings.sites[domain].timeLimit = parseInt(input.value) || settings.defaultTime;
      }
    });

    const messageInputs = document.querySelectorAll('input[data-type="message"]');
    messageInputs.forEach(input => {
      const domain = input.dataset.domain;
      if (settings.sites[domain]) {
        settings.sites[domain].message = input.value || settings.reminderMessage;
      }
    });

    chrome.storage.sync.set(settings, () => {
      document.getElementById('status').textContent = 'Settings saved!';
      setTimeout(() => document.getElementById('status').textContent = '', 2000);
    });
  });
});

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-site')) {
    const domain = e.target.dataset.domain;
    chrome.storage.sync.get(defaultSettings, (settings) => {
      delete settings.sites[domain];
      chrome.storage.sync.set(settings, () => renderSites(settings.sites));
    });
  }
});