export function mostrarMensaje(texto, tipo = "info") {
    let mensaje = Object.assign(document.createElement("div"), {
        id: "mensaje",
        className: "mensaje-oculto"
    });
    document.body.appendChild(mensaje);
    
    const colores = {
        exito: "#4CAF50",       // Verde
        error: "#F44336",       // Rojo
        advertencia: "#FF9800", // Naranja
        info: "#2196F3"         // Azul
    };
    mensaje.textContent = texto;
    mensaje.style.backgroundColor = colores[tipo] || colores["info"]
    mensaje.classList.add("mensaje-visible");

    setTimeout(() => {
        mensaje.classList.remove("mensaje-visible");
    }, 3000);
}