
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
			peak: 10
		});
		this.ringModulator = new Pizzicato.Effects.RingModulator({
			mix: 0.0,
			speed: 30,
			distortion: 1
		});
	}
}
