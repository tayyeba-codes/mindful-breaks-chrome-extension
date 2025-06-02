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

  // Start countdown display
  clearInterval(timer);
  timer = setInterval(() => {
    if (!isPaused) {
      timeLeft--;
      countdownDisplay.textContent = formatTime(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timer);
        resetTimerUI();
        // Timer complete notification will be handled by background.js
      }
    }
  }, 1000);
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
});

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