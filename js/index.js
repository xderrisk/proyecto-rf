window.addEventListener('DOMContentLoaded', async () => {
    const config = await window.api.leerConfig();

    if (config && config.rutaLogo) {
        const imagen = document.getElementById('logo');
        imagen.src = `file://${config.rutaLogo}`;
    } else {
        console.error('No se pudo cargar la imagen desde el JSON.');
    }
});

document.getElementById('camaras').addEventListener('click', () => {
    window.location.href = '../html/recognition.html';
});

document.getElementById('admi').addEventListener('click', () => {
    window.location.href = '../html/login.html';
});

document.getElementById('registro').addEventListener('click', () => {
    window.location.href = '../html/registro.html';
});