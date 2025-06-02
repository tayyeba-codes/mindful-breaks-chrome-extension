/**
 * Mindful Breaks - Background.js
 * Manages background processes for the extension including
 * timers, notifications, and session state
 */

// Variables to manage timer state
let workSessionAlarm = null;
let isPaused = false;
let remainingTime = 0;

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
    workSessionAlarm = { minutes: minutes, startTime: Date.now() };
    
    // Store current session type
    chrome.storage.local.set({ sessionType: "work" });
  }
  // Handle timer pause request
  else if (message.action === 'pauseTimer') {
    isPaused = true;
    remainingTime = message.timeLeft;
    // Clear the current alarm
    chrome.alarms.clear("workSession");
    console.log('Timer paused with', remainingTime, 'seconds remaining');
  }
  // Handle timer resume request
  else if (message.action === 'resumeTimer') {
    isPaused = false;
    // Create a new alarm with the remaining time
    const minutesRemaining = remainingTime / 60;
    chrome.alarms.create("workSession", { delayInMinutes: minutesRemaining });
    console.log('Timer resumed with', minutesRemaining, 'minutes remaining');
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

    // Open break page in a new tab
    chrome.tabs.create({
      url: 'break.html'
    });
  }
});