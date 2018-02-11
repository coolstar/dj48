// set up forked web audio context, for multiple browsers
// window. is needed otherwise Safari explodes

class Spectrogram {
    constructor(track){
        this.analyser = track.audioCtx.createAnalyser();
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;
        this.analyser.smoothingTimeConstant = 0.85;

        // set up canvas context for visualizer

        this.canvas = document.querySelector('.visualizer');
        this.canvasCtx = this.canvas.getContext("2d");

        this.intendedWidth = document.querySelector('.wrapper').clientWidth;

        this.canvas.setAttribute('width',this.intendedWidth);

        this.visualSelect = document.getElementById("visual");

        this.drawVisual;

        // event listeners to change visualize and voice settings

        var self = this;

        this.visualSelect.onchange = function() {
            window.cancelAnimationFrame(self.drawVisual);
            self.visualize();
        };
    }

    visualize() {
        var WIDTH = this.canvas.width;
        var HEIGHT = this.canvas.height;
        
        
        var visualSetting = this.visualSelect.value;
        console.log(visualSetting);
        
        if(visualSetting == "sinewave") {
            this.analyser.fftSize = 2048;
            var bufferLength = this.analyser.fftSize;
            console.log(bufferLength);
            var dataArray = new Uint8Array(bufferLength);
            
            this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            
            var self = this;

            var draw = function() {
                
                self.drawVisual = requestAnimationFrame(draw);
                
                self.analyser.getByteTimeDomainData(dataArray);
                
                self.canvasCtx.fillStyle = 'black';
                self.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
                
                self.canvasCtx.lineWidth = 2;
                self.canvasCtx.strokeStyle = 'white';
                
                self.canvasCtx.beginPath();
                
                var sliceWidth = WIDTH * 1.0 / bufferLength;
                var x = 0;
                
                for(var i = 0; i < bufferLength; i++) {
                    
                    var v = dataArray[i] / 128.0;
                    var y = v * HEIGHT/2;
                    
                    if(i === 0) {
                        self.canvasCtx.moveTo(x, y);
                    } else {
                        self.canvasCtx.lineTo(x, y);
                    }
                    
                    x += sliceWidth;
                }
                
                self.canvasCtx.lineTo(self.canvas.width, self.canvas.height/2);
                self.canvasCtx.stroke();
            };
            
            draw();
            
        } else if(visualSetting == "frequencybars") {
            this.analyser.fftSize = 256;
            var bufferLengthAlt = this.analyser.frequencyBinCount;
            console.log(bufferLengthAlt);
            var dataArrayAlt = new Uint8Array(bufferLengthAlt);
            
            this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            
            var self = this;

            var drawAlt = function() {
                self.drawVisual = requestAnimationFrame(drawAlt);
                
                self.analyser.getByteFrequencyData(dataArrayAlt);
                
                self.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
                self.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
                
                var barWidth = (WIDTH / bufferLengthAlt) * 2.5;
                var barHeight;
                var x = 0;
                
                for(var i = 0; i < bufferLengthAlt; i++) {
                    barHeight = dataArrayAlt[i];
                    
                    self.canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
                    self.canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);
                    
                    x += barWidth + 1;
                }
            };
            
            drawAlt();
            
        } else if(visualSetting == "off") {
            this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            this.canvasCtx.fillStyle = "black";
            this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        }
        
    }
}


