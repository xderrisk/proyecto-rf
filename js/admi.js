import { mostrarMensaje } from "./notify.js";

let imagen = null;
let videoStream = null;
let videoElement = null;

document.getElementById('imagen').addEventListener('click', async (event) => {
    event.preventDefault();
    imagen = await window.api.openFileDialog();
    if (imagen) {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.src = imagen;
        imagePreview.style.display = 'block';
    }
});

document.getElementById('takePhotoButton').addEventListener('click', async (event) => {
    event.preventDefault(); // Evita el comportamiento predeterminado de un formulario

    try {
        // Verificamos si ya existe un videoStream y un videoElement
        if (!videoStream) {
            // Solicitar acceso a la cámara solo si no está activo
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoElement = document.createElement('video');
            videoElement.srcObject = videoStream;
            videoElement.play();

            const videoPreview = document.getElementById('videoPreview');
            if (!videoPreview) {
                mostrarMensaje("Contenedor de vista previa de video no encontrado", "advertencia");
                return;
            }

            // Asegurarse de que el video no se agregue más de una vez
            if (!videoPreview.contains(videoElement)) {
                videoPreview.style.display = 'block';
                videoPreview.appendChild(videoElement);
            }
        }

        // Verificar si el botón "Tomar Foto" ya está presente
        let takePhotoButton = document.getElementById('takePhotoButton');
        if (!takePhotoButton) {
            takePhotoButton = document.createElement('button');
            takePhotoButton.id = 'takePhotoButton'; // Asegúrate de que el botón tenga un id único
            takePhotoButton.textContent = 'Tomar Foto';
            takePhotoButton.type = 'button'; // Asegúrate de que el botón no sea de tipo 'submit'
            document.querySelector('.input-group').appendChild(takePhotoButton);
        }

        // Cuando se hace clic en "Tomar Foto", se captura la imagen
        takePhotoButton.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;

            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            // Obtener la imagen como base64
            imagen = canvas.toDataURL('image/png'); // Si tu API maneja esta conversión, pasas directamente esto

            const imagePreview = document.getElementById('imagePreview');
            imagePreview.src = imagen;
            imagePreview.style.display = 'block';

            // Detener la transmisión de video y eliminar el elemento de video
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;

            const videoPreview = document.getElementById('videoPreview');
            videoPreview.style.display = 'none';
            videoPreview.removeChild(videoElement); // Eliminar el video actual
            videoElement = null; // Limpiar el videoElement
        });
    } catch (error) {
        console.error('Error al acceder a la cámara: ', error);
        mostrarMensaje("No se pudo acceder a la cámara", "advertencia");
    }
});

document.getElementById('addUserForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const form = event.target;
    const nombre = form.nombre.value.trim();
    const apellido = form.apellido.value.trim();

    if (!imagen) {
        mostrarMensaje("Agregue una imagen", "advertencia");
        return;
    }

    window.api.add(nombre, apellido, imagen).then(result => {
        if (result.success) {
            form.reset();
            document.getElementById('imagePreview').src = '';
            imagen = null;

            mostrarMensaje("Usuario agregado con éxito", "exito");
        } else {
            console.log('error');
        }
    })
});
