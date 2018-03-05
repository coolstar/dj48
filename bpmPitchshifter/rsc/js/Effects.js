
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
		this.quad = new Pizzicato.Effects.Quadrafuzz({
			lowGain: 0.0,
   	 		midLowGain: 0.0,
			midHighGain: 0.0,
    		highGain: 0.0,
   			mix: 0.0
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
