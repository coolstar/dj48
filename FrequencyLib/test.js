// grab the mute button to use below

//var mute = document.querySelector('.mute');

/*voiceSelect.onchange = function() {
 voiceChange();
 };
 
 mute.onclick = voiceMute;
 
 function voiceMute() {
 if(mute.id === "") {
 gainNode.gain.value = 0;
 mute.id = "activated";
 mute.innerHTML = "Unmute";
 } else {
 gainNode.gain.value = 1;
 mute.id = "";
 mute.innerHTML = "Mute";
 }
 }*/


//main block for doing the audio recording

/*if (navigator.getUserMedia) {
 console.log('getUserMedia supported.');
 navigator.getUserMedia (
 // constraints - only audio needed for this app
 {
 audio: true
 },
 
 // Success callback
 function(stream) {
 source = audioCtx.createMediaStreamSource(stream);
 source.connect(analyser);
 analyser.connect(distortion);
 distortion.connect(biquadFilter);
 biquadFilter.connect(convolver);
 convolver.connect(gainNode);
 gainNode.connect(audioCtx.destination);
 
 visualize();
 //voiceChange();
 
 },
 
 // Error callback
 function(err) {
 console.log('The following gUM error occured: ' + err);
 }
 );
 } else {
 console.log('getUserMedia not supported on your browser!');
 }*/



/*
 function voiceChange() {
 
 distortion.oversample = '4x';
 biquadFilter.gain.value = 0;
 convolver.buffer = undefined;
 
 var voiceSetting = voiceSelect.value;
 console.log(voiceSetting);
 
 if(voiceSetting == "distortion") {
 distortion.curve = makeDistortionCurve(400);
 } else if(voiceSetting == "convolver") {
 convolver.buffer = concertHallBuffer;
 } else if(voiceSetting == "biquad") {
 biquadFilter.type = "lowshelf";
 biquadFilter.frequency.value = 1000;
 biquadFilter.gain.value = 25;
 } else if(voiceSetting == "off") {
 console.log("Voice settings turned off");
 }
 
 }*/



// distortion curve for the waveshaper, thanks to Kevin Ennis
// http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
/*
 function makeDistortionCurve(amount) {
 var k = typeof amount === 'number' ? amount : 50,
 n_samples = 44100,
 curve = new Float32Array(n_samples),
 deg = Math.PI / 180,
 i = 0,
 x;
 for ( ; i < n_samples; ++i ) {
 x = i * 2 / n_samples - 1;
 curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
 }
 return curve;
 };*/
