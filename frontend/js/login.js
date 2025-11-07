import { CONSTANTS } from './utils/constants.js';
import { Auth } from './auth.js';

class Login {
    constructor(form, fields) {
        this.form = form;
        this.fields = fields;
        this.validateonSubmit();
        this.initRememberMe();
    }

    initRememberMe() {
        const rememberedUser = localStorage.getItem(CONSTANTS.LOCAL_STORAGE_KEYS.REMEMBERED_USER);
        if (rememberedUser) {
            document.getElementById("username").value = rememberedUser;
            document.getElementById("remember").checked = true;
        }
    }

    validateonSubmit() {
        this.form.addEventListener("submit", async (event) => {
            event.preventDefault();
            let error = 0;

            this.fields.forEach((field) => {
                const input = document.querySelector(`#${field}`);
                if (this.validateFields(input) === false) {
                    error++;
                }
            });

            if (error === 0) {
                try {
                    this.showLoading(true);

                    const username = document.querySelector('#username').value;
                    const password = document.querySelector('#password').value;
                    const remember = document.querySelector('#remember').checked;

                    const data = await Auth.login(username, password);

                    if (data.token) {
                        // Decodificar el token para obtener userData
                        const decoded = this.decodeToken(data.token);
                        if (!decoded) throw new Error('Token inválido recibido del servidor');

                        // Guardar sesión usando el método estático
                        Auth.saveSession(data.token, decoded, remember, username);

                        console.log('Login exitoso, redirigiendo...', decoded);
                        this.redirectToDashboard(decoded.tipo_usuario);
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

    decodeToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token decodificado:', payload);
            return payload;
        } catch (err) {
            console.error('Error al decodificar token:', err);
            return null;
        }
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
        const dashboards = {
            1: 'dashboard-admin.html',
            2: 'dashboard-empleado.html', 
            3: 'dashboard-cliente.html'
        };
        
        const dashboard = dashboards[userType];
        if (dashboard) {
            window.location.replace(`./${dashboard}`);
        } else {
            console.error('Tipo de usuario desconocido:', userType);
            this.showSystemMessage('Tipo de usuario no reconocido', 'error');
        }
    }

    showSystemMessage(message, type) {
        const messagesDiv = document.getElementById('system-messages');
        if (!messagesDiv) return;
        
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
            this.setStatus(field, `${field.previousElementSibling.innerText} no puede estar vacío`, "error");
            return false;
        } else {
            this.setStatus(field, null, "success");
            return true;
        }
    }

    setStatus(field, message, status) {
        const errorMessage = field.parentElement.querySelector(".error-message");
        if (status === "success") {
            if (errorMessage) errorMessage.innerText = "";
            field.classList.remove("input-error");
            field.classList.add("input-success");
        }
        if (status === "error") {
            if (errorMessage) errorMessage.innerText = message;
            field.classList.add("input-error");
            field.classList.remove("input-success");
        }
    }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".loginForm");
    if (form) {
        const fields = ["username", "password"];
        new Login(form, fields);
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("logout") === "success") {
        const messagesDiv = document.getElementById("system-messages");
        if (messagesDiv) {
            messagesDiv.innerHTML = '<div class="system-message success">Sesión cerrada correctamente</div>';
        }
    }
});