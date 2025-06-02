/**
 * Mindful Breaks - Popup.js
 * Manages timer functionality for the popup interface
 */

// DOM element references
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const minutesInput = document.getElementById("work-minutes");
const countdownDisplay = document.getElementById("countdown");
let timer;
let timeLeft = 0;
let isPaused = false;

// Check for existing timer on popup load
document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ action: 'getTimerState' }, (timerState) => {
    if (timerState && timerState.active) {
      // Restore timer state
      timeLeft = timerState.remainingTime;
      isPaused = timerState.paused;
      
      // Update UI to match current state
      startBtn.classList.add("hidden");
      pauseBtn.classList.remove("hidden");
      pauseBtn.textContent = isPaused ? "Resume" : "Pause";
      
      // Display current time
      countdownDisplay.textContent = formatTime(timeLeft);
      
      // Start the countdown if not paused
      if (!isPaused) {
        startCountdown();
      }
    }
  });
});

// Start button event listener
startBtn.addEventListener("click", () => {
  // Get and validate work duration
  const workMinutes = parseInt(minutesInput.value);
  if (isNaN(workMinutes) || workMinutes < 1) return;

  // Show pause button, hide start button
  startBtn.classList.add("hidden");
  pauseBtn.classList.remove("hidden");
  pauseBtn.textContent = "Pause";
  isPaused = false;

  // Initialize timer if it's a new session
  if (timeLeft === 0) {
    timeLeft = workMinutes * 60; // Convert to seconds

    // Notify background script to start tracking the timer
    chrome.runtime.sendMessage({
      action: 'startTimer',
      minutes: workMinutes
    });
  }

  // Display initial time
  countdownDisplay.textContent = formatTime(timeLeft);

  // Start countdown
  startCountdown();
});

// Pause button event listener
pauseBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";

  // Notify background script about pause/resume
  chrome.runtime.sendMessage({
    action: isPaused ? 'pauseTimer' : 'resumeTimer',
    timeLeft: timeLeft
  });
  
  // If resumed, restart the countdown
  if (!isPaused) {
    startCountdown();
  } else {
    // If paused, clear the interval
    clearInterval(timer);
  }
});

// Function to start the countdown
function startCountdown() {
  // Clear any existing interval
  clearInterval(timer);
  
  // Start the timer
  timer = setInterval(() => {
    // Synchronize with background timer
    chrome.runtime.sendMessage({ action: 'getTimerState' }, (timerState) => {
      if (timerState && timerState.active) {
        // Update local time with background time
        timeLeft = timerState.remainingTime;
        isPaused = timerState.paused;
        pauseBtn.textContent = isPaused ? "Resume" : "Pause";
        
        // Update display
        countdownDisplay.textContent = formatTime(timeLeft);
        
        // If timer has completed or is paused
        if (timeLeft <= 0 || isPaused) {
          clearInterval(timer);
          
          if (timeLeft <= 0) {
            resetTimerUI();
          }
        }
      } else {
        // If timer is no longer active in background
        clearInterval(timer);
        resetTimerUI();
      }
    });
  }, 1000);
}

// Function to reset timer UI
function resetTimerUI() {
  startBtn.classList.remove("hidden");
  pauseBtn.classList.add("hidden");
  timeLeft = 0;
  isPaused = false;
  countdownDisplay.textContent = "";
}

/**
 * Formats seconds into MM:SS display format
 * @param {number} seconds - Time in seconds
 * @return {string} Formatted time string (MM:SS)
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}