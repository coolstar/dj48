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

document.getElementById('buttonFile').addEventListener('click', openDialog);
function openDialog() {
 document.getElementById('audio-file').click();
}

document.getElementById('buttonFile2').addEventListener('click', openDialog2);
function openDialog2() {
 document.getElementById('audio-file2').click();
}

class TrackUI {
    constructor(visualizerSelector, visualSelectIdentifier, currentTimeSliderSelector, playSliderSelector, 
        volumeSliderSelector, playButtonSelector, fileInputSelector,
        timingSelector, loadingSelector, totalTimeSelector, progressSelector, pitchSliderSelector, 
        tempoSliderSelector, maintainTempoSelector, semitonesSelector, saveOutputSelector, bpmLabelSelector, recordingslistSelector,
		delayMixSliderSelector, delayFeedbackSliderSelector, delayTimeSliderSelector,
		PPdelayMixSliderSelector, PPdelayFeedbackSliderSelector, PPdelayTimeSliderSelector,
		dDelayMixSliderSelector, dDelayFeedbackSliderSelector, dDelayTimeSliderSelector, dDelayCutoffSliderSelector,
		distortionGainSliderSelector,
		quadMixSliderSelector, quadLGainSliderSelector, quadMLGainSliderSelector, quadMHGainSliderSelector, quadHGainSliderSelector,
		flangerMixSliderSelector, flangerFeedbackSliderSelector, flangerTimeSliderSelector, flangerDepthSliderSelector, flangerSpeedSliderSelector,
		compressorThresholdSliderSelector, compressorKneeSliderSelector, compressorAttackSliderSelector, compressorReleaseSliderSelector, compressorRatioSliderSelector, compressorMixSliderSelector,
		lowPassFilterMixSliderSelector, lowPassFilterFrequencySliderSelector, lowPassFilterPeakSliderSelector,
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
                $(playButtonSelector).html("&#10074;&#10074;");
                that.is_playing = true;
                if ($(saveOutputSelector).prop("checked") == true){
                    track.recorder = new Recorder(delayNode, {workerPath: "lib/recorder/recorderWorkerMP3.js"});
                    track.recorder && track.recorder.record();
                    __log('Started recording.');
                }
            } else {
                track.pause();
                $(playButtonSelector).html("&#9658;");
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
            macros.gotButtonClick(playButtonSelector);
        });


        var fileInput = $(fileInputSelector);
        // bufferSource.gain.value = 1;
        // bufferSource.loop = true;
        // bufferSource.connect(oscillatorGain);

        fileInput.on("change", function() {
            
            if (fileInput.val()==""){
		 track.bpm = 0;
                 original_bpm = 0;
                 $(bpmLabelSelector).text(track.bpm);
            }
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
            macros.gotSliderAction(pitchSliderSelector, 100*value);
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
             macros.gotSliderAction(tempoSliderSelector, 100*value);
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
            connect: [true, false],
            orientation: 'horizontal',
            direction: 'ltr',
            tooltips: false
        });

        $(volumeSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(volumeSliderSelector)[0].noUiSlider.get();
            track.gainNode.gain.value = value*2/100.0;
            console.log("value: "+ value/100.0);
            macros.gotSliderAction(volumeSliderSelector, 100*value);
        });
	
		//EFFECTS
	
		// DELAY
		noUiSlider.create($(delayMixSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(delayMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(delayMixSliderSelector)[0].noUiSlider.get();
            track.effects.delay.mix = parseFloat(value);
            console.log("delay mix: " + value);		
            macros.gotSliderAction(delayMixSliderSelector, 100*value);
		});
		
     	noUiSlider.create($(delayFeedbackSliderSelector)[0],{
            start: 0.0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(delayFeedbackSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(delayFeedbackSliderSelector)[0].noUiSlider.get();
            track.effects.delay.feedback = parseFloat(value);
            console.log("delay feedback: " + value);
            macros.gotSliderAction(delayFeedbackSliderSelector, 100*value);
        });
	
		noUiSlider.create($(delayTimeSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 180
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(delayTimeSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(delayTimeSliderSelector)[0].noUiSlider.get();
            track.effects.delay.time = parseFloat(value);
            console.log("delay time: " + value);
            macros.gotSliderAction(delayTimeSliderSelector, 100*value);
        });
		
		// PING-PONG DELAY
		noUiSlider.create($(PPdelayMixSliderSelector)[0],{
			start: 0,
			range: {
				'min': 0,
				'max': 1
			},
			orientation: 'vertical',
			direction: 'rtl',
			tooltips: true
		});	
		   
		$(PPdelayMixSliderSelector)[0].noUiSlider.on("slide", function(){
				var value = $(PPdelayMixSliderSelector)[0].noUiSlider.get();
				track.effects.PPdelay.mix = parseFloat(value);
				console.log("PPdelay mix: " + value);
                macros.gotSliderAction(PPdelayMixSliderSelector, 100*value);
		});
			
		noUiSlider.create($(PPdelayFeedbackSliderSelector)[0],{
			start: 0,
			range: {
				'min': 0,
				'max': 1
			},
			orientation: 'vertical',
			direction: 'rtl',
			tooltips: true
		});
		
		$(PPdelayFeedbackSliderSelector)[0].noUiSlider.on("slide", function(){
			var value = $(PPdelayFeedbackSliderSelector)[0].noUiSlider.get();
			track.effects.PPdelay.feedback = parseFloat(value);
			console.log("PPdelay feedback: " + value);
            macros.gotSliderAction(PPdelayFeedbackSliderSelector, 100*value);
		});

		noUiSlider.create($(PPdelayTimeSliderSelector)[0],{
			start: 0,
			range: {
				'min': 0,
				'max': 180
			},
			orientation: 'vertical',
			direction: 'rtl',
			tooltips: true
		});
		
		$(PPdelayTimeSliderSelector)[0].noUiSlider.on("slide", function(){
			var value = $(PPdelayTimeSliderSelector)[0].noUiSlider.get();
			track.effects.PPdelay.time = parseFloat(value);
			console.log("PPdelay time: " + value);
            macros.gotSliderAction(PPdelayTimeSliderSelector, 100*value);
		});

		// DUB DELAY
		noUiSlider.create($(dDelayMixSliderSelector)[0],{
			start: 0,
			range: {
				'min': 0,
				'max': 1
			},
			orientation: 'vertical',
			direction: 'rtl',
			tooltips: true
		});

		$(dDelayMixSliderSelector)[0].noUiSlider.on("slide", function(){
			var value = $(dDelayMixSliderSelector)[0].noUiSlider.get();
			track.effects.dDelay.mix = parseFloat(value);
			console.log("dDelay mix: " + track.effects.dDelay.mix);
            macros.gotSliderAction(dDelayMixSliderSelector, 100*value);
		});
		
		noUiSlider.create($(dDelayFeedbackSliderSelector)[0],{
			start: 0,
			range: {
				'min': 0,
				'max': 1
			},
			orientation: 'vertical',
			direction: 'rtl',
			tooltips: true
		});
		
		$(dDelayFeedbackSliderSelector)[0].noUiSlider.on("slide", function(){
			var value = $(dDelayFeedbackSliderSelector)[0].noUiSlider.get();
			track.effects.dDelay.feedback = parseFloat(value);
			console.log("dDelay feedback: " + value);
            macros.gotSliderAction(dDelayFeedbackSliderSelector, 100*value);
		});

		noUiSlider.create($(dDelayTimeSliderSelector)[0],{
			start: 0,
			range: {
				'min': 0,
				'max': 180
			},
			orientation: 'vertical',
			direction: 'rtl',
			tooltips: true
		});
		
		$(dDelayTimeSliderSelector)[0].noUiSlider.on("slide", function(){
			var value = $(dDelayTimeSliderSelector)[0].noUiSlider.get();
			track.effects.dDelay.time = parseFloat(value);
			console.log("dDelay time: " + value);
            macros.gotSliderAction(dDelayTimeSliderSelector, 100*value);
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
			track.effects.dDelay.cutoff = parseFloat(value);
			console.log("dDelay time: " + value);
            macros.gotSliderAction(dDelayCutoffSliderSelector, 100*value);
		});
		
		// DISTORTION
        noUiSlider.create($(distortionGainSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(distortionGainSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(distortionGainSliderSelector)[0].noUiSlider.get();
            track.effects.distortion.gain = parseFloat(value);
			console.log("distortion actual gain: " + track.effects.distortion.gain);
            console.log("distortion gain: " + value);
            macros.gotSliderAction(distortionGainSliderSelector, 100*value);
        });

		// QUADRAFUZZ
		noUiSlider.create($(quadMixSliderSelector)[0],{
			start: 0,
			range: {
				'min': 0,
				'max': 1
			},
			orientation: 'vertical',
			direction: 'rtl',
			tooltips: true
		});
		
		$(quadMixSliderSelector)[0].noUiSlider.on("slide", function(){
				var value = $(quadMixSliderSelector)[0].noUiSlider.get();
				track.effects.quad.mix = parseFloat(value);
				console.log("quad mix: " + value);
                macros.gotSliderAction(quadMixSliderSelector, 100*value);
			});

		noUiSlider.create($(quadLGainSliderSelector)[0],{
			start: 0,
			range: {
				'min': 0,
				'max': 1
			},
			orientation: 'vertical',
			direction: 'rtl',
			tooltips: true
		});
		
		$(quadLGainSliderSelector)[0].noUiSlider.on("slide", function(){
			var value = $(quadLGainSliderSelector)[0].noUiSlider.get();
			track.effects.quad.lowGain = parseFloat(value);
			console.log("quad LG: " + value);
            macros.gotSliderAction(quadLGainSliderSelector, 100*value);
		});

		noUiSlider.create($(quadMLGainSliderSelector)[0],{
			start: 0,
			range: {
				'min': 0,
				'max': 1
			},
			orientation: 'vertical',
			direction: 'rtl',
			tooltips: true
		});
		
		$(quadMLGainSliderSelector)[0].noUiSlider.on("slide", function(){
			var value = $(quadMLGainSliderSelector)[0].noUiSlider.get();
			track.effects.quad.midLowGain = parseFloat(value);
			console.log("quad MLG: " + value);
            macros.gotSliderAction(quadMLGainSliderSelector, 100*value);
		});

		noUiSlider.create($(quadMHGainSliderSelector)[0],{
			start: 0,
			range: {
				'min': 0,
				'max': 1
			},
			orientation: 'vertical',
			direction: 'rtl',
			tooltips: true
		});

		 $(quadMHGainSliderSelector)[0].noUiSlider.on("slide", function(){
			var value = $(quadMHGainSliderSelector)[0].noUiSlider.get();
			track.effects.quad.midHighGain = parseFloat(value);
			console.log("quad MHG: " + value);
            macros.gotSliderAction(quadMHGainSliderSelector, 100*value);
		});

		noUiSlider.create($(quadHGainSliderSelector)[0],{
			start: 0,
			range: {
				'min': 0,
				'max': 1
			},
			orientation: 'vertical',
			direction: 'rtl',
			tooltips: true
		});
		
		$(quadHGainSliderSelector)[0].noUiSlider.on("slide", function(){
			var value = $(quadHGainSliderSelector)[0].noUiSlider.get();
			track.effects.quad.highGain = parseFloat(value);
			console.log("quad HG: " + value);
            macros.gotSliderAction(quadHGainSliderSelector, 100*value);
		});

		// FLANGER
		noUiSlider.create($(flangerMixSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

        $(flangerMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(flangerMixSliderSelector)[0].noUiSlider.get();
            track.effects.flanger.mix = parseFloat(value);
            console.log("Flanger mix: " + track.effects.flanger.mix);
            macros.gotSliderAction(flangerMixSliderSelector, 100*value);
		});

		noUiSlider.create($(flangerFeedbackSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(flangerFeedbackSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(flangerFeedbackSliderSelector)[0].noUiSlider.get();
            track.effects.flanger.feedback = parseFloat(value);
            console.log("Flanger Feedback: " + track.effects.flanger.feedback);
            macros.gotSliderAction(flangerFeedbackSliderSelector, 100*value);
		});
		
		noUiSlider.create($(flangerTimeSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(flangerTimeSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(flangerTimeSliderSelector)[0].noUiSlider.get();
            track.effects.flanger.time = parseFloat(value);
            console.log("Flanger time: " + track.effects.flanger.time);
            macros.gotSliderAction(flangerTimeSliderSelector, 100*value);
		});
		
		noUiSlider.create($(flangerDepthSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
		
		$(flangerDepthSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(flangerDepthSliderSelector)[0].noUiSlider.get();
            track.effects.flanger.depth = parseFloat(value);
            console.log("Flanger depth: " + track.effects.flanger.depth);
            macros.gotSliderAction(flangerDepthSliderSelector, 100*value);
		});
		
		noUiSlider.create($(flangerSpeedSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(flangerSpeedSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(flangerSpeedSliderSelector)[0].noUiSlider.get();
            track.effects.flanger.speed = parseFloat(value);
            console.log("Flanger speed: " + track.effects.flanger.speed);
            macros.gotSliderAction(flangerSpeedSliderSelector, 100*value);
		});
		
		// COMPRESSOR
		noUiSlider.create($(compressorThresholdSliderSelector)[0],{
            start: 0,
            range: {
                'min': -100,
                'max': 0
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
		
		$(compressorThresholdSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(compressorThresholdSliderSelector)[0].noUiSlider.get();
            track.effects.compressor.threshold = parseFloat(value);
			console.log("compressor actual threshold: " + track.effects.compressor.threshold);
            console.log("compressor slider threshold: " + value);
            macros.gotSliderAction(compressorThresholdSliderSelector, 100*value);
        });
		
		noUiSlider.create($(compressorKneeSliderSelector)[0],{
            start: 40,
            range: {
                'min': 0,
                'max': 40
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
	
		$(compressorKneeSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(compressorKneeSliderSelector)[0].noUiSlider.get();
            track.effects.compressor.knee = parseFloat(value);
			console.log("compressor actual knee: " + track.effects.compressor.knee);
            console.log("compressor slider knee: " + value);
            macros.gotSliderAction(compressorKneeSliderSelector, 100*value);
        });
		
		noUiSlider.create($(compressorAttackSliderSelector)[0],{
            start: 0.003,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(compressorAttackSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(compressorAttackSliderSelector)[0].noUiSlider.get();
            track.effects.compressor.attack = parseFloat(value);
			console.log("compressor actual attack: " + track.effects.compressor.attack);
            console.log("compressor slider attack: " + value);
            macros.gotSliderAction(compressorAttackSliderSelector, 100*value);
        });
		
		noUiSlider.create($(compressorReleaseSliderSelector)[0],{
            start: 0.025,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(compressorReleaseSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(compressorReleaseSliderSelector)[0].noUiSlider.get();
            track.effects.compressor.release = parseFloat(value);
			console.log("compressor actual release: " + track.effects.compressor.release);
            console.log("compressor slider release: " + value);
            macros.gotSliderAction(compressorReleaseSliderSelector, 100*value);
        });
		
		noUiSlider.create($(compressorRatioSliderSelector)[0],{
            start: 1,
            range: {
                'min': 1,
                'max': 20
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(compressorRatioSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(compressorRatioSliderSelector)[0].noUiSlider.get();
            track.effects.compressor.ratio = parseFloat(value);
			console.log("compressor actual ratio: " + track.effects.compressor.ratio);
            console.log("compressor slider ratio: " + value);
            macros.gotSliderAction(compressorRatioSliderSelector, 100*value);
        });
		
		noUiSlider.create($(compressorMixSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
        		
		$(compressorMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(compressorMixSliderSelector)[0].noUiSlider.get();
            track.effects.compressor.mix = parseFloat(value);
			console.log("compressor actual mix: " + track.effects.compressor.mix);
            console.log("compressor slider mix: " + value);
            macros.gotSliderAction(compressorMixSliderSelector, 100*value);
        });
		
		// LOW-PASS FILTER
		noUiSlider.create($(lowPassFilterMixSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
		
		$(lowPassFilterMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(lowPassFilterMixSliderSelector)[0].noUiSlider.get();
            track.effects.lowPassFilter.mix = parseFloat(value);
			console.log("lowPassFilter actual mix: " + track.effects.lowPassFilter.mix);
            console.log("lowPassFilter slider mix: " + value);
            macros.gotSliderAction(lowPassFilterMixSliderSelector, 100*value);
		});
		
		noUiSlider.create($(lowPassFilterFrequencySliderSelector)[0],{
            start: 22050,
            range: {
                'min': 10,
                'max': 22050
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });
		
		$(lowPassFilterFrequencySliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(lowPassFilterFrequencySliderSelector)[0].noUiSlider.get();
            track.effects.lowPassFilter.frequency = parseFloat(value);
			console.log("lowPassFilter actual frequency: " + track.effects.lowPassFilter.frequency);
            console.log("lowPassFilter frequency: " + value);
            macros.gotSliderAction(lowPassFilterFrequencySliderSelector, 100*value);
		});
		
		noUiSlider.create($(lowPassFilterPeakSliderSelector)[0],{
            start: 1,
            range: {
                'min': 0,
                'max': 1000
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(lowPassFilterPeakSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(lowPassFilterPeakSliderSelector)[0].noUiSlider.get();
            track.effects.lowPassFilter.peak = parseFloat(value);
			console.log("lowPassFilter actual peak: " + track.effects.lowPassFilter.peak);
            console.log("lowPassFilter slider peak: " + value);
            macros.gotSliderAction(lowPassFilterPeakSliderSelector, 100*value);
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
            console.log("highPassFilter slider mix: " + value);
            macros.gotSliderAction(highPassFilterMixSliderSelector, 100*value);
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
            console.log("highPassFilter frequency: " + value);
            macros.gotSliderAction(highPassFilterFrequencySliderSelector, 100*value);
		});
		
		noUiSlider.create($(highPassFilterPeakSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1000
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(highPassFilterPeakSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(highPassFilterPeakSliderSelector)[0].noUiSlider.get();
            track.effects.highPassFilter.peak = parseFloat(value);
            console.log("highPassFilter peak: " + value);
            macros.gotSliderAction(highPassFilterPeakSliderSelector, 100*value);
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
            console.log("stereoPanner slider pan: " + value);
            macros.gotSliderAction(stereoPannerPanSliderSelector, 100*value);
        });
		
		// REVERB
		noUiSlider.create($(reverbTimeSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
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
            console.log("reverb slider time: " + value);
            macros.gotSliderAction(reverbTimeSliderSelector, 100*value);	
		});
		
		noUiSlider.create($(reverbDecaySliderSelector)[0],{
            start: 0,
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
            console.log("reverb slider decay: " + value);
            macros.gotSliderAction(reverbDecaySliderSelector, 100*value);
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
            macros.gotSliderAction(reverbMixSliderSelector, 100*value);	
		});
			
		// RING MODULATOR
		noUiSlider.create($(ringModulatorMixSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 1
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(ringModulatorMixSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(ringModulatorMixSliderSelector)[0].noUiSlider.get();
            track.effects.ringModulator.mix = parseFloat(value);
			console.log("ringModulator actual mix: " + track.effects.ringModulator.mix);
            console.log("ringModulator slider mix: " + value);
            macros.gotSliderAction(ringModulatorMixSliderSelector, 100*value);	
		});
		
		noUiSlider.create($(ringModulatorSpeedSliderSelector)[0],{
            start: 0,
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
            console.log("ringModulator speed: " + value);
            macros.gotSliderAction(ringModulatorSpeedSliderSelector, 100*value);
		});
		
		noUiSlider.create($(ringModulatorDistortionSliderSelector)[0],{
            start: 0,
            range: {
                'min': 0,
                'max': 50
            },
            orientation: 'vertical',
            direction: 'rtl',
            tooltips: true
        });

		$(ringModulatorDistortionSliderSelector)[0].noUiSlider.on("slide", function(){
            var value = $(ringModulatorDistortionSliderSelector)[0].noUiSlider.get();
            track.effects.ringModulator.distortion = parseFloat(value);
            console.log("ringModulator distortion: " + value);
            macros.gotSliderAction(ringModulatorDistortionSliderSelector, 100*value);
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
            macros.gotSliderAction(tremoloMixSliderSelector, 100*value);	
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
            macros.gotSliderAction(tremoloSpeedSliderSelector, 100*value);
		});
		
		noUiSlider.create($(tremoloDepthSliderSelector)[0],{
            start: 0,
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
            console.log("tremolo slider speed: " + value);
            macros.gotSliderAction(tremoloDepthSliderSelector, 100*value);
		});

		// PLAY
        noUiSlider.create($(playSliderSelector)[0],{
            connect: [true, false],
            start: 0,
            range: {
                'min': 0,
                'max': 100
            },
            
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
           macros.gotSliderAction(playSliderSelector, 100*value);
        });
	}
}

var trackui = new TrackUI('.visualizer', "visual", "#current-time", "#play-slider", "#volume-slider",
 "#play-pitchshifter", "#audio-file", ".timing",
 ".loading", "#total-time", "#progress", "#pitch-slider",
 "#tempo-slider", "#maintain-tempo", "#semitones", "#save-output", "#bpm-label", "recordingslist", "#delayMix-slider", "#delayFeedback-slider", "#delayTime-slider",
 "#PPdelayMix-slider", "#PPdelayFeedback-slider", "#PPdelayTime-slider",
 "#dDelayMix-slider", "#dDelayFeedback-slider", "#dDelayTime-slider", "#dDelayCutoff-slider",
 "#distortionGain-slider", 
 "#quadMix-slider", "#quadLGain-slider", "#quadMLGain-slider", "#quadMHGain-slider", "#quadHGain-slider",
 "#flangerMix-slider","#flangerFeedback-slider", "#flangerTime-slider","#flangerDepth-slider","#flangerSpeed-slider",
 "#compressorThreshold-slider", "#compressorKnee-slider", "#compressorAttack-slider", "#compressorRelease-slider", "#compressorRatio-slider", "#compressorMix-slider",
 "#lowPassFilterMix-slider", "#lowPassFilterFrequency-slider", "#lowPassFilterPeak-slider",
 "#highPassFilterMix-slider", "#highPassFilterFrequency-slider", "#highPassFilterPeak-slider",
 "#stereoPannerPan-slider",
 "#reverbTime-slider", "#reverbDecay-slider", "#reverbMix-slider",
 "#ringModulatorMix-slider", "#ringModulatorSpeed-slider", "#ringModulatorDistortion-slider",
 "#tremoloMix-slider", "#tremoloSpeed-slider", "#tremoloDepth-slider"
);

var trackui2 = new TrackUI('.visualizer2', "visual2", "#current-time2", "#play-slider2", "#volume-slider2",
 "#play-pitchshifter2", "#audio-file2", ".timing2",
 ".loading2", "#total-time2", "#progress2", "#pitch-slider2",
 "#tempo-slider2", "#maintain-tempo2", "#semitones2", "#save-output2", "#bpm-label2", "recordingslist2", "#delayMix-slider2", "#delayFeedback-slider2", "#delayTime-slider2",
 "#PPdelayMix-slider2", "#PPdelayFeedback-slider2", "#PPdelayTime-slider2", 
 "#dDelayMix-slider2", "#dDelayFeedback-slider2", "#dDelayTime-slider2", "#dDelayCutoff-slider2", 
 "#distortionGain-slider2", 
 "#quadMix-slider2", "#quadLGain-slider2", "#quadMLGain-slider2", "#quadMHGain-slider2", "#quadHGain-slider2",
 "#flangerMix-slider2", "#flangerFeedback-slider2", "#flangerTime-slider2", "#flangerDepth-slider2","#flangerSpeed-slider2",
 "#compressorThreshold-slider2", "#compressorKnee-slider2", "#compressorAttack-slider2", "#compressorRelease-slider2", "#compressorRatio-slider2", "#compressorMix-slider2",
 "#lowPassFilterMix-slider2", "#lowPassFilterFrequency-slider2", "#lowPassFilterPeak-slider2",
 "#highPassFilterMix-slider2", "#highPassFilterFrequency-slider2","#highPassFilterPeak-slider2",
 "#stereoPannerPan-slider2",
 "#reverbTime-slider2", "#reverbDecay-slider2", "#reverbMix-slider2",
 "#ringModulatorMix-slider2", "#ringModulatorSpeed-slider2", "#ringModulatorDistortion-slider2",
 "#tremoloMix-slider2", "#tremoloSpeed-slider2", "#tremoloDepth-slider2"
);

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
             $("#play-all").html ("&#10074;&#10074;");
        }
        else {
             $("#play-all").html ("&#9658;");
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
