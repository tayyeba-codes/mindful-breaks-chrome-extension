/**
 * Mindful Breaks - Popup.js
 * Manages timer functionality for the popup interface
 */

// DOM element references
const startBtn = document.getElementById("start-btn");
const minutesInput = document.getElementById("work-minutes");
const countdownDisplay = document.getElementById("countdown");
let timer;

// Start button event listener
startBtn.addEventListener("click", () => {
  // Get and validate work duration
  const workMinutes = parseInt(minutesInput.value);
  if (isNaN(workMinutes) || workMinutes < 1) return;

  const workTime = workMinutes * 60; // Convert to seconds
  let timeLeft = workTime;

  // Display initial time
  countdownDisplay.textContent = formatTime(timeLeft);

  // Notify background script to start tracking the timer
  chrome.runtime.sendMessage({
    action: 'startTimer',
    minutes: workMinutes
  });

  // Start countdown display
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    countdownDisplay.textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timer);
      // Timer complete notification will be handled by background.js
    }
  }, 1000);
});

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