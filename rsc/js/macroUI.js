var recordingMacro = false;
$("#macroUpload").on("click", function(e){
	document.getElementById("macroEditor").style.display = "";
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

var editor = ace.edit("editor");
 editor.setTheme("ace/theme/twilight");
 editor.session.setMode("ace/mode/javascript");

 $("#acceptMacro").on("click", function(){
	var editorJS = editor.getValue();
	try {
		eval(editorJS);
		editor.setValue("");
		document.getElementById("macroEditor").style.display = "none";
	} catch (err) {
		alert("Error: "+err);
	}
 });
 $("#closeMacroEditor").on("click", function(){
 	editor.setValue("");
	document.getElementById("macroEditor").style.display = "none";
 });