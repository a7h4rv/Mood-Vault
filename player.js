let audio = null;
let playTimer = null;
let startTime = 0;
let isPlaying = false;

document.addEventListener("DOMContentLoaded", () => {
  const playPauseBtn = document.getElementById("play-pause-btn");
  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");

  playPauseBtn.addEventListener("click", togglePlayPause);
  nextBtn.addEventListener("click", nextTrack);
  prevBtn.addEventListener("click", prevTrack);

  const savedPlaylist = JSON.parse(sessionStorage.getItem("playlist") || "[]");
  const savedIndex = parseInt(sessionStorage.getItem("currentTrackIndex") || "0");
  if (savedPlaylist.length) {
    window.moodPlaylist = savedPlaylist;
    window.currentTrackIndex = savedIndex;
    updatePlayerUI(savedPlaylist[savedIndex]);
  }
});

function playTrack(index) {
  const playlist = JSON.parse(sessionStorage.getItem("playlist") || "[]");
  if (!playlist[index]) return;

  const track = playlist[index];
  if (audio) audio.pause();

  audio = new Audio(track.audio);
  audio.play().then(() => {
    isPlaying = true;
    window.isAudioPlaying = true;
    setPlayIcon(true);
  }).catch(() => {});

  updatePlayerUI(track);
  updateStats("track", track.name);
  startTime = Date.now();

  if (playTimer) clearInterval(playTimer);
  playTimer = setInterval(trackListeningTime, 5000);

  audio.onended = () => nextTrack();
}

function togglePlayPause() {
  if (!audio) return;

  if (audio.paused) {
    audio.play().then(() => {
      isPlaying = true;
      window.isAudioPlaying = true;
      setPlayIcon(true);
    });
  } else {
    audio.pause();
    isPlaying = false;
    window.isAudioPlaying = false;
    setPlayIcon(false);
    stopParticlesAfterDelay();
  }
}

function setPlayIcon(playing) {
  const icon = document.querySelector("#play-pause-btn i");
  if (!icon) return;
  icon.className = playing ? "bi bi-pause-fill" : "bi bi-play-fill";
}

function nextTrack() {
  const playlist = JSON.parse(sessionStorage.getItem("playlist") || "[]");
  if (!playlist.length) return;
  window.currentTrackIndex = (window.currentTrackIndex + 1) % playlist.length;
  sessionStorage.setItem("currentTrackIndex", window.currentTrackIndex);
  playTrack(window.currentTrackIndex);
}

function prevTrack() {
  const playlist = JSON.parse(sessionStorage.getItem("playlist") || "[]");
  if (!playlist.length) return;
  window.currentTrackIndex = (window.currentTrackIndex - 1 + playlist.length) % playlist.length;
  sessionStorage.setItem("currentTrackIndex", window.currentTrackIndex);
  playTrack(window.currentTrackIndex);
}

function updatePlayerUI(track) {
  document.getElementById("track-title").textContent = track.name || "Unknown Track";
  document.getElementById("track-artist").textContent = track.artist || "";
  document.getElementById("artwork").src = track.image || "";
}

function trackListeningTime() {
  if (!isPlaying) return;
  const elapsed = (Date.now() - startTime) / 1000;
  const stats = JSON.parse(localStorage.getItem("vibeStats") || "{}");
  stats.totalListeningTime = (stats.totalListeningTime || 0) + elapsed;
  localStorage.setItem("vibeStats", JSON.stringify(stats));
  startTime = Date.now();
}

function stopParticlesAfterDelay() {
  if (window.particleTimer) clearTimeout(window.particleTimer);
  window.particleTimer = setTimeout(() => {
    if (!window.isAudioPlaying) stopParticles();
  }, 10000);
}
