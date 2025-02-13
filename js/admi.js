import { mostrarMensaje } from "./notify.js";

let imagen = null;

document.getElementById('imagen').addEventListener('click', async (event) => {
    event.preventDefault();
    imagen = await window.api.openFileDialog();
    if (imagen) {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.src = imagen;
        imagePreview.style.display = 'block';
    }
});

document.getElementById('addUserForm').addEventListener('submit' , function (event){
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
            imagePreview.src = '';
            imagen = null;

            mostrarMensaje("Usuario agregado con éxito", "exito");
        } else {
            console.log('error')
        }
    })
})
