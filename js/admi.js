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
            console.log('agregado con exito')
        } else {
            console.log('error')
        }
    })
})
