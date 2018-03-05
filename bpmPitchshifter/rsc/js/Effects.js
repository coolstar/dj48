
class Effects {
	constructor (audioCtx) {
		Pizzicato.context = audioCtx;
		this.distortion = new Pizzicato.Effects.Distortion({
			gain: 0.0
		});	
		this.delay = new Pizzicato.Effects.Delay({
			mix:  0.0,
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
			lowGain: 0.6,
   	 		midLowGain: 0.8,
    			midHighGain: 0.5,
    			highGain: 0.6,
   			 mix: 1.0
			});
	}
}
