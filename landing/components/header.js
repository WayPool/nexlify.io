/**
 * Nexlify - Shared Header Component
 * Dynamically injects the header navbar into pages
 */

class NexlifyHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.initTheme();
        this.checkAuthStatus();
        this.initMobileMenu();
    }

    render() {
        this.innerHTML = `
            <style>
                /* Header Component Styles */
                .navbar {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    z-index: 1000;
                    padding: 1rem 2rem;
                    background: var(--bg-primary, #ffffff);
                    border-bottom: 1px solid var(--border-color, #e5e7eb);
                    backdrop-filter: blur(20px);
                    transition: all 0.3s ease;
                }
                .nav-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                }
                .logo-icon {
                    width: 40px; height: 40px;
                    background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .logo-icon svg { width: 24px; height: 24px; color: white; }
                .logo-content { display: flex; flex-direction: column; }
                .logo-text {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary, #111827);
                    line-height: 1.2;
                }
                .logo-tagline {
                    font-size: 0.65rem;
                    color: var(--text-muted, #9ca3af);
                    font-weight: 400;
                    letter-spacing: 0.02em;
                }
                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }
                .nav-link {
                    color: var(--text-primary, #111827);
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.95rem;
                    transition: color 0.2s ease;
                    position: relative;
                }
                .nav-link:hover {
                    color: #0891b2;
                }
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -4px;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
                    transition: width 0.2s ease;
                }
                .nav-link:hover::after {
                    width: 100%;
                }
                .nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .theme-toggle {
                    width: 40px; height: 40px;
                    border-radius: 10px;
                    border: none;
                    background: var(--gray-100, #f3f4f6);
                    color: var(--text-primary, #111827);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                .theme-toggle:hover { background: var(--gray-200, #e5e7eb); }
                .theme-toggle svg { width: 20px; height: 20px; }
                #loggedOutButtons, #loggedInButtons {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    text-decoration: none;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s ease;
                }
                .btn-ghost {
                    background: transparent;
                    color: var(--text-primary, #111827);
                }
                .btn-ghost:hover { background: var(--gray-100, #f3f4f6); }
                .btn-primary {
                    background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
                    color: white;
                }
                .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

                /* Mobile Menu Button */
                .mobile-menu-btn {
                    display: none;
                    flex-direction: column;
                    justify-content: center;
                    gap: 5px;
                    width: 40px;
                    height: 40px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                }
                .mobile-menu-btn span {
                    display: block;
                    width: 100%;
                    height: 2px;
                    background: var(--text-primary, #111827);
                    transition: all 0.3s ease;
                }
                .mobile-menu-btn.active span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }
                .mobile-menu-btn.active span:nth-child(2) {
                    opacity: 0;
                }
                .mobile-menu-btn.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(5px, -5px);
                }

                /* Mobile Responsive */
                @media (max-width: 968px) {
                    .nav-links {
                        display: none;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: var(--bg-primary, #ffffff);
                        flex-direction: column;
                        padding: 1.5rem;
                        gap: 1rem;
                        border-bottom: 1px solid var(--border-color, #e5e7eb);
                        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    }
                    .nav-links.active {
                        display: flex;
                    }
                    .mobile-menu-btn {
                        display: flex;
                    }
                    .btn-ghost {
                        display: none;
                    }
                }
            </style>
            <nav class="navbar" id="mainNavbar">
                <div class="nav-container">
                    <a href="/" class="logo">
                        <div class="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </div>
                        <div class="logo-content">
                            <span class="logo-text">Nexlify</span>
                            <span class="logo-tagline">Donde el riesgo se convierte en decision</span>
                        </div>
                    </a>

                    <div class="nav-links">
                        <a href="/#funcionalidades" class="nav-link">Funcionalidades</a>
                        <a href="/#modulos" class="nav-link">Modulos</a>
                        <a href="/#seguridad" class="nav-link">Seguridad</a>
                        <a href="/#precios" class="nav-link">Precios</a>
                    </div>

                    <div class="nav-actions">
                        <button class="theme-toggle" id="themeToggle" aria-label="Cambiar tema">
                            <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="5"/>
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                            </svg>
                            <svg class="moon-icon" style="display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                            </svg>
                        </button>
                        <div id="loggedOutButtons">
                            <a href="/app/login" class="btn btn-ghost">Iniciar sesion</a>
                            <a href="/app/register" class="btn btn-primary">Registrarse</a>
                        </div>
                        <div id="loggedInButtons" style="display: none;">
                            <a href="/app/dashboard" class="btn btn-primary">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="7" height="7"/>
                                    <rect x="14" y="3" width="7" height="7"/>
                                    <rect x="14" y="14" width="7" height="7"/>
                                    <rect x="3" y="14" width="7" height="7"/>
                                </svg>
                                Dashboard
                            </a>
                        </div>
                    </div>

                    <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </nav>
        `;
    }

    initTheme() {
        const themeToggle = this.querySelector('#themeToggle');
        const sunIcon = this.querySelector('.sun-icon');
        const moonIcon = this.querySelector('.moon-icon');

        // Get stored theme
        const getStoredTheme = () => {
            try {
                const stored = localStorage.getItem('theme-storage');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return parsed.state?.theme || 'light';
                }
            } catch (e) {}
            return 'light';
        };

        // Set theme
        const setTheme = (theme) => {
            document.documentElement.classList.toggle('dark', theme === 'dark');
            if (sunIcon && moonIcon) {
                sunIcon.style.display = theme === 'dark' ? 'none' : 'block';
                moonIcon.style.display = theme === 'dark' ? 'block' : 'none';
            }
        };

        // Save theme
        const saveTheme = (theme) => {
            try {
                const stored = localStorage.getItem('theme-storage');
                let data = stored ? JSON.parse(stored) : { state: {} };
                data.state.theme = theme;
                localStorage.setItem('theme-storage', JSON.stringify(data));
            } catch (e) {}
        };

        // Initialize
        const initialTheme = getStoredTheme();
        setTheme(initialTheme);

        // Toggle handler
        themeToggle?.addEventListener('click', () => {
            const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            saveTheme(newTheme);
        });
    }

    checkAuthStatus() {
        const loggedOutButtons = this.querySelector('#loggedOutButtons');
        const loggedInButtons = this.querySelector('#loggedInButtons');

        let isLoggedIn = false;
        try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
                const authState = JSON.parse(authStorage);
                isLoggedIn = authState.state && authState.state.isAuthenticated && authState.state.token;
            }
        } catch (e) {
            // Silently fail
        }

        if (isLoggedIn) {
            if (loggedOutButtons) loggedOutButtons.style.display = 'none';
            if (loggedInButtons) loggedInButtons.style.display = 'flex';
        } else {
            if (loggedOutButtons) loggedOutButtons.style.display = 'flex';
            if (loggedInButtons) loggedInButtons.style.display = 'none';
        }
    }

    initMobileMenu() {
        const mobileMenuBtn = this.querySelector('#mobileMenuBtn');
        const navLinks = this.querySelector('.nav-links');

        mobileMenuBtn?.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navLinks?.classList.toggle('active');
        });
    }
}

// Register the custom element
customElements.define('nexlify-header', NexlifyHeader);
