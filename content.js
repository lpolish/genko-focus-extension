// Content script to inject reminder on social media pages
(function() {
  // Create the reminder banner
  const banner = document.createElement('div');
  banner.id = 'genko-reminder-banner';
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
      🚀 Remember: Put Genko to make money! Avoid social media distractions until it's done. Stay disciplined! 💪
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

  // Optional: Make it reappear after some time or on scroll
  // For now, just show it once per page load
})();