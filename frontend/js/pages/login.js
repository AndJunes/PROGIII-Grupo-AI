import { Auth } from '../auth.js';
import { Validators } from '../utils/validators.js';
import { Helpers } from '../utils/helpers.js';

class LoginManager {
    constructor(form, fields) {
        this.form = form;
        this.fields = fields;
        this.validateonSubmit();
        this.initRememberMe();
    }

    initRememberMe() {
        const rememberedUser = localStorage.getItem("rememberedUser");
        if (rememberedUser) {
            document.getElementById("username").value = rememberedUser;
            document.getElementById("remember").checked = true;
        }
    }

    validateonSubmit() {
        let self = this;

        this.form.addEventListener("submit", async (e) => {
            e.preventDefault();
            let error = 0;
            
            self.fields.forEach((field) => {
                const input = document.querySelector(`#${field}`);
                if (self.validateFields(input) == false) {
                    error++;
                }
            });

            if (error === 0) {
                try {
                    // Mostrar estado de carga
                    this.showLoading(true);

                    // Obtener datos del formulario
                    const username = document.querySelector('#username').value;
                    const password = document.querySelector('#password').value;
                    const remember = document.querySelector('#remember').checked;

                    // Llamar al backend
                    const data = await Auth.login(username, password);
                    
                    // En tu LoginManager, modifica la parte del login exitoso:
                    if (data.token && data.usuario) {
                        // Guardar token y datos de usuario
                        Auth.saveSession(data.token, data.usuario, remember, username);
                        
                        console.log('👤 Datos completos del usuario recibidos:', data.usuario);
                        console.log('📋 Campos disponibles:', Object.keys(data.usuario));
                        
                        // Actualizar sidebar inmediatamente con los datos recibidos
                        this.updateSidebarWithUserData(data.usuario);
                        
                        console.log('Login exitoso, redirigiendo...', data.usuario);
                        // Redirigir al dashboard correspondiente
                        this.redirectToDashboard(data.usuario.tipo_usuario);
                    } else {
                        throw new Error('Respuesta del servidor inválida');
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    this.showSystemMessage(error.message || 'Error de conexión con el servidor', 'error');
                } finally {
                    this.showLoading(false);
                }
            }
        });
    }

    showLoading(show) {
        const button = this.form.querySelector('button[type="submit"]');
        const buttonText = button.querySelector('.button-text');
        const buttonLoading = button.querySelector('.button-loading');
        
        if (show) {
            buttonText.style.display = 'none';
            buttonLoading.style.display = 'inline-block';
            button.disabled = true;
        } else {
            buttonText.style.display = 'inline-block';
            buttonLoading.style.display = 'none';
            button.disabled = false;
        }
    }

    redirectToDashboard(userType) {
        console.log('Redirigiendo usuario tipo:', userType);
        // Redirigir según el tipo de usuario
        switch(parseInt(userType)) {
            case 1: // ADMINISTRADOR
                window.location.replace('./dashboard-admin.html');
                break;
            case 2: // EMPLEADO
                window.location.replace('./dashboard-empleado.html');
                break;
            case 3: // CLIENTE
                window.location.replace('./dashboard-cliente.html');
                break;
            default:
                console.error('Tipo de usuario desconocido:', userType);
                this.showSystemMessage('Tipo de usuario no reconocido', 'error');
        }
    }

    showSystemMessage(message, type) {
        const messagesDiv = document.getElementById('system-messages');
        messagesDiv.innerHTML = `
            <div class="system-message ${type}">
                ${message}
            </div>
        `;
        
        setTimeout(() => {
            messagesDiv.innerHTML = '';
        }, 5000);
    }

    validateFields(field) {
        if (field.value.trim() === "") {
            this.setStatus(
                field,
                `${field.previousElementSibling.innerText} no puede estar vacío`,
                "error"
            );
            return false;
        } else {
            this.setStatus(field, null, "success");
            return true;
        }
    }

    setStatus(field, message, status) {
        const errorMessage = field.parentElement.querySelector(".error-message");

        if (status === "success") {
            if (errorMessage) {
                errorMessage.innerText = "";
            }
            field.classList.remove("input-error");
            field.classList.add("input-success");
        }
        if (status === "error") {
            if (errorMessage) {
                errorMessage.innerText = message;
            }
            field.classList.add("input-error");
            field.classList.remove("input-success");
        }
    }
}

// Inicialización
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".loginForm");
    if (form) {
        const fields = ["username", "password"];
        const validator = new LoginManager(form, fields);
    }

    // Verificar parámetros URL para mensajes
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("logout") === "success") {
        const messagesDiv = document.getElementById("system-messages");
        messagesDiv.innerHTML = '<div class="system-message success">Sesión cerrada correctamente</div>';
    }
});