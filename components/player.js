class CustomPlayer extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .player-container {
                    background-color: rgba(17, 24, 39, 0.95);
                    backdrop-filter: blur(10px);
                    height: 72px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .progress-bar {
                    height: 2px;
                    background-color: rgba(255, 255, 255, 0.05);
                    width: 100%;
                }
                
                .progress {
                    height: 100%;
                    background-color: #6366f1;
                    width: 0%;
                    transition: width 0.1s linear;
                }
                
                .player-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 100%;
                    padding: 0 1rem;
                    max-width: 100%;
                }
                
                .track-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex: 1;
                    min-width: 0;
                }
                
                .track-details {
                    min-width: 0;
                }
                
                .track-title {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: white;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .track-artist {
                    font-size: 0.75rem;
                    color: rgba(156, 163, 175, 0.8);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .controls {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .control-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .control-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.05);
                }
                
                .play-btn {
                    background: #6366f1;
                    width: 48px;
                    height: 48px;
                }
                
                .play-btn:hover {
                    background: #818cf8;
                    transform: scale(1.08);
                }

                .control-btn i {
                    width: 20px;
                    height: 20px;
                    stroke-width: 2.5;
                }

                .play-btn i {
                    width: 24px;
                    height: 24px;
                }
.cover-image {
                    width: 48px;
                    height: 48px;
                    border-radius: 4px;
                    object-fit: cover;
                }
            </style>
            <div class="player-container fixed bottom-0 w-full">
                <div class="progress-bar">
                    <div class="progress" id="progressBar"></div>
                </div>
                
                <div class="player-content">
                    <div class="track-info">
                        <img id="currentCover" src="http://static.photos/music/200x200/1" alt="Cover" class="cover-image">
                        <div class="track-details">
                            <div id="currentTitle" class="track-title">No track selected</div>
                            <div id="currentArtist" class="track-artist">Select a song to play</div>
                        </div>
                    </div>
                    
                    <div class="controls">
                        <button id="prevBtn" class="control-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="19 20 9 12 19 4 19 20"></polygon>
                                <line x1="5" y1="19" x2="5" y2="5"></line>
                            </svg>
                        </button>
                        <button id="playBtn" class="control-btn play-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                        <button id="nextBtn" class="control-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="5 4 15 12 5 20 5 4"></polygon>
                                <line x1="19" y1="5" x2="19" y2="19"></line>
                            </svg>
                        </button>
</div>
                </div>
                <audio id="audioPlayer"></audio>
            </div>
`;
        
        this.audio = this.shadowRoot.getElementById('audioPlayer');
        this.playBtn = this.shadowRoot.getElementById('playBtn');
        this.prevBtn = this.shadowRoot.getElementById('prevBtn');
        this.nextBtn = this.shadowRoot.getElementById('nextBtn');
        this.progressBar = this.shadowRoot.getElementById('progressBar');
        this.currentTime = this.shadowRoot.getElementById('currentTime');
        this.duration = this.shadowRoot.getElementById('duration');
        this.volumeSlider = this.shadowRoot.getElementById('volumeSlider');
        this.currentCover = this.shadowRoot.getElementById('currentCover');
        this.currentTitle = this.shadowRoot.getElementById('currentTitle');
        this.currentArtist = this.shadowRoot.getElementById('currentArtist');
        
        let isPlaying = false;
        let currentTrackIndex = 0;
        let playlist = [];
        
        // Event listeners
        this.playBtn.addEventListener('click', () => {
            if (playlist.length === 0) return;
            
            if (isPlaying) {
                this.audio.pause();
            } else {
                this.audio.play();
            }
            isPlaying = !isPlaying;
            this.updatePlayButton();
        });
        
        this.prevBtn.addEventListener('click', () => {
            if (playlist.length === 0) return;
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            this.loadTrack(currentTrackIndex);
            if (isPlaying) this.audio.play();
        });
        
        this.nextBtn.addEventListener('click', () => {
            if (playlist.length === 0) return;
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            this.loadTrack(currentTrackIndex);
            if (isPlaying) this.audio.play();
        });
        
        this.audio.addEventListener('timeupdate', () => {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.style.width = `${progress}%`;
            this.currentTime.textContent = this.formatTime(this.audio.currentTime);
        });
        
        this.audio.addEventListener('ended', () => {
            this.nextBtn.click();
        });
        
        this.volumeSlider.addEventListener('input', () => {
            this.audio.volume = this.volumeSlider.value;
        });
        
        this.audio.addEventListener('loadedmetadata', () => {
            this.duration.textContent = this.formatTime(this.audio.duration);
        });
        
        // Initialize from localStorage
        this.loadPlaylist();
        
        feather.replace();
    }
    
    updatePlayButton() {
        const icon = this.playBtn.querySelector('i');
        if (this.audio.paused) {
                icon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"></polygon>`;
            } else {
                icon.innerHTML = `<rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect>`;
            }
}
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    loadTrack(index) {
        const track = playlist[index];
        if (!track) return;
        
        this.audio.src = track.audio;
        this.currentCover.src = track.cover;
        this.currentTitle.textContent = track.title;
        this.currentArtist.textContent = track.artist;
        
        if (this.audio.paused) {
            this.audio.load();
        } else {
            this.audio.load();
            this.audio.play();
        }
    }
    
    loadPlaylist() {
        const storedPlaylist = JSON.parse(localStorage.getItem('currentPlaylist'));
        if (storedPlaylist && storedPlaylist.length > 0) {
            playlist = storedPlaylist;
            currentTrackIndex = 0;
            this.loadTrack(0);
        }
    }
    playTrack(track) {
        // Check if track is already in playlist
        const existingIndex = playlist.findIndex(t => t.id === track.id);
        if (existingIndex >= 0) {
            currentTrackIndex = existingIndex;
        } else {
            playlist = [track];
            currentTrackIndex = 0;
        }
        
        this.loadTrack(currentTrackIndex);
        this.audio.play();
        isPlaying = true;
        this.updatePlayButton();
        
        // Update stats
        this.updateStats(track);
    }
    
    updateStats(track) {
        const stats = JSON.parse(localStorage.getItem('musicStats'));
        
        // Increment total listens
        stats.listens = (stats.listens || 0) + 1;
        
        // Update mood stats
        if (track.mood) {
            stats.moods[track.mood] = (stats.moods[track.mood] || 0) + 1;
        }
        
        // Update recent tracks (limit to 10)
        stats.recent = stats.recent || [];
        stats.recent.unshift({
            id: track.id,
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            timestamp: new Date().toISOString()
        });
        
        if (stats.recent.length > 10) {
            stats.recent = stats.recent.slice(0, 10);
        }
        
        localStorage.setItem('musicStats', JSON.stringify(stats));
    }
}

customElements.define('custom-player', CustomPlayer);