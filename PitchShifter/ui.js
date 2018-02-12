function minsSecs(secs){
    mins = Math.floor(secs / 60);
    seconds = secs - mins * 60;
    return mins + ":" + pad(parseInt(seconds),2);
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

var updateSlider = true;

$(document.body).on("pointerup touchend",function(e){
    console.log("Mouse up");
    updateSlider = true;
});

$(document.body).on("mouseup",function(e){
    console.log("Mouse up");
    updateSlider = true;
});

class TrackUI {
    constructor(visualizerSelector, visualSelectIdentifier, currentTimeSliderSelector,
        playSliderSelector, playButtonSelector, pauseButtonSelector, fileInputSelector,
        timingSelector, loadingSelector, totalTimeSelector, progressSelector, pitchSliderSelector, pitchShiftValueSelector, 
        tempoSliderSelector, tempoShiftValueSelector, maintainTempoSelector, semitonesSelector){

        this.track = new Track();

        var track = this.track;

        track.spectrogram.canvas = document.querySelector(visualizerSelector);
        track.spectrogram.visualSelect = document.getElementById(visualSelectIdentifier);

        track.currentTimeSlider = $(currentTimeSliderSelector);
        track.playSlider = $(playSliderSelector)[0];

        track.initialize();

        $(playButtonSelector).click(function(e){
            if (fileInput.val()==""){
                alert("Please choose a file to play");
            } else if ($(this).hasClass("disabled")) {
                // alert("Currently loading audio, please wait a few seconds...");
            } else{
                track.play();
                is_playing = true;
                if ($("#save-output").prop("checked") == true){
                    recorder = new Recorder(node, {workerPath: 'recorderWorkerMP3.js'});
                    startRecording();
                }
            }
        });

        $(pauseButtonSelector).click(function(e){
            track.pause();
            is_playing = false;
        });

        var fileInput = $(fileInputSelector);
        // bufferSource.gain.value = 1;
        // bufferSource.loop = true;
        // bufferSource.connect(oscillatorGain);

        fileInput.on("change", function() {

            $(timingSelector).hide();
            $(loadingSelector).show();
            $(playButtonSelector).addClass("disabled");

            if (is_playing) track.pause();
            var reader = new FileReader();
            reader.onload = function(ev) {
                track.audioCtx.decodeAudioData(ev.target.result, function(theBuffer){
                    track.pause();
                    //ga('send', 'event', 'File Upload', "Success");

                    track.buffer = theBuffer;
                    track.bufferDuration = theBuffer.duration;
                    $(playButtonSelector).removeClass("disabled");

                    $(totalTimeSelector).html(minsSecs(track.bufferDuration));

                    $(progressSelector).width("0%");
                    $(currentTimeSliderSelector).html("0:00");


                    track.st = new SoundTouch();
                    track.st.pitch = ($(pitchSliderSelector)[0].noUiSlider.get() / 100);
                    track.st.tempo = !$(maintainTempoSelector).prop("checked") ? ($(pitchSliderSelector)[0].noUiSlider.get() / 100) : 1;

                    track.f = new SimpleFilter(track.source, track.st);

                    track.pos = 0;

                    track.f.sourcePosition = 0;

                    $(playButtonSelector).addClass("beginTuning");
                    $(timingSelector).show();
                    $(loadingSelector).hide();
                }, function(){ //error function
                    $(loadingSelector).html("Sorry, we could not process this audio file.");
                    //ga('send', 'event', 'File Upload', "Failure");
                })
            };
            reader.readAsArrayBuffer(this.files[0]);
        });


        noUiSlider.create($(pitchSliderSelector)[0],{
            start: 100,
            range: {
                'min': 50,
                'max': 150
            },
        });

        var twelth_root = 1.05946309436;
        track.st.pitch = 1;

        $(pitchSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(pitchSliderSelector)[0].noUiSlider.get();
            track.st.pitch = (value / 100);
            track.st.tempo = 1;
            var pitch = Math.pow(twelth_root, parseFloat(value)) 
            var pitchFormatted = (100 * pitch).toFixed(2);
            // console.log($(this).val() / 100);
            // $(semitonesSelector).val(parseFloat(($(this).val() / 100 - 1) / 0.05946309436).toFixed(2));
            $(semitonesSelector).val(Math.log(value / 100)/Math.log(twelth_root));
            $(pitchShiftValueSelector).html(value);


        });

        noUiSlider.create($(tempoSliderSelector)[0],{
            start: 100,
            range: {
                'min': 25,
                'max': 400
            }
        });

        track.st.tempo = 1;

        $(tempoSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(tempoSliderSelector)[0].noUiSlider.get();
            track.st.tempo = (value / 100);
            $(tempoShiftValueSelector).html(value);
        });


        $(pitchSliderSelector)[0].noUiSlider.on("change", function(){
            //ga('send', 'event', 'Pitch shift', "Slider", $(this).val());
        })

        $(semitonesSelector).change(function(){

            //ga('send', 'event', 'Pitch shift', "Semitone", $(this).val());


            if ($(this).val() <= 12 && $(this).val() >= - 12){

            // $(".pitch-slider").val(100.0 + 1*parseFloat(( parseFloat($(this).val())) * parseFloat(twelth_root-1) * 100).toFixed(2));
            // $("#pitch-shift-value").html((100.0 + 1*parseFloat($(this).val() * parseFloat(twelth_root-1) * 100)).toFixed(2));


            // console.log(100 + (1+ parseFloat($(this).val()) * parseFloat(twelth_root-1) * 100));
            // st.pitch = st.pitch + parseFloat($(this).val()) * parseFloat(twelth_root-1);
            // st.pitch = (1+ parseFloat($(this).val()) * parseFloat(twelth_root-1));

            var pitch = Math.pow(twelth_root, parseFloat($(this).val())) 
            var pitchFormatted = (100 * pitch).toFixed(2);

            st.pitch = pitch;

            $(pitchSliderSelector)[0].noUiSlider.set(pitchFormatted);
            $(pitchShiftValueSelector).html(pitchFormatted);

            st.tempo = !$(maintainTempoSelector).prop("checked") ? ($(".pitch-slider").val() / 100) : 1;

            // st.pitch = $(this).val() + 1
            } else {
                alert("Please enter a number between -12 and +12");
            }
        });


        noUiSlider.create($(playSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 100
            },
            connect: [true, false]
        });

        $(playSliderSelector).on("pointerdown touchstart",function(e){
            updateSlider = false;
            console.log("Mouse down");
        });

        $(playSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(playSliderSelector)[0].noUiSlider.get();
            track.pause();
            track.st = new SoundTouch();
           track.st.pitch = $(pitchSliderSelector)[0].noUiSlider.get() /100;
           track.st.tempo = !$(maintainTempoSelector).prop("checked") ? ($(pitchSliderSelector)[0].noUiSlider.get() / 100) : 1;
           track.f = new SimpleFilter(track.source, track.st);

           track.pos = 0;
           track.f.sourcePosition = parseInt((value / 100) * track.bufferDuration * track.audioCtx.sampleRate);
           if (is_playing){
               track.play();
           }
        });
    }
}

var trackui = new TrackUI('.visualizer', "visual", "#current-time", "#play-slider",
 "#play-pitchshifter", "#pause-pitchshifter", "#audio-file", ".timing",
 ".loading", "#total-time", "#progress", ".pitch-slider", "#pitch-shift-value",
 ".tempo-slider", "#tempo-shift-value", "#maintain-tempo", "#semitones");