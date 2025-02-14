const cooldown = {};
const COOLDOWN_TIME = 5000;

function cooldowns(nombre) {
  const ahora = Date.now();
  if (cooldown[nombre] && ahora - cooldown[nombre] < COOLDOWN_TIME) {
    return true;
  }
  cooldown[nombre] = ahora;
  return false;
}

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
  if (videoDevices.length === 0) return;

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
      console.error(`Error al acceder a la cámara (${device.label}):`, error);
    }
  });
}

async function getLabeledFaceDescriptions() {
  const usuarios = await window.api.obtenerUsuarios();
  if (!Array.isArray(usuarios) || usuarios.length === 0) return [];

  return Promise.all(
    usuarios.map(async (usuario) => {
      try {
        const imageBlob = new Blob([new Uint8Array(usuario.imagen)], { type: "image/jpeg" });
        const imageURL = URL.createObjectURL(imageBlob);
        const img = await faceapi.fetchImage(imageURL);
        URL.revokeObjectURL(imageURL);
        const detections = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (!detections) return null;
        return new faceapi.LabeledFaceDescriptors(`${usuario.nombre} ${usuario.apellido}`, [detections.descriptor]);
      } catch (error) {
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
  const tinyFaceOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });

  async function detectFaces() {
    const detections = await faceapi
      .detectAllFaces(video, tinyFaceOptions)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    resizedDetections.forEach(async (detection) => {
      const result = faceMatcher.findBestMatch(detection.descriptor);
      const box = detection.detection.box;
      let label = result.label === "unknown" ? `Desconocido` : result.label;
      new faceapi.draw.DrawBox(box, { label }).draw(canvas);
      if (!cooldowns(label)) {
        leerNombre(label);
        registrarUsuario(label, video, canvas, box);
      }
    });

    requestAnimationFrame(detectFaces);
  }

  detectFaces();
}

async function registrarUsuario(nombre, video, canvas, box) {
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  const scaleX = video.videoWidth / video.width;
  const scaleY = video.videoHeight / video.height;
  const x = box.x * scaleX;
  const y = box.y * scaleY;
  const width = box.width * scaleX;
  const height = box.height * scaleY;
  tempCanvas.width = width;
  tempCanvas.height = height;
  tempCtx.drawImage(video, x, y, width, height, 0, 0, width, height);
  const faceBlob = await new Promise((resolve) => tempCanvas.toBlob(resolve, "image/jpeg", 0.95));
  const buffer = await faceBlob.arrayBuffer();
  const foto = Array.from(new Uint8Array(buffer));
  const fecha_hora = new Date().toLocaleString("es-ES", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });

  try {
    await window.api.registrarReconocimiento(nombre, foto, fecha_hora);
    console.log("Registro exitoso:", nombre);
  } catch (error) {
    console.error("Error al registrar el reconocimiento:", error);
  }
}

function imageDataToBlob(imageData) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.putImageData(imageData, 0, 0);
    setTimeout(() => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
    }, 100);
  });
}


function leerNombre(nombre) {
  if ("speechSynthesis" in window) {
    let mensaje = new SpeechSynthesisUtterance(nombre === "Desconocido" ? "Persona desconocida detectada" : `Bienvenido: ${nombre}`);
    mensaje.lang = "es-ES";
    window.speechSynthesis.speak(mensaje);
  }
}

document.getElementById("fullscreen").addEventListener("click", () => {
  window.api.pantallaCompleta();
});
