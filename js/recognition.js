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

function getLabeledFaceDescriptions() {
  const labels = ["Sergio Galarza"];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const imgPath = await window.api.rutaImagenes();
        const img = await faceapi.fetchImage(`${imgPath}/${label}/${i}.jpg`);
        const detections = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
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
