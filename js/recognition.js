const video = document.getElementById("video");
const cooldowns = {};
const COOLDOWN_TIME = 5000;

window.api.rutaModelos().then((ruta) => {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(ruta),
    faceapi.nets.faceRecognitionNet.loadFromUri(ruta),
    faceapi.nets.faceLandmark68Net.loadFromUri(ruta),
  ]).then(startWebcam);
});

function startWebcam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((error) => {
      console.error(error);
    });
}

async function getLabeledFaceDescriptions() {
  const usuarios = await window.api.obtenerUsuarios();
  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    console.warn("No hay usuarios en la base de datos.");
    return [];
  }

  return Promise.all(
    usuarios.map(async (usuario) => {
      try {
        const imageBlob = new Blob([new Uint8Array(usuario.imagen)], { type: "image/jpeg" });
        const imageURL = URL.createObjectURL(imageBlob);
        const img = await faceapi.fetchImage(imageURL);

        const detections = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detections) {
          console.warn(`No se detectó un rostro válido para ${usuario.nombre}`);
          return null;
        }

        return new faceapi.LabeledFaceDescriptors(`${usuario.nombre} ${usuario.apellido}`, [detections.descriptor]);
      } catch (error) {
        console.error(`Error procesando la imagen de ${usuario.nombre}:`, error);
        return null;
      }
    })
  ).then((results) => results.filter(Boolean));
}

video.addEventListener("play", async () => {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  const tinyFaceOptions = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.5,
  });
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, tinyFaceOptions)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    const results = resizedDetections.map((d) => {
      return faceMatcher.findBestMatch(d.descriptor);
    });
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      let label = result.label;
      if (label === "unknown") {
        label = "Desconocido";
      }
      const drawBox = new faceapi.draw.DrawBox(box, { label });
      drawBox.draw(canvas);
      leerNombre(label);
    });
  }, 100);
});

function leerNombre(nombre) {
  const ahora = Date.now();
  if (cooldowns[nombre] && ahora - cooldowns[nombre] < COOLDOWN_TIME) {
    return;
  }
  cooldowns[nombre] = ahora;
  if ("speechSynthesis" in window) {
    let mensaje;
    if (nombre === "Desconocido") {
      mensaje = new SpeechSynthesisUtterance(`Persona desconocida detectada`);
    } else {
      mensaje = new SpeechSynthesisUtterance(`Bienvenido: ${nombre}`);
    }
    mensaje.lang = "es-ES";
    window.speechSynthesis.speak(mensaje);
  }
}

document.getElementById("fullscreen").addEventListener("click", () => {
  window.api.pantallaCompleta();
});
