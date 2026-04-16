let isCallActive = false;
let isSpeaking = false;
 
const statusText = document.getElementById("status");
const statusBadge = document.getElementById("statusBadge");
const statusLabel = document.getElementById("statusText");
const pulseRing = document.getElementById("pulseRing");
const waveform = document.getElementById("waveform");
const timerDisplay = document.getElementById("timerDisplay");
 
// Timer
let timerInterval = null;
let seconds = 0;
 
function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}
 
function startTimer() {
  seconds = 0;
  timerDisplay.textContent = "00:00";
  timerInterval = setInterval(() => {
    seconds++;
    timerDisplay.textContent = formatTime(seconds);
  }, 1000);
}
 
function stopTimer() {
  clearInterval(timerInterval);
  timerDisplay.textContent = "";
}
 
function setActiveUI(active) {
  if (pulseRing) pulseRing.className = "pulse-ring" + (active ? " active" : "");
  if (waveform) waveform.className = "waveform" + (active ? " active" : "");
  if (statusBadge) statusBadge.className = "status-badge" + (active ? " active" : "");
  if (statusLabel) statusLabel.textContent = active ? "Live" : "Idle";
}
 
// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
 
recognition.continuous = false;
recognition.lang = "en-US";
recognition.interimResults = false;
 
// Load Voices
let voices = [];
 
function loadVoices() {
  voices = window.speechSynthesis.getVoices();
  console.log("Voices loaded:", voices.map(v => v.name));
}
 
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();
 
// Speak — female voice, humanized
function speak(text) {
  isSpeaking = true;
 
  const speech = new SpeechSynthesisUtterance(text);
 
  // Priority: natural female voices
  let selectedVoice =
    voices.find(v => v.name === "Google UK English Female") ||
    voices.find(v => v.name === "Google US English" && v.name.toLowerCase().includes("female")) ||
    voices.find(v => v.name.includes("Samantha")) ||        // macOS female
    voices.find(v => v.name.includes("Zira")) ||            // Windows female
    voices.find(v => v.name.includes("Victoria")) ||        // macOS female
    voices.find(v => v.name.includes("Karen")) ||           // macOS female
    voices.find(v => v.gender === "female") ||
    voices.find(v => v.lang === "en-US") ||
    voices[0];
 
  speech.voice = selectedVoice;
  speech.rate = 1.05;    // slightly faster = more natural
  speech.pitch = 1.15;   // slightly higher = feminine
  speech.volume = 1;
 
  console.log("Using voice:", selectedVoice?.name);
 
  speech.onend = () => {
    isSpeaking = false;
    if (isCallActive) {
      setTimeout(() => recognition.start(), 300);
    }
  };
 
  speech.onerror = () => {
    isSpeaking = false;
    if (isCallActive) recognition.start();
  };
 
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(speech);
}
 
// AI call
async function getAIResponse(input) {
  try {
    console.log("Sending to AI:", input);
 
    const res = await fetch("https://noorai-kpwz.onrender.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });
 
    const data = await res.json();
    console.log("Noor says:", data.reply);
 
    return data.reply;
 
  } catch (err) {
    console.error(err);
    return "ugh sorry, I think the connection dropped for a sec.";
  }
}
 
// Start Call
document.getElementById("startBtn").onclick = () => {
  isCallActive = true;
  setActiveUI(true);
  statusText.innerText = "Connecting to Noor...";
  startTimer();
 
  setTimeout(() => {
    statusText.innerText = "Noor is talking...";
    speak("hey! how you doing my friend. what's up?");
  }, 400);
};
 
// End Call
document.getElementById("stopBtn").onclick = () => {
  isCallActive = false;
  recognition.stop();
  window.speechSynthesis.cancel();
  setActiveUI(false);
  stopTimer();
  statusText.innerText = "Call ended";
};
 
// On user speaks
recognition.onresult = async (event) => {
  if (!isCallActive || isSpeaking) return;
 
  const text = event.results[0][0].transcript;
  console.log("You said:", text);
  statusText.innerText = "You: " + text;
 
  recognition.stop();
 
  const reply = await getAIResponse(text);
  statusText.innerText = "Noor: " + reply;
 
  setTimeout(() => speak(reply), 500);
};
 
// Errors
recognition.onerror = (event) => {
  console.log("Mic error:", event.error);
  if (isCallActive && !isSpeaking) {
    setTimeout(() => recognition.start(), 500);
  }
};
 
recognition.onend = () => {
  if (isCallActive && !isSpeaking) {
    setTimeout(() => recognition.start(), 300);
  }
};
