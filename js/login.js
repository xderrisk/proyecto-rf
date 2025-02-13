import { mostrarMensaje } from "./notify.js";

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        return;
    }

    window.api.login(username, password).then(isAuthenticated => {
        if (isAuthenticated) {
            window.location.href = '../html/admi.html';
        } else {
            mostrarMensaje("Credenciales invalidas", "advertencia");
        }
    })
})