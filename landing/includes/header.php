<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle . ' - Nexlify' : 'Nexlify - Plataforma de Gestión de Riesgos'; ?></title>
    <meta name="description" content="<?php echo isset($pageDescription) ? $pageDescription : 'Transformamos datos dispersos en decisiones accionables, auditables y legalmente defendibles.'; ?>">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/common.css">
    <?php if (isset($extraStyles)) echo $extraStyles; ?>
</head>
<body>
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <a href="/" class="logo">
                <div class="logo-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </div>
                <span class="logo-text">Nexlify</span>
            </a>
            <div class="nav-links">
                <a href="/#funcionalidades" class="nav-link">Funcionalidades</a>
                <a href="/#modulos" class="nav-link">Módulos</a>
                <a href="/#seguridad" class="nav-link">Seguridad</a>
                <a href="/#precios" class="nav-link">Precios</a>
            </div>
            <div class="nav-buttons" id="navButtons">
                <div id="loggedOutButtons">
                    <a href="/login" class="btn btn-ghost">Iniciar sesión</a>
                    <a href="/register" class="btn btn-primary">Registrarse</a>
                </div>
                <div id="loggedInButtons" style="display: none;">
                    <a href="/dashboard" class="btn btn-primary">
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
            <button class="mobile-menu-btn" id="mobileMenuBtn">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>
