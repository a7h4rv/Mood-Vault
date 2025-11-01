document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  nav.innerHTML = `
    <div class="nav-container">
      <a href="index.html" class="nav-link">Home</a>
      <a href="search.html" class="nav-link">Search</a>
      <a href="stats.html" class="nav-link">Stats</a>
    </div>
  `;

  // Restore persistent player info across pages
  const playerBar = document.getElementById("player-bar");
  if (playerBar && sessionStorage.getItem("playlist")) {
    const savedPlaylist = JSON.parse(sessionStorage.getItem("playlist"));
    const currentIndex = parseInt(sessionStorage.getItem("currentTrackIndex") || 0);
    const track = savedPlaylist[currentIndex];
    if (track) {
      document.getElementById("track-title").textContent = track.name;
      document.getElementById("track-artist").textContent = track.artist;
      document.getElementById("artwork").src = track.image;
    }
  }
});
