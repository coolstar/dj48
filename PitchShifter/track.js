var audioInitialized = false;

class Track {
    constructor(x){
        this.audioCtx = new contextClass();

        this.t = new RateTransposer(true);
        this.s = new Stretch(true);
        this.st = new SoundTouch();
        this.st.pitch = 1.0;
        this.s.tempo = .5;
        this.st.rate = 1.0;

        this.buffer = {};
        this.bufferDuration;

        this.node = this.audioCtx.createScriptProcessor ? this.audioCtx.createScriptProcessor(BUFFER_SIZE, 2, 2) : this.audioCtx.createJavaScriptNode(BUFFER_SIZE, 2, 2);

        this.samples = new Float32Array(BUFFER_SIZE * 2);

        this.pos = 0;

        this.leftchannel = [];
        this.rightchannel = [];
        this.recordingLength = 0;

        this.spectrogram = new Spectrogram(this);

        this.node.onaudioprocess = function (e) {
            if (this.track.buffer.getChannelData){
                this.track.pos+=BUFFER_SIZE / this.track.audioCtx.sampleRate;
                var l = e.outputBuffer.getChannelData(0);
                var r = e.outputBuffer.getChannelData(1);
                var framesExtracted = this.track.f.extract(this.track.samples, BUFFER_SIZE);
                if (framesExtracted == 0) {
                    this.track.pause();
                }
                for (var i = 0; i < framesExtracted; i++) {
                    l[i] = this.track.samples[i * 2];
                    r[i] = this.track.samples[i * 2 + 1];
                }

                this.track.leftchannel.push (new Float32Array (l));
                this.track.rightchannel.push (new Float32Array (r));
                this.track.recordingLength += BUFFER_SIZE;
            }
        };

        this.source = {
            extract: function (target, numFrames, position) {
                $("#current-time").html(minsSecs(position/(this.parent.audioCtx.sampleRate)));
                //$("#progress").width(100*position/(bufferDuration*this.parent.audioCtx.sampleRate) + "%");
                if (updateSlider){
                    console.log("Updating...");
                    $("#play-slider")[0].noUiSlider.set(100*position/(this.parent.bufferDuration*this.parent.audioCtx.sampleRate));
                }
                if (Math.round(100 *position/(this.parent.bufferDuration*this.parent.audioCtx.sampleRate)) == 100 && is_playing){
                    //stop recorder
                    recorder && recorder.stop();
                    __log('Recording complete.');
                    
                    // create WAV download link using audio data blob
                    createDownloadLink();
                    
                    if (typeof recorder != "undefined"){
                        recorder.clear();
                    }
                    is_playing = false;
                }
                var l = this.parent.buffer.getChannelData(0);
                if (this.parent.buffer.numberofChannels > 1){
                    var r = this.parent.buffer.getChannelData(1);
                } else {
                    var r = this.parent.buffer.getChannelData(0);
                }
                for (var i = 0; i < numFrames; i++) {
                    target[i * 2] = l[i + position];
                    target[i * 2 + 1] = r[i + position];
                }
                return Math.min(numFrames, l.length - position);
            },
            parent: this
        };

        //Stretch (s) or Rate (t) object goes in this filter function!
        this.f = new SimpleFilter(this.source, this.st);
    }

    play() {
        if (!audioInitialized){
            audioInitialized = true;
            this.audioCtx.resume();

            var buffer = this.audioCtx.createBuffer(1, 1, 22050);
            var source = this.audioCtx.createBufferSource();
            source.buffer = buffer;
            // Connect to output (speakers)
            source.connect(this.audioCtx.destination);
            source.start(0);
        }

        this.node.track = this;
        this.node.connect(this.audioCtx.destination);
        this.node.connect(this.spectrogram.analyser);

        this.spectrogram.analyser.connect(this.audioCtx.destination);

        this.spectrogram.visualize();
    }

    pause() {
        this.node.disconnect();
        //ga('send', 'event', 'Pitch shift playback', "Pause");
    }
}

var track = new Track();