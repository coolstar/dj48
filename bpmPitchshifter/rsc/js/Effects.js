
class Effects {
	constructor (audioCtx) {
		Pizzicato.context = audioCtx;
		this.distortion = new Pizzicato.Effects.Distortion({
			gain: 0.0
		});	
		this.delay = new Pizzicato.Effects.Delay({
			mix: 0.0,
			feedback: 0.6,
			time: 0.4
		});
		this.highPassFilter = new Pizzicato.Effects.HighPassFilter({
			mix: 0.0,
			frequency: 10,
			peak: 1
		});
		this.stereoPanner = new Pizzicato.Effects.StereoPanner({
			pan: 0
		});
		this.reverb = new Pizzicato.Effects.Reverb({
			time: 0.01,
			decay: 0.01,
			reverse: false,
			mix: 0.0
		});
		this.ringModulator = new Pizzicato.Effects.RingModulator({
			mix: 0.0,
			speed: 30,
			distortion: 1
		});
		this.tremolo = new Pizzicato.Effects.Tremolo({
			mix: 0.0,
			speed: 4,
			depth: 1
		});
	}
}
