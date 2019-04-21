let facingMode = 'user';
let currentlyRunningCamera = true;
let track = null;
let imageTextRatio = 0.6;
let toolsShowing = false;
let textSide = 'right';

const debounce = (func, wait) => {
  let timeout;

  return function () {
    let context = this;
    let args = arguments;

    let later = function() {
      timeout = null;
      func.apply(context, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const cameraTextContainer = document.querySelector('#camera-and-text-container');
    cameraContainer = document.querySelector('#camera-container');
    textContainer = document.querySelector('#text-container');
    cameraView = document.querySelector('#camera-view'),
    cameraOutput = document.querySelector('#camera-output'),
    cameraCanvas = document.querySelector('#camera-canvas'),
    cameraTrigger = document.querySelector('#camera-trigger'),
    cameraSwitch = document.querySelector('#camera-switch'),
    toolsContainer = document.querySelector('#tools-container'),
    toolToggle = document.querySelector('#tool-toggle'),
    imageRatio = document.querySelector('#image-ratio'),
    textSize = document.querySelector('#text-size'),
    textColor = document.querySelector('#text-color'),
    textBackgroundColor = document.querySelector('#text-background-color'),
    textLineHeight = document.querySelector('#text-line-height'),
    imageTextSwap = document.querySelector('#image-text-swap');

const getConstraints = () => {
    let height = cameraTextContainer.clientHeight;
    let width = cameraTextContainer.clientWidth;
    height = Math.min(height, width);
    width = height * imageTextRatio;

    return {
        video: {
            facingMode,
            height,
            width,
        },
        audio: false,
   };
};

const positionTextAndVideo = () => {
    // TODO - needs improvement
    // not in correct position when switched back to right side
    const constraints = getConstraints();
    const videoHeight = constraints.video.height;
    const videoWidth = constraints.video.width;
    const textWidth = videoHeight * (1 - imageTextRatio);

    textContainer.style.width = textWidth;
    textContainer.style.height = videoHeight;
    imageRatio.value = imageTextRatio * 100;

    if (textSide === 'right') {
        textContainer.style.left = videoWidth;
        cameraContainer.style.left = 0;
    } else {
        textContainer.style.left = 0;
        cameraContainer.style.left = textWidth;
    }
};

const runCamera = () => {
    const constraints = getConstraints();
    return navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            const height = constraints.video.height;
            const width = constraints.video.width;

            positionTextAndVideo(width, height);
            track = stream.getTracks()[0];
            cameraView.srcObject = stream;
        })
        .catch(console.error);
};

window.addEventListener('load', runCamera, false);

// Control buttons
cameraTrigger.onclick = () => {
    if (currentlyRunningCamera) {
        cameraCanvas.width = cameraView.videoWidth;
        cameraCanvas.height = cameraView.videoHeight;
        cameraCanvas.getContext('2d').drawImage(cameraView, 0, 0);
        cameraOutput.style.display = 'block';
        cameraOutput.src = cameraCanvas.toDataURL('image/webp');
        cameraTrigger.innerText = 'Take a new picture';
        // track.stop();
    } else {
        cameraOutput.style.display = 'none';
        cameraTrigger.innerText = 'Take a picture';
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

toolToggle.onclick = () => {
  if (toolsShowing) {
    toolsContainer.style.display = 'none';
    toolToggle.innerText = 'Show Options'
  } else {
    toolsContainer.style.display = 'block';
    toolToggle.innerText = 'Hide Options'
  }
  toolsShowing = !toolsShowing;
};

// Tools
imageRatio.onchange = debounce((e) => {
    const ratio = parseInt(e.target.value) / 100;
    imageTextRatio = ratio;
    runCamera();
}, 100);

textSize.onchange = (e) => {
    const size = parseInt(e.target.value);
    textContainer.style.fontSize = size;
};

textColor.onchange = (e) => {
    const color = e.target.value;
    textContainer.style.color = color;
};

textBackgroundColor.onchange = (e) => {
    const color = e.target.value;
    textContainer.style.backgroundColor = color;
};

textLineHeight.onchange = (e) => {
    const size = parseFloat(e.target.value);
    textContainer.style.lineHeight = size;
};

imageTextSwap.onclick = (e) => {
    textSide = (textSide === 'right') ? 'left' : 'right';
    positionTextAndVideo();
};
