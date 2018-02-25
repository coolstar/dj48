Pizzicato.context = trackui.track.audioCtx;

var slider = document.getElementById("myGain");
var output = document.getElementById("Gain");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = this.value;
}

var distortion = new Pizzicato.Effects.Distortion({
});	

function addDistortion() {
	var gainValue = parseFloat(output.innerHTML);
	distortion.gain = gainValue;
	console.log(gainValue);
	console.log(distortion.gain);
	sound.addEffect(distortion);
}

function removeDistortion() {
	sound.removeEffect(distortion);
}
