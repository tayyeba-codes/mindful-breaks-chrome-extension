/**
 * Mindful Breaks - Background.js
 * Manages background processes for the extension including
 * timers, notifications, and session state
 */

// Variables to manage timer state
let workSessionAlarm = null;
let isPaused = false;
let remainingTime = 0;
let timerInterval = null;
let timerEndTime = 0;

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
    
    // Calculate end time
    const totalSeconds = minutes * 60;
    timerEndTime = Date.now() + (totalSeconds * 1000);
    
    // Store timer state
    const timerState = {
      active: true,
      paused: false,
      endTime: timerEndTime,
      totalDuration: minutes * 60,
      remainingTime: minutes * 60
    };
    
    chrome.storage.local.set({ timerState });
    
    // Create an alarm for when the work session ends
    chrome.alarms.create("workSession", { delayInMinutes: minutes });
    workSessionAlarm = { minutes: minutes, startTime: Date.now() };
    
    // Store current session type
    chrome.storage.local.set({ sessionType: "work" });
    
    // Start background tracking of time
    startBackgroundTimer(totalSeconds);
    
    // Send response if callback exists
    if (sendResponse) {
      sendResponse({ success: true });
    }
  }
  // Handle timer pause request
  else if (message.action === 'pauseTimer') {
    isPaused = true;
    remainingTime = message.timeLeft;
    
    // Clear the current alarm
    chrome.alarms.clear("workSession");
    
    // Update stored timer state
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState) {
        const updatedTimerState = {
          ...result.timerState,
          paused: true,
          remainingTime: remainingTime
        };
        chrome.storage.local.set({ timerState: updatedTimerState });
      }
    });
    
    console.log('Timer paused with', remainingTime, 'seconds remaining');
    
    // Send response if callback exists
    if (sendResponse) {
      sendResponse({ success: true });
    }
  }
  // Handle timer resume request
  else if (message.action === 'resumeTimer') {
    isPaused = false;
    
    // Create a new alarm with the remaining time
    const minutesRemaining = remainingTime / 60;
    
    // Calculate new end time
    timerEndTime = Date.now() + (remainingTime * 1000);
    
    // Update stored timer state
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState) {
        const updatedTimerState = {
          ...result.timerState,
          paused: false,
          endTime: timerEndTime,
          remainingTime: remainingTime
        };
        chrome.storage.local.set({ timerState: updatedTimerState });
      }
    });
    
    chrome.alarms.create("workSession", { delayInMinutes: minutesRemaining });
    console.log('Timer resumed with', minutesRemaining, 'minutes remaining');
    
    // Restart background tracking
    startBackgroundTimer(remainingTime);
    
    // Send response if callback exists
    if (sendResponse) {
      sendResponse({ success: true });
    }
  }
  // Handle request for current timer state
  else if (message.action === 'getTimerState') {
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState && sendResponse) {
        // Calculate current remaining time if timer is active and not paused
        if (result.timerState.active && !result.timerState.paused) {
          const currentTime = Date.now();
          const endTime = result.timerState.endTime;
          const remainingMs = Math.max(0, endTime - currentTime);
          result.timerState.remainingTime = Math.ceil(remainingMs / 1000);
        }
        sendResponse(result.timerState);
      } else if (sendResponse) {
        sendResponse(null);
      }
    });
    return true; // Required for async sendResponse
  }
});

// Function to start background timer tracking
function startBackgroundTimer(seconds) {
  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  // Update timer state every second
  timerInterval = setInterval(() => {
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState && result.timerState.active) {
        if (!result.timerState.paused) {
          const currentTime = Date.now();
          const endTime = result.timerState.endTime;
          const remainingMs = Math.max(0, endTime - currentTime);
          const remainingSeconds = Math.ceil(remainingMs / 1000);
          
          // Update remaining time in storage
          chrome.storage.local.set({
            timerState: {
              ...result.timerState,
              remainingTime: remainingSeconds
            }
          });
          
          // If timer has completed
          if (remainingSeconds <= 0) {
            clearInterval(timerInterval);
            
            // Reset timer state
            chrome.storage.local.set({
              timerState: {
                ...result.timerState,
                active: false
              }
            });
          }
        }
      } else {
        // If timer state doesn't exist or is not active, clear the interval
        clearInterval(timerInterval);
      }
    });
  }, 1000);
}

// Handle alarm events (timer completion)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "workSession") {
    // Clear the background timer interval
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    
    // Reset timer state
    chrome.storage.local.set({
      timerState: {
        active: false,
        paused: false
      }
    });
    
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