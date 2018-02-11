var t = new RateTransposer(true);
var s = new Stretch(true);
var st = new SoundTouch();
st.pitch = 1.0;
s.tempo = .5;
st.rate = 1.0;

var buffer = {};
var bufferDuration;

var node = context.createScriptProcessor ? context.createScriptProcessor(BUFFER_SIZE, 2, 2) : context.createJavaScriptNode(BUFFER_SIZE, 2, 2);

var samples = new Float32Array(BUFFER_SIZE * 2);

var pos = 0;

var leftchannel = [];
var rightchannel = [];
var recordingLength = 0;

node.onaudioprocess = function (e) {
	if (buffer.getChannelData){
	    pos+=BUFFER_SIZE / context.sampleRate;
	    var l = e.outputBuffer.getChannelData(0);
	    var r = e.outputBuffer.getChannelData(1);
	    var framesExtracted = f.extract(samples, BUFFER_SIZE);
	    if (framesExtracted == 0) {
	        pause();
	    }
	    for (var i = 0; i < framesExtracted; i++) {
	        l[i] = samples[i * 2];
	        r[i] = samples[i * 2 + 1];
	    }

        leftchannel.push (new Float32Array (l));
        rightchannel.push (new Float32Array (r));
        recordingLength += BUFFER_SIZE;
	}
};

var audioInitialized = false;

function play() {
    if (!audioInitialized){
        audioInitialized = true;
        context.resume();

        var buffer = context.createBuffer(1, 1, 22050);
        var source = context.createBufferSource();
        source.buffer = buffer;
        // Connect to output (speakers)
        source.connect(context.destination);
        source.start(0);
    }

    node.connect(context.destination);
    node.connect(analyser);

    analyser.connect (audioCtx.destination);

    visualize();
    //ga('send', 'event', 'Pitch shift playback', "Play");

    // window.setInterval(function(){
        // console.log(pos);
        // console.log("Percentage complete: ",100*pos/bufferDuration);
    // },
    // 1000);
}

function pause() {
    node.disconnect();
    //ga('send', 'event', 'Pitch shift playback', "Pause");
}

var source = {
    extract: function (target, numFrames, position) {
        $("#current-time").html(minsSecs(position/(context.sampleRate)));
        //$("#progress").width(100*position/(bufferDuration*context.sampleRate) + "%");
        if (updateSlider){
            console.log("Updating...");
            $("#play-slider")[0].noUiSlider.set(100*position/(bufferDuration*context.sampleRate));
        }
        if (Math.round(100 *position/(bufferDuration*context.sampleRate)) == 100 && is_playing){
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
        var l = buffer.getChannelData(0);
        if (buffer.numberofChannels > 1){
            var r = buffer.getChannelData(1);
        } else {
            var r = buffer.getChannelData(0);
        }
        for (var i = 0; i < numFrames; i++) {
            target[i * 2] = l[i + position];
            target[i * 2 + 1] = r[i + position];
        }
        return Math.min(numFrames, l.length - position);
    }
};


//Stretch (s) or Rate (t) object goes in this filter function!
f = new SimpleFilter(source, st);