
class CustomNavbar extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                .navbar-brand {
                    font-weight: 700;
                    font-size: 1.5rem;
                }
                .music-icon {
                    margin-right: 10px;
                    color: var(--bs-primary);
                }
            </style>
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
                <div class="container">
                    <a class="navbar-brand" href="index.html">
                        <i data-feather="music" class="music-icon"></i>
                        Vibe-Vault
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav ms-auto">
                            <li class="nav-item">
                                <a class="nav-link" href="index.html">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="search.html">Search</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="player.html">Player</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="stats.html">Stats</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="settings.html">Settings</a>
                            </li>
</ul>
                        <button id="themeToggle" class="btn btn-outline-secondary ms-3">
                            <i data-feather="moon"></i>
                        </button>
                    </div>
                </div>
            </nav>
        `;

        // Add theme toggle functionality
        const themeToggle = this.shadowRoot.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i data-feather="sun"></i>';
            } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i data-feather="moon"></i>';
            }
            feather.replace();
        });

        // Initialize theme from localStorage
        if (localStorage.getItem('theme') === 'light') {
            document.documentElement.classList.remove('dark');
            themeToggle.innerHTML = '<i data-feather="sun"></i>';
        }

        // Load Bootstrap JS
        const bootstrapScript = document.createElement('script');
        bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
        this.shadowRoot.appendChild(bootstrapScript);
}
}

customElements.define('custom-navbar', CustomNavbar);