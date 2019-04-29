let currentlyRunningCamera = true;
let track = null;
let streamingTimeout = null;
let facingMode = 'user';
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

const getDimensions = () => {
    let height = cameraTextContainer.clientHeight;
    let width = cameraTextContainer.clientWidth;
    height = Math.min(height, width);
    width = height * imageTextRatio;

    return { height, width };
};

const positionTextAndVideo = () => {
    const dimensions = getDimensions();
    const videoHeight = dimensions.height;
    const videoWidth = dimensions.width;
    const textWidth = videoHeight * (1 - imageTextRatio);

    textContainer.style.width = textWidth;
    textContainer.style.height = videoHeight;

    if (textSide === 'right') {
        textContainer.style.left = videoWidth;
        cameraContainer.style.left = 0;
    } else {
        textContainer.style.left = 0;
        cameraContainer.style.left = textWidth;
    }
};

const streamScaledVideo = () => {
    cameraCanvas.getContext('2d').drawImage(cameraView, 320, 0, 320, 180, 0, 0, 640, 360);
    streamingTimeout = setTimeout(streamScaledVideo, 1000 / 30);
}

const runCamera = () => {
    const { height, width } = getDimensions();
    const constraints = {
        video: { facingMode, height, width, },
        audio: false,
    };
    return navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            positionTextAndVideo();
            track = stream.getVideoTracks()[0];
            cameraView.srcObject = stream;
            streamScaledVideo();
        })
        .catch(console.error);
};

window.addEventListener('load', () => {
    imageRatio.value = imageTextRatio * 100;
    textSize.value = textContainer.style.fontSize;
    runCamera();
}, false);

// Control buttons
cameraTrigger.onclick = () => {
    if (currentlyRunningCamera) {
        cameraCanvas.width = cameraView.videoWidth;
        cameraCanvas.height = cameraView.videoHeight;
        clearTimeout(streamingTimeout);
        cameraCanvas.getContext('2d').drawImage(cameraView, 0, 0);
        cameraTrigger.innerText = 'Take a new picture';
    } else {
        cameraCanvas.getContext('2d').clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
        streamScaledVideo();
        cameraTrigger.innerText = 'Take a picture';
    }
    currentlyRunningCamera = !currentlyRunningCamera;
};

cameraSwitch.onclick = () => {
    const cameraElements = [cameraView, cameraCanvas];
    if (facingMode === 'user') {
        facingMode = 'environment';
        cameraElements.forEach((element) => {
            element.style.transform = 'scaleX(1)';
        });
    } else {
        facingMode = 'user';
        cameraElements.forEach((element) => {
            element.style.transform = 'scaleX(-1)';
        });
    }
    track.stop();
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
}, 1000);

textSize.oninput = (e) => {
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

textLineHeight.oninput = (e) => {
    const size = parseFloat(e.target.value);
    textContainer.style.lineHeight = size;
};

imageTextSwap.onclick = (e) => {
    textSide = (textSide === 'right') ? 'left' : 'right';
    positionTextAndVideo();
};
