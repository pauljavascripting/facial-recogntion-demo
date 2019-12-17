import React, { useEffect, useRef }  from 'react';
import * as faceapi from 'face-api.js';
import './App.css';
import faceFrame from './images/face_frame.png'

const videoHeight = 1024;
const videoWidth = 600;
const MODEL_URL = process.env.PUBLIC_URL+'/models';
const inputSize = 128; // defines quality of detection
let video;

function App() {

  // define objects
  const canvasEl = useRef(null);
  const frameEl = useRef(null);
  const videoEl = useRef(null);

  function useEffectAsync(effect, inputs) {
    useEffect(() => {
        effect();
    }, inputs);
  }

  function drawImageToCanvas( x, y, width, height) {

     const canvas = canvasEl.current;
     canvas.width = videoWidth;
     canvas.height = videoHeight;  
     const ctx = canvas.getContext('2d');
     const img = frameEl;
     ctx.drawImage(img.current, x, y-50, width, height);
    
  }

  useEffectAsync(async () => {
      
    // load facial models ---------------------------------------
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
    await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    
     // add video ---------------------------------------
    var constraints = { audio: false, video: { width: videoWidth, height: videoHeight } }; 
      navigator.mediaDevices.getUserMedia(constraints)
      .then(function(mediaStream) {

        video = document.getElementById('video');
        video.srcObject = mediaStream;
          
          // video on loaded ---------------------------------------
          video.onloadedmetadata = function(e) {

            // play video
            video.play();

            // start drawing box
            this.interval =  setInterval(async function(){ 

              let input = video;
    
              const detections = await faceapi.detectAllFaces(input, new faceapi.TinyFaceDetectorOptions({inputSize: inputSize }));
              const detectionsForSize = faceapi.resizeResults(detections, { width: videoWidth, height: videoHeight });

              if(detectionsForSize[0]){
                drawImageToCanvas(detectionsForSize[0]._box._x, detectionsForSize[0]._box._y-150, detectionsForSize[0]._box._width, detectionsForSize[0]._box._height);
              }

            }, 100);

          }
      })

}, []);

  return (
    <div className="App">
     <div className='detectionVideo'><video className='video' ref={videoEl} muted id='video'><source src='' /></video></div>
     <div className='detectionCanvas'><canvas ref={canvasEl} /></div>
     <div>
      <img alt='img' ref={frameEl} src={faceFrame} className="hidden" />
      </div>
    </div>
  );
}

export default App;
