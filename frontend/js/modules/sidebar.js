import { CONSTANTS } from '../utils/constants.js';

export class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.contentSections = document.querySelectorAll('.content-section');
        this.pageTitle = document.getElementById('pageTitle');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.restoreSidebarState();
        this.setActiveSection('dashboard');
    }

    bindEvents() {
        // Toggle sidebar en desktop
        this.sidebarToggle?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Toggle sidebar en móvil
        this.mobileMenuToggle?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Cerrar sidebar en móvil al hacer clic en overlay
        this.sidebarOverlay?.addEventListener('click', () => {
            this.closeMobileMenu();
        });

        // Navegación entre secciones (solo links internos con data-section)
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const section = link.getAttribute('data-section');
                if (section) {
                    e.preventDefault();
                    this.setActiveSection(section);
                    this.closeMobileMenu();
                }
                // Si no hay data-section, es un enlace externo (dejar que el navegador navegue)
            });
        });

        // Cerrar sidebar al redimensionar ventana
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
        
        // Guardar preferencia en localStorage
        const isCollapsed = this.sidebar.classList.contains('collapsed');
        localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.SIDEBAR_STATE, isCollapsed);
    }

    toggleMobileMenu() {
        this.sidebar.classList.toggle('mobile-open');
        this.sidebarOverlay.classList.toggle('mobile-open');
    }

    closeMobileMenu() {
        this.sidebar.classList.remove('mobile-open');
        this.sidebarOverlay.classList.remove('mobile-open');
    }

    restoreSidebarState() {
        const isCollapsed = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.SIDEBAR_STATE) === 'true';
        if (isCollapsed) {
            this.sidebar.classList.add('collapsed');
        }
    }

    setActiveSection(section) {
        // Remover active de todos los links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Remover active de todas las secciones
        this.contentSections.forEach(section => {
            section.classList.remove('active');
        });

        // Activar link seleccionado
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Mostrar sección seleccionada
        const activeSection = document.getElementById(`${section}-section`);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        // Actualizar título de página
        this.updatePageTitle(section);

        // Disparar evento personalizado
        this.dispatchSectionChange(section);
    }

    updatePageTitle(section) {
        const titles = {
            'dashboard': 'Dashboard',
            'reservas': 'Gestión de Reservas',
            'clientes': 'Clientes',
            'salones': 'Gestión de Salones',
            'servicios': 'Gestión de Servicios',
            'turnos': 'Gestión de Turnos',
            'usuarios': 'Gestión de Usuarios',
            'reportes': 'Generación de Reportes',
            'estadisticas': 'Estadísticas del Sistema',
            'auditoria': 'Auditoría'
        };

        if (this.pageTitle) {
            this.pageTitle.textContent = titles[section] || 'Dashboard';
        }
    }

    dispatchSectionChange(section) {
        const event = new CustomEvent('sectionChanged', {
            detail: { section }
        });
        document.dispatchEvent(event);
    }

    handleResize() {
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        } else {
            // En móvil, asegurarse que el sidebar esté cerrado
            this.sidebar.classList.remove('collapsed');
        }
    }

    // Método para colapsar/expandir programáticamente
    setCollapsed(collapsed) {
        if (collapsed) {
            this.sidebar.classList.add('collapsed');
        } else {
            this.sidebar.classList.remove('collapsed');
        }
        localStorage.setItem(CONSTANTS.LOCAL_STORAGE_KEYS.SIDEBAR_STATE, collapsed);
    }

    // Método para actualizar información del usuario
    updateUserInfo(userData) {
        const userName = document.getElementById('userName');
        const userAvatar = document.querySelector('.avatar-text');
        
        if (userName && userData) {
            userName.textContent = `${userData.nombre} ${userData.apellido}`;
        }
        
        if (userAvatar && userData) {
            userAvatar.textContent = userData.nombre ? userData.nombre.charAt(0).toUpperCase() : 'A';
        }
    }
}