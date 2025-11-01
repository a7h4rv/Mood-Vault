// --- CONFIG ---
const JAMENDO_CLIENT_ID = "09db575a";
const API_URL = "https://api.jamendo.com/v3.0/tracks";
const PLAYLIST_LIMIT = 5;

// --- STATE ---
let currentMood = null;
let moodPlaylist = [];
let currentTrackIndex = 0;
let particleTimer = null;
let particles = [];
let isAudioPlaying = false;

// --- DOM REFERENCES ---
const playlistEl = document.getElementById("playlist");
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

// --- CANVAS SETUP ---
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = 200;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- MOOD SELECTION ---
document.querySelectorAll(".mood-tile").forEach(tile => {
  tile.addEventListener("click", async () => {
    currentMood = tile.dataset.mood;
    await fetchMoodTracks(currentMood);
    renderPlaylist();
    updateStats("mood", currentMood);
    startParticles(currentMood);
  });
});

// --- FETCH TRACKS ---
async function fetchMoodTracks(mood) {
  const url = `${API_URL}?client_id=${JAMENDO_CLIENT_ID}&limit=${PLAYLIST_LIMIT}&tags=${mood}&audioformat=mp31`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length) {
      moodPlaylist = data.results.map(track => ({
        name: track.name,
        artist: track.artist_name,
        audio: track.audio,
        image: track.image
      }));
    } else moodPlaylist = [];
  } catch (e) {
    console.warn("Jamendo fetch failed:", e);
    moodPlaylist = [];
  }
}

// --- RENDER PLAYLIST ---
function renderPlaylist() {
  playlistEl.innerHTML = "";
  if (!moodPlaylist.length) {
    playlistEl.innerHTML = "<li class='no-tracks'>No tracks found for this mood.</li>";
    return;
  }

  moodPlaylist.forEach((track, index) => {
    const li = document.createElement("li");
    li.classList.add("playlist-item");
    li.textContent = `${track.name} — ${track.artist}`;
    li.addEventListener("click", () => playSelectedTrack(index));
    playlistEl.appendChild(li);
  });
}

// --- PLAYBACK CONTROL ---
function playSelectedTrack(index) {
  currentTrackIndex = index;
  sessionStorage.setItem("playlist", JSON.stringify(moodPlaylist));
  sessionStorage.setItem("currentTrackIndex", index);
  sessionStorage.setItem("currentMood", currentMood);
  playTrack(index);
  startParticles(currentMood);
}

// --- LOCAL STATS ---
function updateStats(type, value) {
  const stats = JSON.parse(localStorage.getItem("vibeStats") || "{}");
  if (type === "mood") {
    stats.moodCounts = stats.moodCounts || {};
    stats.moodCounts[value] = (stats.moodCounts[value] || 0) + 1;
  } else if (type === "track") {
    stats.trackCounts = stats.trackCounts || {};
    stats.trackCounts[value] = (stats.trackCounts[value] || 0) + 1;
  }
  localStorage.setItem("vibeStats", JSON.stringify(stats));
}

// --- PARTICLE SYSTEM ---
function startParticles(mood) {
  clearTimeout(particleTimer);
  generateParticles(mood);
  animateParticles();

  // keep running while song is playing
  if (isAudioPlaying) return;
  particleTimer = setTimeout(stopParticles, 10000);
}

function stopParticles() {
  particles = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function generateParticles(mood) {
  const colors = {
    focus: "rgba(0,188,212,0.35)",
    chill: "rgba(179,136,255,0.35)",
    energy: "rgba(255,112,67,0.4)",
    sleep: "rgba(63,81,181,0.3)",
    happy: "rgba(255,235,59,0.4)",
    sad: "rgba(144,164,174,0.35)"
  };
  const speedMap = {
    focus: [0.3, 0.8],
    chill: [0.2, 0.5],
    energy: [1.0, 2.0],
    sleep: [0.1, 0.3],
    happy: [0.5, 1.0],
    sad: [0.3, 0.6]
  };

  const color = colors[mood] || "rgba(255,255,255,0.3)";
  const [minSpeed, maxSpeed] = speedMap[mood] || [0.3, 0.8];

  particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -Math.random() * (maxSpeed - minSpeed) - minSpeed,
    drift: (Math.random() - 0.5) * 0.4,
    wobble: Math.random() * 0.5,
    color
  }));
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx + p.drift;
    p.y += p.vy + Math.sin(Date.now() * 0.001 * p.wobble);
    if (p.y < 0 || p.x < 0 || p.x > canvas.width) {
      p.x = Math.random() * canvas.width;
      p.y = canvas.height + 2;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });
  if (particles.length) requestAnimationFrame(animateParticles);
}
