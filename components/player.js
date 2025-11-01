class CustomPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.currentTrack = null;

        // 1. CREATE THE AUDIO ELEMENT
        this.audio = new Audio();
        
        // Setup the player HTML structure (minimal for debugging)
        this.shadowRoot.innerHTML = `
            <style>
                /* Basic styles for the player bar */
                :host {
                    display: block;
                    background-color: #1f2937; /* Gray-800 equivalent */
                    color: #fff;
                    padding: 1rem;
                    position: fixed;
                    bottom: 0;
                    width: 100%;
                    box-shadow: 0 -2px 10px rgba(0,0,0,0.5);
                }
                .player-controls {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                button {
                    background: #4f46e5; /* Primary color example */
                    border: none;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 9999px;
                    cursor: pointer;
                }
            </style>
            <div class="player-controls">
                <div id="track-info">No track loaded</div>
                <div id="controls">
                    <button id="play-pause-btn">Play</button>
                </div>
            </div>
        `;

        // Get the play/pause button and add a listener
        this.playPauseBtn = this.shadowRoot.getElementById('play-pause-btn');
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    }

    // 2. DEFINE THE PUBLIC METHOD TO START PLAYBACK
    playTrack(track) {
        console.log("Attempting to play track:", track.title, "from source:", track.audio);
        this.currentTrack = track;
        
        // 3. SET THE AUDIO SOURCE
        this.audio.src = track.audio;
        
        // 4. CALL .LOAD() and .PLAY()
        this.audio.load(); // Load the new source
        this.audio.play()
            .then(() => {
                this.shadowRoot.getElementById('track-info').textContent = `${track.title} - ${track.artist}`;
                this.playPauseBtn.textContent = 'Pause';
                
                // You can add stat tracking here later
                this.trackPlaybackStart(track);
            })
            .catch(error => {
                console.error("Audio playback failed (usually due to Autoplay Policy):", error);
                // Inform user to click play manually if needed
                alert("Music playback started but was blocked by the browser. Please click the 'Play' button.");
                this.playPauseBtn.textContent = 'Play';
            });
    }

    // Toggle logic for the button
    togglePlayPause() {
        if (!this.currentTrack) return;
        
        if (this.audio.paused) {
            this.audio.play()
                .then(() => {
                    this.playPauseBtn.textContent = 'Pause';
                })
                .catch(error => {
                    console.error("Error playing after user click:", error);
                });
        } else {
            this.audio.pause();
            this.playPauseBtn.textContent = 'Play';
        }
    }
    
    // Simple mock for stat tracking (you can expand this later)
    trackPlaybackStart(track) {
        const stats = JSON.parse(localStorage.getItem('musicStats'));
        stats.listens = (stats.listens || 0) + 1;
        
        if (track.mood) {
            stats.moods[track.mood] = (stats.moods[track.mood] || 0) + 1;
        }

        const newRecent = {
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            timestamp: new Date().toISOString()
        };
        stats.recent.unshift(newRecent); // Add to the start
        stats.recent = stats.recent.slice(0, 10); // Keep only 10 recent
        
        localStorage.setItem('musicStats', JSON.stringify(stats));
    }
}

// 5. REGISTER THE CUSTOM ELEMENT
customElements.define('custom-player', CustomPlayer);