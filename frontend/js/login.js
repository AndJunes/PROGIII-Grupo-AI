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

                    const data = await this.loginToBackend(username, password);

                    if (data.token) {
                        localStorage.setItem("authToken", data.token);

                        const decoded = this.decodeToken(data.token);
                        if (!decoded) throw new Error('Token inválido recibido del servidor');

                        localStorage.setItem("userData", JSON.stringify(decoded));

                        if (remember) {
                            localStorage.setItem("rememberedUser", username);
                        } else {
                            localStorage.removeItem("rememberedUser");
                        }

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

    async loginToBackend(username, password) {
        const API_URL = 'https://localhost:3006/auth/login';
        console.log('Enviando login a:', API_URL);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        switch(parseInt(userType)) {
            case 1:
                window.location.replace('./dashboard-admin.html');
                break;
            case 2:
                window.location.replace('./dashboard-empleado.html');
                break;
            case 3:
                window.location.replace('./dashboard-cliente.html');
                break;
            default:
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
