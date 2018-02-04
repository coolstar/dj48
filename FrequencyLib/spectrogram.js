// fork getUserMedia for multiple browser versions, for those
// that need prefixes

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

// set up forked web audio context, for multiple browsers
// window. is needed otherwise Safari explodes

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var source;

//set up the different audio nodes we will use for the app

var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;


// grab audio track via XHR for convolver node

var soundSource, concertHallBuffer;

ajaxRequest = new XMLHttpRequest();

ajaxRequest.open('GET', 'http://cs48-vps.coolstar.org/cs48-test/theedge-ncs.mp3', true);

ajaxRequest.responseType = 'arraybuffer';


ajaxRequest.onload = function() {
    var audioData = ajaxRequest.response;
    
    audioCtx.decodeAudioData(audioData, function(buffer) {
                             concertHallBuffer = buffer;
                             soundSource = audioCtx.createBufferSource();
                             soundSource.buffer = concertHallBuffer;

                             soundSource.connect(audioCtx.destination);
    soundSource.loop = true;
    soundSource.playbackRate.value = 1.1;
    soundSource.start();


    soundSource.connect(analyser);
    analyser.connect (audioCtx.destination);
                             
    visualize();
    }, function(e){
        console.log("Error with decoding audio data" + e.err);
    });
};

ajaxRequest.send();

// set up canvas context for visualizer

var canvas = document.querySelector('.visualizer');
var canvasCtx = canvas.getContext("2d");

var intendedWidth = document.querySelector('.wrapper').clientWidth;

canvas.setAttribute('width',intendedWidth);

var visualSelect = document.getElementById("visual");

var drawVisual;


function visualize() {
    WIDTH = canvas.width;
    HEIGHT = canvas.height;
    
    
    var visualSetting = visualSelect.value;
    console.log(visualSetting);
    
    if(visualSetting == "sinewave") {
        analyser.fftSize = 2048;
        var bufferLength = analyser.fftSize;
        console.log(bufferLength);
        var dataArray = new Uint8Array(bufferLength);
        
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        
        var draw = function() {
            
            drawVisual = requestAnimationFrame(draw);
            
            analyser.getByteTimeDomainData(dataArray);
            
            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
            
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
            
            canvasCtx.beginPath();
            
            var sliceWidth = WIDTH * 1.0 / bufferLength;
            var x = 0;
            
            for(var i = 0; i < bufferLength; i++) {
                
                var v = dataArray[i] / 128.0;
                var y = v * HEIGHT/2;
                
                if(i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            canvasCtx.lineTo(canvas.width, canvas.height/2);
            canvasCtx.stroke();
        };
        
        draw();
        
    } else if(visualSetting == "frequencybars") {
        analyser.fftSize = 256;
        var bufferLengthAlt = analyser.frequencyBinCount;
        console.log(bufferLengthAlt);
        var dataArrayAlt = new Uint8Array(bufferLengthAlt);
        
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        
        var drawAlt = function() {
            drawVisual = requestAnimationFrame(drawAlt);
            
            analyser.getByteFrequencyData(dataArrayAlt);
            
            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
            
            var barWidth = (WIDTH / bufferLengthAlt) * 2.5;
            var barHeight;
            var x = 0;
            
            for(var i = 0; i < bufferLengthAlt; i++) {
                barHeight = dataArrayAlt[i];
                
                canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
                canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);
                
                x += barWidth + 1;
            }
        };
        
        drawAlt();
        
    } else if(visualSetting == "off") {
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.fillStyle = "red";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    
}

// event listeners to change visualize and voice settings

visualSelect.onchange = function() {
    window.cancelAnimationFrame(drawVisual);
    visualize();
};


