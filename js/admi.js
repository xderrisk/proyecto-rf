let imagen = null;

document.getElementById('imagen').addEventListener('click', async () => {
    imagen = await window.api.openFileDialog();
});

document.getElementById('addUserForm').addEventListener('submit' , function (event){
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;

    if (!imagen) {
        console.log('Por favor, selecciona una imagen.');
        return;
    }

    window.api.add(nombre, apellido, imagen).then(result => {
        if (result.success) {
            nombre = "";
            apellido = "";
            imagen = null;

            mensaje.textContent = "Usuario agregado con éxito.";
            mensaje.style.color = "green";
        } else {
            console.log('error')
        }
    })
})
