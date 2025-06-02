/**
 * Mindful Breaks - Break.js
 * Manages break activities and timers
 */

// DOM element references
const breatheBtn = document.getElementById("breatheBtn");
const stepAwayBtn = document.getElementById("stepAwayBtn");
const exerciseArea = document.getElementById("exerciseArea");

// Event listeners for break type selection
breatheBtn.addEventListener("click", showBreathingExercise);
stepAwayBtn.addEventListener("click", showStepAwayTimer);

/**
 * Displays and controls the breathing exercise
 */
function showBreathingExercise() {
  // Create the breathing exercise UI
  exerciseArea.innerHTML = `
    <div class="breathing-circle"></div>
    <p id="breatheText">Breathe in...</p>
  `;

  const text = document.getElementById("breatheText");
  const circle = document.querySelector(".breathing-circle");

  // Control the breathing phases
  let phase = 0;
  setInterval(() => {
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
  }, 4000); // Each phase lasts 4 seconds
}

/**
 * Displays and controls the step-away timer
 */
function showStepAwayTimer() {
  // Create the step away timer UI
  exerciseArea.innerHTML = `
    <p>Step away for <strong>5 minutes</strong>.</p>
    <p id="countdown">05:00</p>
  `;

  // Set up the countdown
  let time = 300; // 5 minutes in seconds
  const countdown = document.getElementById("countdown");

  const timer = setInterval(() => {
    time--;
    
    // Format and display the time
    const minutes = String(Math.floor(time / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");
    countdown.textContent = `${minutes}:${seconds}`;

    // Handle timer completion
    if (time <= 0) {
      clearInterval(timer);
      countdown.textContent = "Time's up!";
    }
  }, 1000);
}