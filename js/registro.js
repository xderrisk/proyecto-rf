document.addEventListener("DOMContentLoaded", async () => {
  const registrosContainer = document.getElementById("registros");

  try {
    const registros = await window.api.obtenerRegistros();

    if (registros.length === 0) {
      registrosContainer.innerHTML = "<p>No hay registros disponibles.</p>";
      return;
    }

    registros.forEach((registro) => {
      const div = document.createElement("div");
      div.classList.add("registro-item");

      const img = document.createElement("img");
      img.src = `data:image/jpeg;base64,${registro.foto}`;
      img.alt = `Foto de ${registro.nombre}`;
      img.classList.add("registro-foto");

      const nombre = document.createElement("p");
      nombre.textContent = registro.nombre;

      const fecha = document.createElement("p");
      fecha.textContent = registro.fecha_hora;

      div.appendChild(img);
      div.appendChild(nombre);
      div.appendChild(fecha);
      registrosContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Error al obtener los registros:", error);
    registrosContainer.innerHTML = "<p>Error al cargar los registros.</p>";
  }
});
