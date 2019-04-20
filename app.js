let imageTextRatio = 2/3;
let facingMode = 'user';
let currentlyRunningCamera = true;
let track = null;

const cameraDiv = document.querySelector('#camera');
    cameraView = document.querySelector('#camera-view'),
    cameraOutput = document.querySelector('#camera-output'),
    cameraCanvas = document.querySelector('#camera-canvas'),
    cameraTrigger = document.querySelector('#camera-trigger'),
    cameraSwitch = document.querySelector('#camera-switch');

const getConstraints = () => {
    const height = cameraDiv.clientHeight;
    const width = height * imageTextRatio;

    return {
        video: {
            facingMode,
            height,
            width,
        },
        audio: false,
   };
};

cameraTrigger.onclick = () => {
    if (currentlyRunningCamera) {
        cameraCanvas.width = cameraView.videoWidth;
        cameraCanvas.height = cameraView.videoHeight;
        cameraCanvas.getContext('2d').drawImage(cameraView, 0, 0);
        cameraOutput.style.display = 'block';
        cameraOutput.src = cameraCanvas.toDataURL('image/webp');
        cameraTrigger.innerText = 'Take another picture.';
        // track.stop();
    } else {
        cameraOutput.style.display = 'none';
        cameraTrigger.innerText = 'Take picture';
    }
    currentlyRunningCamera = !currentlyRunningCamera;
};

cameraSwitch.onclick = () => {
    if (facingMode === 'user') {
        facingMode = 'environment'
    } else {
        facingMode = 'user'
    }
    runCamera();
};

const runCamera = () => {
    return navigator.mediaDevices
        .getUserMedia(getConstraints())
        .then((stream) => {
            track = stream.getTracks()[0];
            cameraView.srcObject = stream;
        })
        .catch(console.error);
};

window.addEventListener('load', runCamera, false);
