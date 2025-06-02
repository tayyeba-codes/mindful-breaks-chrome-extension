/**
 * Mindful Breaks - Break.js
 * Manages break activities and timers
 */

// DOM element references
const breatheBtn = document.getElementById("breatheBtn");
const stepAwayBtn = document.getElementById("stepAwayBtn");
const exerciseArea = document.getElementById("exerciseArea");
const breakControls = document.getElementById("breakControls");
const pauseBreakBtn = document.getElementById("pauseBreakBtn");
const resetBreakBtn = document.getElementById("resetBreakBtn");

// Timer variables
let breakTimer;
let breakTimeLeft = 0;
let isBreakPaused = false;
let breathingInterval;

// Event listeners for break type selection
breatheBtn.addEventListener("click", showBreathingExercise);
stepAwayBtn.addEventListener("click", showStepAwayTimer);

// Pause/resume break timer
pauseBreakBtn.addEventListener("click", () => {
  isBreakPaused = !isBreakPaused;
  pauseBreakBtn.textContent = isBreakPaused ? "Resume" : "Pause";
});

// Reset break timer
resetBreakBtn.addEventListener("click", () => {
  if (breathingInterval) {
    clearInterval(breathingInterval);
  }
  if (breakTimer) {
    clearInterval(breakTimer);
  }
  exerciseArea.innerHTML = '';
  breakControls.classList.add("hidden");
  
  // Show break type selection again
  document.querySelectorAll(".buttons button").forEach(btn => {
    btn.style.display = "block";
  });
});

/**
 * Displays and controls the breathing exercise
 */
function showBreathingExercise() {
  // Hide break type selection buttons
  document.querySelectorAll(".buttons button").forEach(btn => {
    btn.style.display = "none";
  });
  
  // Create the breathing exercise UI
  exerciseArea.innerHTML = `
    <div class="breathing-circle"></div>
    <p id="breatheText">Breathe in...</p>
  `;

  const text = document.getElementById("breatheText");
  const circle = document.querySelector(".breathing-circle");

  // Show break controls
  breakControls.classList.remove("hidden");
  pauseBreakBtn.textContent = "Pause";
  isBreakPaused = false;

  // Control the breathing phases
  let phase = 0;
  breathingInterval = setInterval(() => {
    if (!isBreakPaused) {
      phase = (phase + 1) % 3;
      
      // Update UI based on current breathing phase
      if (phase === 0) {
        text.textContent = "Breathe in...";
        circle.style.transform = "scale(1.2)";
      } else if (phase === 1) {
        text.textContent = "Hold...";
        circle.style.transform = "scale(1.4)";
      } else {
        text.textContent = "Breathe out...";
        circle.style.transform = "scale(1)";
      }
    }
  }, 4000); // Each phase lasts 4 seconds
}

/**
 * Displays and controls the step-away timer
 */
function showStepAwayTimer() {
  // Hide break type selection buttons
  document.querySelectorAll(".buttons button").forEach(btn => {
    btn.style.display = "none";
  });
  
  // Create the step away timer UI with duration input
  exerciseArea.innerHTML = `
    <div class="break-timer-setup">
      <label for="break-minutes">Break duration (minutes):</label>
      <input type="number" id="break-minutes" min="1" max="30" value="5" />
      <button id="startBreakTimer">Start Timer</button>
    </div>
    <div class="break-timer-display hidden">
      <p>Step away for your break.</p>
      <p id="breakCountdown" class="large-timer">05:00</p>
    </div>
  `;

  // Set up event listener for starting the break timer
  document.getElementById("startBreakTimer").addEventListener("click", () => {
    const breakMinutes = parseInt(document.getElementById("break-minutes").value);
    if (isNaN(breakMinutes) || breakMinutes < 1) return;
    
    // Hide setup, show timer
    document.querySelector(".break-timer-setup").classList.add("hidden");
    document.querySelector(".break-timer-display").classList.remove("hidden");
    
    // Show break controls
    breakControls.classList.remove("hidden");
    pauseBreakBtn.textContent = "Pause";
    isBreakPaused = false;
    
    // Set up the countdown
    breakTimeLeft = breakMinutes * 60; // Convert to seconds
    const countdown = document.getElementById("breakCountdown");
    
    // Format and display initial time
    updateBreakTimerDisplay(countdown, breakTimeLeft);
    
    breakTimer = setInterval(() => {
      if (!isBreakPaused) {
        breakTimeLeft--;
        updateBreakTimerDisplay(countdown, breakTimeLeft);
        
        // Handle timer completion
        if (breakTimeLeft <= 0) {
          clearInterval(breakTimer);
          countdown.textContent = "Time's up!";
        }
      }
    }, 1000);
  });
}

/**
 * Updates the break timer display
 * @param {Element} element - The DOM element to update
 * @param {number} timeInSeconds - Current time in seconds
 */
function updateBreakTimerDisplay(element, timeInSeconds) {
  const minutes = String(Math.floor(timeInSeconds / 60)).padStart(2, "0");
  const seconds = String(timeInSeconds % 60).padStart(2, "0");
  element.textContent = `${minutes}:${seconds}`;
}