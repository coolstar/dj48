
class Effects {
	constructor (audioCtx) {
		Pizzicato.context = audioCtx;
		this.distortion = new Pizzicato.Effects.Distortion({
			gain: 0.0
		});	
	}
}