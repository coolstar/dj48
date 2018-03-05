class Effects {
	constructor (audioCtx) {
		Pizzicato.context = audioCtx;
		this.delay = new Pizzicato.Effects.Delay({
			mix: 0.0,
			feedback: 0.6,
			time: 0.4
		});
		this.PPdelay = new Pizzicato.Effects.PingPongDelay({
			mix: 0.0,
			feedback: 0.6,
			time: 0.4
		});
		this.dDelay = new Pizzicato.Effects.DubDelay({
            mix:  0.0,
            feedback: 0.6,
            time: 0.4,
			cutoff: 700
        });
		this.distortion = new Pizzicato.Effects.Distortion({
			gain: 0.0
		});	
		this.quad = new Pizzicato.Effects.Quadrafuzz({
			lowGain: 0.6,
   	 		midLowGain: 0.8,
			midHighGain: 0.5,
			highGain: 0.6,
			mix: 1.0
		});
		this.flanger = new Pizzicato.Effects.Flanger({
			mix:  0.0,
			feedback: 0.1,
			time: 0.45,
			depth: .1,
			speed: .2
		});
		this.compressor = new Pizzicato.Effects.Compressor({
			threshold: -24,
			knee: 30,
			attack: 0.003,
			release: 0.025,
			ratio: 12,
			mix: 0.0
		});
		this.lowPassFilter = new Pizzicato.Effects.LowPassFilter({
			mix: 0.0,
			frequency: 22050,
			peak: 1
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
