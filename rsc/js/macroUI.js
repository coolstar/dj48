var recordingMacro = false;
$("#macroUpload").on("click", function(e){
	alert("Please open the Web Inspector and paste the file in for now.");
});
$("#macroRecord").on("click", function(e){
	if (!recordingMacro){
		var name = prompt("Please enter the macro name");
		if (name != null){
			macros.recordNewMacro(name);
			$("#macroRecordImg").attr("src","rsc/img/icon-stop.png");
			recordingMacro = true;
		}
	} else {
		macros.stopCurrentRecording();
		$("#macroRecordImg").attr("src","rsc/img/icon-record.png");
	}
});
$("#macroPlay").on("click", function(e){
	var name = prompt("Please enter the macro name");
	if (name != null){
		macros.playMacro(name);
	}
});