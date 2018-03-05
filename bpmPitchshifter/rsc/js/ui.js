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

    //sync();    

});

$(document.body).on("mouseup",function(e){
    console.log("Mouse up");
    updateSlider = true;
});



class TrackUI {
    constructor(visualizerSelector, visualSelectIdentifier, currentTimeSliderSelector, playSliderSelector, 
        volumeSliderSelector, playButtonSelector, fileInputSelector,
        timingSelector, loadingSelector, totalTimeSelector, progressSelector, pitchSliderSelector, 
        tempoSliderSelector, maintainTempoSelector, semitonesSelector, saveOutputSelector, bpmLabelSelector, recordingslistSelector,
        distortionSliderSelector, delayMixSliderSelector, delayFeedbackSliderSelector, delayTimeSliderSelector, PPdelayMixSliderSelector,
	PPdelayFeedbackSliderSelector, PPdelayTimeSliderSelector, dDelayMixSliderSelector, dDelayFeedbackSliderSelector, dDelayTimeSliderSelector, dDelayCutoffSliderSelector){

        this.track = new Track();

        var track = this.track;
        var original_bpm = 0;
	track.spectrogram.canvas = document.querySelector(visualizerSelector);
        track.spectrogram.visualSelect = document.getElementById(visualSelectIdentifier);

        track.currentTimeSlider = $(currentTimeSliderSelector);
        track.playSlider = $(playSliderSelector)[0];
        

        track.initialize();
        var that = this;
        this.is_playing = false; 
        $(playButtonSelector).click(function(e){
            console.log("is_playing = " + that.is_playing);
            if (fileInput.val()==""){
                //alert("Please choose a file to play");
		console.log ("No file selected");
            } else if ($(this).hasClass("disabled")) { 
                console.log ("disabled");
                // alert("Currently loading audio, please wait a few seconds...");
            } else if (that.is_playing == false){
                track.play();
                $(playButtonSelector).html("pause");
                that.is_playing = true;
                if ($(saveOutputSelector).prop("checked") == true){
                    track.recorder = new Recorder(track.gainNode, {workerPath: "lib/recorder/recorderWorkerMP3.js"});
                    track.recorder && track.recorder.record();
                    __log('Started recording.');
                }
            } else {
                track.pause();
                $(playButtonSelector).html( "play");
                that.is_playing = false;
                if ($(saveOutputSelector).prop("checked") == true){
                    track.recorder && track.recorder.stop();
                     __log('Stopped recording.');
                
                    // create WAV download link using audio data blob
                    track.recorder && track.recorder.exportAudio(function(blob) {
                        var recordingslist = document.getElementById(recordingslistSelector);

                        var url = URL.createObjectURL(blob);
                        var li = document.createElement('li');
                        var au = document.createElement('audio');
                        var hf = document.createElement('a');
                  
                        au.controls = true;
                        au.src = url;
                        hf.href = url;
                        // hf.download = new Date().toISOString() + '.wav';
                        // hf.download = new Date().toISOString() + '.mp3';
                        hf.download = "pitch-shifted-" + $('input[type=file]').val().replace(/C:\\fakepath\\/i, '');
                        hf.innerHTML = hf.download;
                        li.appendChild(au);
                        li.appendChild(hf);
                        recordingslist.appendChild(li);
                        //console.log ("End export");
                        //ga('send', 'event', 'Pitch shift download', "Download Added");
                    });
                    //console.log ("Clear recorder");
                    track.recorder && track.recorder.clear();
                  }
            }
            updatePlayallButton();
        });


        var fileInput = $(fileInputSelector);
        // bufferSource.gain.value = 1;
        // bufferSource.loop = true;
        // bufferSource.connect(oscillatorGain);

        fileInput.on("change", function() {

            updatePlayallButton();
            updateSyncButton();
            $(timingSelector).hide();
            $(loadingSelector).show();
            $(playButtonSelector).addClass("disabled");

            if (that.is_playing) track.pause();
            var reader = new FileReader();
            reader.onload = function(ev) {
                track.audioCtx.decodeAudioData(ev.target.result, function(theBuffer){
                    track.pause();
                    //ga('send', 'event', 'File Upload', "Success");

                    track.buffer = theBuffer;

                    console.log("Start BPM Calculations...");

                    calculateBPM (track.buffer, function (bpm) {
                        track.bpm = bpm;
                        original_bpm = bpm;
                        console.log("BPM: " + track.bpm);
                        $(bpmLabelSelector).text(track.bpm);

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
                       
                    });
                }, function(){ //error function
                    $(bpmLabelSelector).text(track.bpm);
                    $(loadingSelector).html("Sorry, we could not process this audio file.");
                    //ga('send', 'event', 'File Upload', "Failure");
                    console.log("broke");
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
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
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
        });

        noUiSlider.create($(tempoSliderSelector)[0],{
            start: 100,
            range: {
                'min': 25,
                'max': 400
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

        track.st.tempo = 1;

        $(tempoSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(tempoSliderSelector)[0].noUiSlider.get();
            track.st.tempo = (value / 100);
            if (track.bpm != 0){
                track.bpm = Math.round(original_bpm*(value/100));
                $(bpmLabelSelector).text(track.bpm);
            }
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

            st.tempo = !$(maintainTempoSelector).prop("checked") ? ($(".pitch-slider").val() / 100) : 1;

            // st.pitch = $(this).val() + 1
            } else {
                alert("Please enter a number between -12 and +12");
            }
        });

        noUiSlider.create($(volumeSliderSelector)[0], {
            start: 100,
            range: {
                'min': 0,
                'max': 100
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

        $(volumeSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(volumeSliderSelector)[0].noUiSlider.get();
            track.gainNode.gain.value = value*2/100.0;
            console.log("value: "+ value/100.0);
        });

        noUiSlider.create($(distortionSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 100
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
        //EFFECTS
	//DISTORTION
		$(distortionSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(distortionSliderSelector)[0].noUiSlider.get();
            track.effects.distortion.gain = value/100.0;
            console.log("distortion gain: "+ value/100.0);
        });
	//DELAY
	noUiSlider.create($(delayMixSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 100
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

                $(delayMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(delayMixSliderSelector)[0].noUiSlider.get();
            track.effects.delay.mix = value/100.0;
            console.log("delay mix: "+ value/100.0);		
	});
     	noUiSlider.create($(delayFeedbackSliderSelector)[0],{
            start: 60,
            range: {
                'min': 0,
                'max': 100
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });


                $(delayFeedbackSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(delayFeedbackSliderSelector)[0].noUiSlider.get();
            track.effects.delay.feedback = value/100.0;
            console.log("delay feedback: "+ value/100.0);
        });
	
	noUiSlider.create($(delayTimeSliderSelector)[0],{
            start: 0.4,
            range: {
                'min': 0,
                'max': 5
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });


                $(delayTimeSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(delayTimeSliderSelector)[0].noUiSlider.get();
            track.effects.delay.time = value;
            console.log("delay time: "+ value);
        });

	//PPDELAY
	noUiSlider.create($(PPdelayMixSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 100
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });	
       
	$(PPdelayMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(PPdelayMixSliderSelector)[0].noUiSlider.get();
            track.effects.PPdelay.mix = value/100.0;
            console.log("PPdelay mix: "+ value/100.0);
        });
        noUiSlider.create($(PPdelayFeedbackSliderSelector)[0],{
            start: 60,
            range: {
                'min': 0,
                'max': 100
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });


                $(PPdelayFeedbackSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(PPdelayFeedbackSliderSelector)[0].noUiSlider.get();
            track.effects.PPdelay.feedback = value/100.0;
            console.log("PPdelay feedback: "+ value/100.0);
        });

        noUiSlider.create($(PPdelayTimeSliderSelector)[0],{
            start: 0.4,
            range: {
                'min': 0,
                'max': 5
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });


                $(PPdelayTimeSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(PPdelayTimeSliderSelector)[0].noUiSlider.get();
            track.effects.PPdelay.time = value;
            console.log("PPdelay time: "+ value);
        });
	//DUBDELAY

	noUiSlider.create($(dDelayMixSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 100
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

                $(dDelayMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(dDelayMixSliderSelector)[0].noUiSlider.get();
            track.effects.dDelay.mix = value/100.0;
            console.log("dDelay mix: "+ track.effects.dDelay.mix);
        });
        noUiSlider.create($(dDelayFeedbackSliderSelector)[0],{
            start: 60,
            range: {
                'min': 0,
                'max': 100
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });


                $(dDelayFeedbackSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(dDelayFeedbackSliderSelector)[0].noUiSlider.get();
            track.effects.dDelay.feedback = value/100.0;
            console.log("dDelay feedback: "+ value/100.0);
        });

        noUiSlider.create($(dDelayTimeSliderSelector)[0],{
            start: 0.4,
            range: {
                'min': 0,
                'max': 5
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });


                $(dDelayTimeSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(dDelayTimeSliderSelector)[0].noUiSlider.get();
            track.effects.dDelay.time = value;
            console.log("dDelay time: "+ value);
        });


	noUiSlider.create($(dDelayCutoffSliderSelector)[0],{
            start: 700,
            range: {
                'min': 0,
                'max': 4000
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });


                $(dDelayCutoffSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(dDelayCutoffSliderSelector)[0].noUiSlider.get();
            track.effects.dDelay.cutoff = value;
            console.log("dDelay time: "+ value);
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
           if (that.is_playing){
               track.play();
           }
        });
    }

}

var trackui = new TrackUI('.visualizer', "visual", "#current-time", "#play-slider", "#volume-slider",
 "#play-pitchshifter", "#audio-file", ".timing",
 ".loading", "#total-time", "#progress", ".pitch-slider",
 ".tempo-slider", "#maintain-tempo", "#semitones", "#save-output", "#bpm-label", "recordingslist", "#distortion-slider", "#delayMix-slider", "#delayFeedback-slider", "#delayTime-slider", "#PPdelayMix-slider", "#PPdelayFeedback-slider", "#PPdelayTime-slider","#dDelayMix-slider", "#dDelayFeedback-slider", "#dDelayTime-slider", "#dDelayCutoff-slider" );

var trackui2 = new TrackUI('.visualizer2', "visual2", "#current-time2", "#play-slider2", "#volume-slider2",
 "#play-pitchshifter2", "#audio-file2", ".timing2",
 ".loading2", "#total-time2", "#progress2", ".pitch-slider2",
 ".tempo-slider2", "#maintain-tempo2", "#semitones2", "#save-output2", 
 "#bpm-label2", "recordingslist2", "#distortion-slider2", "#delayMix-slider2", 
 "#delayFeedback-slider2", "#delayTime-slider2", 
 "#PPdelayMix-slider2", "#PPdelayFeedback-slider2", "#PPdelayTime-slider2",
"#dDelayMix-slider2", "#dDelayFeedback-slider2", "#dDelayTime-slider2", "#dDelayCutoff-slider2");

$("#sync-together").click (function (e) {
        
        var fileInput = $("#audio-file").val();
        var fileInput2 = $("#audio-file2").val();


        if (fileInput == "" || fileInput2 == "") {
               return;
        }
	bpm1 = trackui.track.bpm;
	bpm2 = trackui2.track.bpm;

	average = (bpm1+bpm2)/2;
	trackui.track.bpm = average
	trackui.track.st.tempo = trackui.track.st.tempo*(average/bpm1);
	trackui2.track.bpm = average;
	trackui2.track.st.tempo = trackui2.track.st.tempo*(average/bpm2);
	$("#bpm-label").text(Math.round(trackui.track.bpm));
	$("#bpm-label2").text(Math.round(trackui2.track.bpm));
	$(".tempo-slider")[0].noUiSlider.set(trackui.track.st.tempo*100);
	$(".tempo-slider2")[0].noUiSlider.set(trackui2.track.st.tempo*100);
	console.log(trackui.track.bpm + " and " + trackui.track.st.tempo);
	console.log(trackui2.track.bpm + " and " + trackui2.track.st.tempo);
});

$("#play-all").click(function (e) {

	//document.getElementById ("play-pitchshifter2").click();
        console.log("trackui1_playing = " + trackui.is_playing);
        console.log("trackui2_playing = " + trackui2.is_playing);
	if ((!trackui.is_playing && !trackui2.is_playing) || (trackui.is_playing && trackui2.is_playing)) {
     		document.getElementById ("play-pitchshifter").click();
                document.getElementById ("play-pitchshifter2").click();
                console.log("hit both trackui");
	}
        else if (!trackui.is_playing && trackui2.is_playing) {
                document.getElementById("play-pitchshifter2").click();
                console.log("stop trackui2");
	}
        else{
		document.getElementById ("play-pitchshifter").click();
                console.log("stop trackui1");
	}
        updatePlayallButton(); 
     	console.log ("Play all");	
});

function updatePlayallButton () {
        var fileInput = $("#audio-file").val();
        var fileInput2 = $("#audio-file2").val();


        
        if (fileInput == "" && fileInput2 == "") {
             $("#play-all").removeClass ("beginTuning");
             $("#play-all").addClass ("disabled");   
        }
        else {
             $("#play-all").removeClass ("disabled");
             $("#play-all").addClass ("beginTuning");
        }
        
        var bool = (trackui.is_playing || trackui2.is_playing);
        if (bool) {
             $("#play-all").html ("pause");
        }
        else {
             $("#play-all").html ("play");
        }
}


function updateSyncButton () {
        var fileInput = $("#audio-file").val();
        var fileInput2 = $("#audio-file2").val();


        if (fileInput == "" || fileInput2 == "") {
             $("#sync-together").removeClass ("beginTuning");
             $("#sync-together").addClass ("disabled");   
        }
        else {
             $("#sync-together").removeClass ("disabled");
             $("#sync-together").addClass ("beginTuning");
        }
}
