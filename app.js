const cameraView = document.querySelector('#camera-view'),
    cameraTextContainer = document.querySelector('#camera-and-text-container'),
    saveArea = document.querySelector('#save-area'),
    cameraCanvas = document.querySelector('#camera-canvas'),
    textContainer = document.querySelector('#text-container'),

    cameraTrigger = document.querySelector('#camera-trigger'),
    cameraSwitch = document.querySelector('#camera-switch'),
    saveImage = document.querySelector('#image-save'),
    toolToggle = document.querySelector('#tool-toggle'),

    toolsContainer = document.querySelector('#tools-container'),
    imageRatio = document.querySelector('#image-ratio'),
    textSize = document.querySelector('#text-size'),
    textColor = document.querySelector('#text-color'),
    textBackgroundColor = document.querySelector('#text-background-color'),
    textLineHeight = document.querySelector('#text-line-height'),
    imageFilter = document.querySelector('#image-filter'),
    imageTextSwap = document.querySelector('#image-text-swap');

let currentlyRunningCamera = true,
    track = null,
    streamingTimeout = null,
    facingMode = 'user',
    imageTextRatio = 0.6,
    toolsShowing = true,
    textSide = 'right';

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

const getDimensions = () => {
    let height = cameraTextContainer.clientHeight;
    let width = cameraTextContainer.clientWidth;
    let trackHeight = height;
    let trackWidth = width;
    if (track) {
        const trackSettings = track.getSettings();
        trackHeight = trackSettings.height;
        trackWidth = trackSettings.width;
    }
    height = Math.min(trackHeight, height);
    width = Math.min(trackWidth, width);

    height = Math.min(height, width);
    width = height * imageTextRatio;

    return { height, width };
};

const positionTextAndVideo = () => {
    const dimensions = getDimensions();
    const videoHeight = dimensions.height;
    const textWidth = videoHeight * (1 - imageTextRatio);

    textContainer.style.width = textWidth;
    textContainer.style.height = videoHeight;

    const flexDirection = (textSide === 'right') ? 'row' : 'row-reverse';
    saveArea.style.flexDirection = flexDirection;
};

const stopCamera = () => {
    if (streamingTimeout) clearTimeout(streamingTimeout);
    if (track) {
        track.stop();
        track = null;
    }
    currentlyRunningCamera = false;
    cameraTrigger.innerText = 'Take a new picture';
    imageFilter.disabled = false;
    imageFilter.value = 'none';
}

const streamScaledVideo = () => {
    const { height, width } = getDimensions();

    // map the center of the video stream to the canvas
    const videoStreamDimensions = track.getSettings();
    const clipX = (videoStreamDimensions.width - width) / 2;
    const clipY = (videoStreamDimensions.height - height) / 2;

    cameraCanvas.getContext('2d').drawImage(cameraView, clipX, clipY, width, height, 0, 0, width, height);

    if (streamingTimeout) clearTimeout(streamingTimeout);
    streamingTimeout = setTimeout(streamScaledVideo, 1000 / 30);
}

const startCamera = () => {
    const constraints = {
        video: { facingMode },
        audio: false,
    };

    return navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            if (track) track.stop();
            track = stream.getVideoTracks()[0];
            cameraView.srcObject = stream;

            const { height, width } = getDimensions();
            cameraCanvas.height = height;
            cameraCanvas.width = width;

            currentlyRunningCamera = true;
            cameraTrigger.innerText = 'Take a picture';
            imageFilter.disabled = true;
            positionTextAndVideo();
            streamScaledVideo();
        })
        .catch(console.error);
};

window.addEventListener('load', () => {
    imageRatio.value = imageTextRatio * 100;
    textSize.value = textContainer.style.fontSize;
    startCamera();
}, false);

// Control buttons
cameraTrigger.onclick = () => {
    clearTimeout(streamingTimeout);

    if (currentlyRunningCamera) {
        stopCamera();
    } else {
        startCamera();
    }
};

cameraSwitch.onclick = () => {
    facingMode = (facingMode === 'user') ? 'environment' : 'user';
    cameraTrigger.innerText = 'Take a picture';

    const cameraElements = [cameraView, cameraCanvas];
    startCamera().then(() => {
        const transform = (facingMode === 'user') ? 'scaleX(-1)' : 'scaleX(1)';
        cameraElements.forEach((element) => element.style.transform = transform);
    });
};

saveImage.onclick = () => {
    const saveAs = (uri, filename) => {
        const link = document.createElement('a');

        if (typeof link.download === 'string') {
            link.href = uri;
            link.download = filename;

            document.body.appendChild(link); // Firefox hack
            link.click();
            document.body.removeChild(link);
        } else {
            window.open(uri);
        }
    };

    html2canvas(saveArea).then((canvas) => {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace(/[:.T]/g, '-');
        const downloadName = `instahelper-${formattedDate}.png`;
        saveAs(canvas.toDataURL(), downloadName);
    });
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
imageFilter.onchange = (e) => {
    const filterName = e.target.value;
    Caman('#camera-canvas', function () {
        this.reloadCanvasData();

        switch(filterName) {
            case 'Vintage':
                this.vintage();
                break;
            case 'Lomo':
                this.lomo();
                break;
            case 'Clarity':
                this.clarity();
                break;
            case 'Sin City':
                this.sinCity();
                break;
            case 'Sunrise':
                this.sunrise();
                break;
            case 'Cross Process':
                this.crossProcess();
                break;
            case 'Orange Peel':
                this.orangePeel();
                break;
            case 'Love':
                this.love();
                break;
            case 'Grungy':
                this.grungy();
                break;
            case 'Jarques':
                this.jarques();
                break;
            case 'Pinhole':
                this.pinhole();
                break;
            case 'Old Boot':
                this.oldBoot();
                break;
            case 'Glowing Sun':
                this.glowingSun();
                break;
            case 'Hazy Days':
                this.hazyDays();
                break;
            case 'Her Majesty':
                this.herMajesty();
                break;
            case 'Nostalgia':
                this.nostalgia();
                break;
            case 'Hemingway':
                this.hemingway();
                break;
            case 'Concentrate':
                this.concentrate();
                break;
            default:
                this.revert();         
        }
        this.render();
    });
};

imageRatio.onchange = debounce((e) => {
    const ratio = parseInt(e.target.value) / 100;
    imageTextRatio = ratio;
    startCamera();
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

// Fix sizing on events like device rotation
window.addEventListener('resize', debounce(startCamera, 100));
