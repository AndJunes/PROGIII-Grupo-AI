// Sidebar functionality
class SidebarManager {
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
        this.setActiveSection('dashboard');
    }

    bindEvents() {
        // Toggle sidebar en desktop
        this.sidebarToggle.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Toggle sidebar en móvil
        this.mobileMenuToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Cerrar sidebar en móvil al hacer clic en overlay
        this.sidebarOverlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });

        // Navegación entre secciones
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.setActiveSection(section);
                this.closeMobileMenu();
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
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }

    toggleMobileMenu() {
        this.sidebar.classList.toggle('mobile-open');
        this.sidebarOverlay.classList.toggle('mobile-open');
    }

    closeMobileMenu() {
        this.sidebar.classList.remove('mobile-open');
        this.sidebarOverlay.classList.remove('mobile-open');
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
    }

    updatePageTitle(section) {
        const titles = {
            'dashboard': 'Dashboard',
            'reservas': 'Gestión de Reservas',
            'salones': 'Gestión de Salones',
            'servicios': 'Gestión de Servicios',
            'turnos': 'Gestión de Turnos',
            'usuarios': 'Gestión de Usuarios',
            'reportes': 'Generación de Reportes',
            'estadisticas': 'Estadísticas del Sistema'
        };

        this.pageTitle.textContent = titles[section] || 'Dashboard';
    }

    handleResize() {
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
            
            // Restaurar estado del sidebar desde localStorage
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (isCollapsed) {
                this.sidebar.classList.add('collapsed');
            } else {
                this.sidebar.classList.remove('collapsed');
            }
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
        localStorage.setItem('sidebarCollapsed', collapsed);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});