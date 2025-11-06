class Login {
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
                    const data = await this.loginToBackend(username, password);
                    
                    // VERIFICACIÓN CORREGIDA - usa data directamente
                    if (data.token && data.usuario) {
                        // Guardar token y datos de usuario
                        localStorage.setItem("authToken", data.token);
                        localStorage.setItem("userData", JSON.stringify(data.usuario));
                        
                        // Recordar usuario si está marcado
                        if (remember) {
                            localStorage.setItem("rememberedUser", username);
                        } else {
                            localStorage.removeItem("rememberedUser");
                        }
                        
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

    async loginToBackend(username, password) {
        const API_URL = 'https://localhost:3006/auth/login';
        
        console.log('Enviando login a:', API_URL);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre_usuario: username,
                contrasenia: password
            })
        });

        const data = await response.json();
        console.log('Respuesta del backend:', data);

        if (!response.ok) {
            throw new Error(data.message || data.error || `Error ${response.status}: ${response.statusText}`);
        }

        return data;
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
        const validator = new Login(form, fields);
    }

    // Verificar parámetros URL para mensajes
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("logout") === "success") {
        const messagesDiv = document.getElementById("system-messages");
        messagesDiv.innerHTML = '<div class="system-message success">Sesión cerrada correctamente</div>';
    }
});