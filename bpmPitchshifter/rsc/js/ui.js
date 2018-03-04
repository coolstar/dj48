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
        distortionSliderSelector,
		delayMixSliderSelector, delayFeedbackSliderSelector, delayTimeSliderSelector,
		highPassFilterMixSliderSelector, highPassFilterFrequencySliderSelector, highPassFilterPeakSliderSelector,
		stereoPannerPanSliderSelector,
		reverbTimeSliderSelector, reverbDecaySliderSelector, reverbMixSliderSelector,
		ringModulatorMixSliderSelector, ringModulatorSpeedSliderSelector, ringModulatorDistortionSliderSelector,
		tremoloMixSliderSelector, tremoloSpeedSliderSelector, tremoloDepthSliderSelector
		){

        this.track = new Track();

        var track = this.track;
        var original_bpm = 0;
	track.spectrogram.canvas = document.querySelector(visualizerSelector);
        track.spectrogram.visualSelect = document.getElementById(visualSelectIdentifier);

        track.currentTimeSlider = $(currentTimeSliderSelector);
        track.playSlider = $(playSliderSelector)[0];

        track.initialize();

        $(playButtonSelector).click(function(e){
            if (fileInput.val()==""){
                //alert("Please choose a file to play");
		console.log ("No file selected");
            } else if ($(this).hasClass("disabled")) {
                // alert("Currently loading audio, please wait a few seconds...");
            } else if (is_playing == false){
                track.play();
                $(playButtonSelector).html("pause");
                is_playing = true;
                if ($(saveOutputSelector).prop("checked") == true){
                    track.recorder = new Recorder(track.gainNode, {workerPath: "lib/recorder/recorderWorkerMP3.js"});
                    track.recorder && track.recorder.record();
                    __log('Started recording.');
                }
            } else {

                track.pause();
                $(playButtonSelector).html( "play");
                is_playing = false;
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
        });

    /*
        $(pauseButtonSelector).click(function (e){
            track.pause();
            is_playing = false;
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
                  //ga('send', 'event', 'Pitch shift download', "Download Added");
                });
                
                track.recorder && track.recorder.clear();
            }
        }); */

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

		// DISTORTION
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
        		
		$(distortionSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(distortionSliderSelector)[0].noUiSlider.get();
            track.effects.distortion.gain = value/100.0;
			console.log("distortion actual gain: " + track.effects.distortion.gain);
            console.log("distortion gain: "+ value/100.0);
        });

		// DELAY
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
            track.effects.delay.time = parseFloat(value);
            console.log("delay time: "+ value);
        });
		
		// HIGH-PASS FILTER
		noUiSlider.create($(highPassFilterMixSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
		
		$(highPassFilterMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(highPassFilterMixSliderSelector)[0].noUiSlider.get();
            track.effects.highPassFilter.mix = parseFloat(value);
			console.log("highPassFilter actual mix: " + track.effects.highPassFilter.mix);
            console.log("highPassFilter slider mix: "+ value);		
		});
		
		noUiSlider.create($(highPassFilterFrequencySliderSelector)[0],{
            start: 10,
            range: {
                'min': 10,
                'max': 22050
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
		
		$(highPassFilterFrequencySliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(highPassFilterFrequencySliderSelector)[0].noUiSlider.get();
            track.effects.highPassFilter.frequency = parseFloat(value);
			console.log("highPassFilter actual frequency: " + track.effects.highPassFilter.frequency);
            console.log("highPassFilter frequency: "+ value);		
		});
		
		noUiSlider.create($(highPassFilterPeakSliderSelector)[0],{
            start: 1,
            range: {
                'min': 0.0001,
                'max': 1000
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(highPassFilterPeakSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(highPassFilterPeakSliderSelector)[0].noUiSlider.get();
            track.effects.highPassFilter.peak = parseFloat(value);
            console.log("highPassFilter peak: "+ value);		
		});
		
		// STEREO PANNER
		noUiSlider.create($(stereoPannerPanSliderSelector)[0],{
            start: 0,
            range: {
                'min': -1,
                'max': 1
            },
            orientation: 'horizontal',
            direction: 'ltr',
            tooltips: true
        });
        		
		$(stereoPannerPanSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(stereoPannerPanSliderSelector)[0].noUiSlider.get();
            track.effects.stereoPanner.pan = parseFloat(value);
			console.log("stereoPanner actual pan: " + track.effects.stereoPanner.pan);
            console.log("stereoPanner slider pan: "+ value);
        });
		
		// REVERB
		noUiSlider.create($(reverbTimeSliderSelector)[0],{
            start: 0.01,
            range: {
                'min': 0.0001,
                'max': 10
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
		
		$(reverbTimeSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(reverbTimeSliderSelector)[0].noUiSlider.get();
            track.effects.reverb.time = parseFloat(value);
			console.log("reverb actual time: " + track.effects.reverb.time);
            console.log("reverb slider time: "+ value);		
		});
		
		noUiSlider.create($(reverbDecaySliderSelector)[0],{
            start: 0.01,
            range: {
                'min': 0,
                'max': 10
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
		
		$(reverbDecaySliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(reverbDecaySliderSelector)[0].noUiSlider.get();
            track.effects.reverb.decay = parseFloat(value);
			console.log("reverb actual decay: " + track.effects.reverb.decay);
            console.log("reverb slider decay: "+ value);		
		});
		
		noUiSlider.create($(reverbMixSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
			},
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
		
		$(reverbMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(reverbMixSliderSelector)[0].noUiSlider.get();
            track.effects.reverb.mix = parseFloat(value);
			console.log("reverb actual mix: " + track.effects.reverb.mix);
            console.log("reverb slider mix: " + value);		
		});
			
		// RING MODULATOR
		noUiSlider.create($(ringModulatorMixSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 100
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(ringModulatorMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(ringModulatorMixSliderSelector)[0].noUiSlider.get();
            track.effects.ringModulator.mix = value/100.0;
			console.log("ringModulator actual mix: " + track.effects.ringModulator.mix);
            console.log("ringModulator mix: "+ value/100.0);		
		});
		
		noUiSlider.create($(ringModulatorSpeedSliderSelector)[0],{
            start: 30,
            range: {
                'min': 0,
                'max': 2000
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(ringModulatorSpeedSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(ringModulatorSpeedSliderSelector)[0].noUiSlider.get();
            track.effects.ringModulator.speed = parseFloat(value);
            console.log("ringModulator speed: "+ value);		
		});
		
		noUiSlider.create($(ringModulatorDistortionSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0.2,
                'max': 50
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(ringModulatorDistortionSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(ringModulatorDistortionSliderSelector)[0].noUiSlider.get();
            track.effects.ringModulator.distortion = parseFloat(value);
            console.log("ringModulator distortion: "+ value);		
		});
		
		// TREMOLO
		noUiSlider.create($(tremoloMixSliderSelector)[0],{
            start: 0.0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(tremoloMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(tremoloMixSliderSelector)[0].noUiSlider.get();
            track.effects.tremolo.mix = parseFloat(value);
			console.log("tremolo actual mix: " + track.effects.tremolo.mix);
            console.log("tremolo slider mix: " + value);		
		});
		
		noUiSlider.create($(tremoloSpeedSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 20
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(tremoloSpeedSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(tremoloSpeedSliderSelector)[0].noUiSlider.get();
            track.effects.tremolo.speed = parseFloat(value);
			console.log("tremolo actual speed: " + track.effects.tremolo.speed);
            console.log("tremolo slider speed: " + value);		
		});
		
		noUiSlider.create($(tremoloDepthSliderSelector)[0],{
            start: 1,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(tremoloDepthSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(tremoloDepthSliderSelector)[0].noUiSlider.get();
            track.effects.tremolo.depth = parseFloat(value);
			console.log("tremolo actual depth: " + track.effects.tremolo.depth);
            console.log("tremolo slider depth: " + value);		
		});
		
		// PLAY
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

var trackui = new TrackUI('.visualizer', "visual", "#current-time", "#play-slider", "#volume-slider",
 "#play-pitchshifter", "#audio-file", ".timing",
 ".loading", "#total-time", "#progress", ".pitch-slider",
 ".tempo-slider", "#maintain-tempo", "#semitones", "#save-output", "#bpm-label", "recordingslist", "#distortion-slider", "#delayMix-slider", "#delayFeedback-slider", "#delayTime-slider",
 "#highPassFilterMix-slider", "#highPassFilterFrequency-slider", "#highPassFilterPeak-slider",
 "#stereoPannerPan-slider",
 "#reverbTime-slider", "#reverbDecay-slider", "#reverbMix-slider",
 "#ringModulatorMix-slider", "#ringModulatorSpeed-slider", "#ringModulatorDistortion-slider",
 "#tremoloMix-slider", "#tremoloSpeed-slider", "#tremoloDepth-slider"
);

var trackui2 = new TrackUI('.visualizer2', "visual2", "#current-time2", "#play-slider2", "#volume-slider2",
 "#play-pitchshifter2", "#audio-file2", ".timing2",
 ".loading2", "#total-time2", "#progress2", ".pitch-slider2",
 ".tempo-slider2", "#maintain-tempo2", "#semitones2", "#save-output2", "#bpm-label2", "recordingslist2", "#distortion-slider2", "#delayMix-slider2", "#delayFeedback-slider2", "#delayTime-slider2",
 "#highPassFilterMix-slider2", "#highPassFilterFrequency-slider2","#highPassFilterPeak-slider2",
 "#stereoPannerPan-slider2",
 "#reverbTime-slider2", "#reverbDecay-slider2", "#reverbMix-slider2",
 "#ringModulatorMix-slider2", "#ringModulatorSpeed-slider2", "#ringModulatorDistortion-slider2",
 "#tremoloMix-slider2", "#tremoloSpeed-slider2", "#tremoloDepth-slider2"
 );

$("#sync-together").click (function (e) {
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

	document.getElementById ("play-pitchshifter2").click();
     	document.getElementById ("play-pitchshifter").click();
	//document.getElementById ("play-pitchshifter2").click();
     	console.log ("Play all");	
});
