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
                    <p class="footer-tagline">Transformamos datos dispersos en decisiones accionables, auditables y legalmente defendibles.</p>
                    <div class="footer-social">
                        <a href="#" class="social-link" aria-label="LinkedIn">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href="#" class="social-link" aria-label="Twitter">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                        <a href="#" class="social-link" aria-label="YouTube">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                    </div>
                </div>
                <div class="footer-links">
                    <div class="footer-column">
                        <h4>Producto</h4>
                        <ul>
                            <li><a href="/#funcionalidades">Funcionalidades</a></li>
                            <li><a href="/modules.html">Módulos</a></li>
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
                            <li><a href="#">Casos de éxito</a></li>
                            <li><a href="#">Trabaja con nosotros</a></li>
                            <li><a href="#">Contacto</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4>Recursos</h4>
                        <ul>
                            <li><a href="#">Centro de ayuda</a></li>
                            <li><a href="#">Documentación</a></li>
                            <li><a href="#">API</a></li>
                            <li><a href="#">Status</a></li>
                            <li><a href="#">Webinars</a></li>
                        </ul>
                    </div>
                    <div class="footer-column">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#">Términos de servicio</a></li>
                            <li><a href="#">Política de privacidad</a></li>
                            <li><a href="#">Política de cookies</a></li>
                            <li><a href="#">GDPR</a></li>
                            <li><a href="#">DPA</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-copyright">
                    <p>&copy; <?php echo date('Y'); ?> Nexlify. Todos los derechos reservados.</p>
                </div>
                <div class="footer-certifications">
                    <span class="cert-badge">ISO 27001</span>
                    <span class="cert-badge">GDPR</span>
                    <span class="cert-badge">SOC 2</span>
                </div>
            </div>
        </div>
    </footer>
    <script>
        // Check login status
        (function() {
            const token = localStorage.getItem('token');
            if (token) {
                document.getElementById('loggedOutButtons').style.display = 'none';
                document.getElementById('loggedInButtons').style.display = 'flex';
            }
        })();
    </script>
</body>
</html>
