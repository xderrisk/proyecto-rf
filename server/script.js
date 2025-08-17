const socket = io();

socket.on("alerta_desconocido", (mensaje) => {
    console.log("desconocido")
});

socket.on("update", (data) => {
    console.log("Datos actualizados recibidos:", data);

    const tableBody = document.getElementById("data-table");
    tableBody.innerHTML = ""; // Limpiar la tabla antes de actualizar

    data.forEach(record => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = record.nombre;

        const dateCell = document.createElement("td");
        dateCell.textContent = new Date(record.fecha_hora).toLocaleString();

        const photoCell = document.createElement("td");
        const img = document.createElement("img");

        if (record.foto) {
            img.src = record.foto; // Asegúrate de que la imagen se recibe correctamente
        } else {
            img.alt = "Imagen no disponible";
        }

        img.width = 100;
        photoCell.appendChild(img);

        row.appendChild(nameCell);
        row.appendChild(dateCell);
        row.appendChild(photoCell);

        tableBody.appendChild(row);
    });
});
