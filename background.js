/**
 * Mindful Breaks - Background.js
 * Manages background processes for the extension including
 * timers, notifications, and session state
 */

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Mindful Breaks extension installed.");
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle timer start request
  if (message.action === 'startTimer') {
    const minutes = message.minutes;
    console.log(`Work session started for ${minutes} minutes.`);
    
    // Create an alarm for when the work session ends
    chrome.alarms.create("workSession", { delayInMinutes: minutes });
    
    // Store current session type
    chrome.storage.local.set({ sessionType: "work" });
  }
});

// Handle alarm events (timer completion)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "workSession") {
    // Update session state
    chrome.storage.local.set({ sessionType: "break" });

    // Show notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "assets/logo.png",
      title: "Time for a Break!",
      message: "Take a breather 🌊 — click to open your break.",
      priority: 2
    });

    // Open break page in a new window
    chrome.windows.create({
      url: 'break.html',
      type: 'popup',
      width: 400,
      height: 450
    });
  }
});