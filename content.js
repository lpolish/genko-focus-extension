// Content script to inject reminder on social media pages
(function() {
  // Get settings from storage
  chrome.storage.sync.get({
    reminderMessage: 'Stay focused and productive! Avoid distractions.',
    sites: {}
  }, (settings) => {
    const url = new URL(window.location.href);
    const domain = url.hostname.replace('www.', '');
    const siteConfig = settings.sites[domain];
    const message = siteConfig && siteConfig.message ? siteConfig.message : settings.reminderMessage;

    // Create the reminder banner
    const banner = document.createElement('div');
    banner.id = 'productivity-reminder-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #ff6b6b;
        color: white;
        text-align: center;
        padding: 10px;
        font-size: 16px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        🚀 ${message}
        <button id="close-banner" style="
          float: right;
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        ">×</button>
      </div>
    `;

    // Append to body
    document.body.appendChild(banner);

    // Add close functionality
    document.getElementById('close-banner').addEventListener('click', function() {
      banner.style.display = 'none';
    });
  });
})();