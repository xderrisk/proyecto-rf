let videos = [];

function activar() {
    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        videoDevices.forEach(videoDevice => {
            navigator.mediaDevices.getUserMedia({ video: { deviceId: videoDevice.deviceId } })
            .then(stream => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.autoplay = true;
                document.body.appendChild(video);
            })
            .catch(error => {
                console.error('Error al acceder a la cámara:', error);
            });
        });
    })
    .catch(error => {
        console.error('Error al enumerar dispositivos:', error);
    });
}

function apagar() {
    videoElements.forEach(video => {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        video.parentNode.removeChild(video);
    });
    videos = [];
}

document.addEventListener('DOMContentLoaded', () => {
    activar();
});