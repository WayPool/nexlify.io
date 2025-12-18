/**
 * Nexlify - Shared Footer Component
 * Dynamically injects the footer into pages
 */

class NexlifyFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                /* Footer Component Styles */
                .footer {
                    background: #111827;
                    color: white;
                    padding: 4rem 2rem 2rem;
                }
                .footer-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .footer-main {
                    display: grid;
                    grid-template-columns: 1.5fr 2.5fr;
                    gap: 4rem;
                    padding-bottom: 3rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .footer-brand {
                    max-width: 300px;
                }
                .footer-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }
                .footer-logo-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .footer-logo-icon svg {
                    width: 24px;
                    height: 24px;
                    color: white;
                }
                .footer-tagline {
                    color: #9ca3af;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                }
                .footer-social {
                    display: flex;
                    gap: 1rem;
                }
                .social-link {
                    width: 40px;
                    height: 40px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    transition: all 0.2s ease;
                }
                .social-link:hover {
                    background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
                    transform: translateY(-2px);
                }
                .social-link svg {
                    width: 20px;
                    height: 20px;
                }
                .footer-links {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 2rem;
                }
                .footer-column h4 {
                    font-size: 0.95rem;
                    font-weight: 600;
                    margin-bottom: 1.25rem;
                    color: white;
                }
                .footer-column ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .footer-column li {
                    margin-bottom: 0.75rem;
                }
                .footer-column a {
                    color: #9ca3af;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: color 0.2s ease;
                }
                .footer-column a:hover {
                    color: #14b8a6;
                }
                .footer-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 2rem;
                }
                .footer-copyright {
                    color: #6b7280;
                    font-size: 0.875rem;
                }
                .footer-copyright p {
                    margin: 0;
                }
                .footer-certifications {
                    display: flex;
                    gap: 0.75rem;
                }
                .cert-badge {
                    background: rgba(255,255,255,0.1);
                    color: #9ca3af;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                /* Footer Responsive */
                @media (max-width: 968px) {
                    .footer-main {
                        grid-template-columns: 1fr;
                        gap: 3rem;
                    }
                    .footer-brand {
                        max-width: 100%;
                    }
                    .footer-links {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 640px) {
                    .footer {
                        padding: 3rem 1.5rem 1.5rem;
                    }
                    .footer-links {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                    .footer-bottom {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                }
            </style>
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-main">
                        <div class="footer-brand">
                            <a href="/" class="footer-logo">
                                <div class="footer-logo-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                    </svg>
                                </div>
                                <span>Nexlify</span>
                            </a>
                            <p class="footer-tagline">
                                Transformamos datos dispersos en decisiones accionables, auditables y legalmente defendibles.
                            </p>
                            <div class="footer-social">
                                <a href="#" class="social-link" aria-label="LinkedIn">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                </a>
                                <a href="#" class="social-link" aria-label="Twitter">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                </a>
                                <a href="#" class="social-link" aria-label="YouTube">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div class="footer-links">
                            <div class="footer-column">
                                <h4>Producto</h4>
                                <ul>
                                    <li><a href="/#funcionalidades">Funcionalidades</a></li>
                                    <li><a href="/modules.html">Modulos</a></li>
                                    <li><a href="/#seguridad">Seguridad</a></li>
                                    <li><a href="/#precios">Precios</a></li>
                                    <li><a href="#">Integraciones</a></li>
                                </ul>
                            </div>
                            <div class="footer-column">
                                <h4>Empresa</h4>
                                <ul>
                                    <li><a href="#">Sobre nosotros</a></li>
                                    <li><a href="#">Blog</a></li>
                                    <li><a href="#">Casos de exito</a></li>
                                    <li><a href="#">Trabaja con nosotros</a></li>
                                    <li><a href="/investors.html">Inversores</a></li>
                                    <li><a href="#">Contacto</a></li>
                                </ul>
                            </div>
                            <div class="footer-column">
                                <h4>Recursos</h4>
                                <ul>
                                    <li><a href="#">Centro de ayuda</a></li>
                                    <li><a href="#">Documentacion</a></li>
                                    <li><a href="#">API</a></li>
                                    <li><a href="#">Status</a></li>
                                    <li><a href="#">Webinars</a></li>
                                </ul>
                            </div>
                            <div class="footer-column">
                                <h4>Legal</h4>
                                <ul>
                                    <li><a href="/terms.html">Terminos de servicio</a></li>
                                    <li><a href="/privacy.html">Politica de privacidad</a></li>
                                    <li><a href="/cookies.html">Politica de cookies</a></li>
                                    <li><a href="/gdpr.html">GDPR</a></li>
                                    <li><a href="/dpa.html">DPA</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="footer-bottom">
                        <div class="footer-copyright">
                            <p>&copy; 2025 Nexlify. Todos los derechos reservados.</p>
                        </div>
                        <div class="footer-certifications">
                            <span class="cert-badge">ISO 27001</span>
                            <span class="cert-badge">GDPR</span>
                            <span class="cert-badge">SOC 2</span>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Register the custom element
customElements.define('nexlify-footer', NexlifyFooter);
