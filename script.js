
// Initialize storage if not exists
if (!localStorage.getItem('currentPlaylist')) {
    localStorage.setItem('currentPlaylist', JSON.stringify([]));
}

if (!localStorage.getItem('musicStats')) {
    localStorage.setItem('musicStats', JSON.stringify({
        listens: 0,
        moods: {},
        recent: []
    }));
}
function addToPlaylist(track) {
    const playlist = JSON.parse(localStorage.getItem('currentPlaylist'));
    if (!playlist.some(item => item.id === track.id)) {
        playlist.push(track);
        localStorage.setItem('currentPlaylist', JSON.stringify(playlist));
    }
}

function clearPlaylist() {
    localStorage.setItem('currentPlaylist', JSON.stringify([]));
    if (window.location.pathname.includes('player.html')) {
        window.location.reload();
    }
}
async function fetchMoodTracks(mood) {
    const clientId = localStorage.getItem('jamendoClientId');
    if (!clientId) return getMockTracks(mood);

    try {
        let params = {
            client_id: clientId,
            format: 'jsonpretty',
            limit: 20,
            tags: mood
        };

        if (mood === 'focus') params.tags = 'instrumental ambient';
        if (mood === 'chill') params.tags = 'chillout lounge';
        if (mood === 'energy') params.tags = 'rock electronic';
        if (mood === 'sleep') params.tags = 'ambient relaxation';

        const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?${new URLSearchParams(params)}`);
        const data = await response.json();
        
        return data.results.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artist_name,
            duration: formatDuration(track.duration),
            cover: track.image,
            audio: track.audio,
            mood: mood
        }));
    } catch (error) {
        console.error('Error fetching tracks:', error);
        return getMockTracks(mood);
    }
}

async function searchTracks(query) {
    const clientId = localStorage.getItem('jamendoClientId');
    if (!clientId) return getMockSearchResults(query);

    try {
        const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=jsonpretty&limit=20&search=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        return data.results.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artist_name,
            duration: formatDuration(track.duration),
            cover: track.image,
            audio: track.audio
        }));
    } catch (error) {
        console.error('Error searching tracks:', error);
        return getMockSearchResults(query);
    }
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function getMockTracks(mood) {
    return Array(3).fill(0).map((_, index) => ({
        id: `${mood}-${index}`,
        title: `${mood} track ${index + 1}`,
        artist: `Artist ${index + 1}`,
        duration: `${Math.floor(Math.random() * 4) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        cover: `http://static.photos/music/200x200/${index + 10}`,
        audio: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${index + 1}.mp3`,
        mood: mood
    }));
}

function getMockSearchResults(query) {
    return Array(8).fill(0).map((_, i) => ({
        id: `search-${i}`,
        title: `${query} track ${i + 1}`,
        artist: `Artist ${i + 1}`,
        duration: `${Math.floor(Math.random() * 4) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
        cover: `http://static.photos/music/200x200/${i + 20}`,
        audio: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 5}.mp3`
    }));
}