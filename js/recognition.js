const cooldowns = {};
const COOLDOWN_TIME = 5000;

window.api.rutaModelos().then((ruta) => {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(ruta),
    faceapi.nets.faceRecognitionNet.loadFromUri(ruta),
    faceapi.nets.faceLandmark68Net.loadFromUri(ruta),
  ]).then(setupCameras);
});

async function setupCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === "videoinput");

  if (videoDevices.length === 0) {
    console.error("No se encontraron cámaras.");
    return;
  }

  const container = document.getElementById("video-container");
  container.innerHTML = "";

  videoDevices.forEach(async (device, index) => {
    const videoWrapper = document.createElement("div");
    videoWrapper.classList.add("video-wrapper");

    const video = document.createElement("video");
    video.id = `video-${index}`;
    video.autoplay = true;
    video.playsInline = true;
    video.width = 320;
    video.height = 240;

    const canvas = document.createElement("canvas");
    canvas.id = `canvas-${index}`;
    canvas.classList.add("overlay-canvas");

    videoWrapper.appendChild(video);
    videoWrapper.appendChild(canvas);
    container.appendChild(videoWrapper);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: device.deviceId },
        audio: false,
      });
      video.srcObject = stream;
      video.addEventListener("play", () => startFaceRecognition(video, canvas));
    } catch (error) {
      console.error(`Error accediendo a la cámara ${index}:`, error);
    }
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

async function startFaceRecognition(video, canvas) {
  const labeledFaceDescriptors = await getLabeledFaceDescriptions();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);
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
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    resizedDetections.forEach((detection, i) => {
      const result = faceMatcher.findBestMatch(detection.descriptor);
      const box = detection.detection.box;
      let label = result.label === "unknown" ? "Desconocido" : result.label;

      new faceapi.draw.DrawBox(box, { label }).draw(canvas);
      leerNombre(label);
    });
  }, 100);
}

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
