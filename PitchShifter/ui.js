$("#play-pitchshifter").click(function(e){
    if (fileInput.val()==""){
        alert("Please choose a file to play");
    } else if ($(this).hasClass("disabled")) {
    	// alert("Currently loading audio, please wait a few seconds...");
    } else{
        track.play();
        is_playing = true;
        if ($("#save-output").prop("checked") == true){
            recorder = new Recorder(node, {workerPath: 'recorderWorkerMP3.js'});
            startRecording();
        }
    }
});

$("#pause-pitchshifter").click(function(e){
    track.pause();
    is_playing = false;
});

function minsSecs(secs){
    mins = Math.floor(secs / 60);
    seconds = secs - mins * 60;
    return mins + ":" + pad(parseInt(seconds),2);
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
		

var fileInput = $("#audio-file");
// bufferSource.gain.value = 1;
// bufferSource.loop = true;
// bufferSource.connect(oscillatorGain);

fileInput.on("change", function() {

    $(".timing").hide();
    $("#loading").show();
    $("#play-pitchshifter").addClass("disabled");

    if (is_playing) pause();
    var reader = new FileReader();
    reader.onload = function(ev) {
        context.decodeAudioData(ev.target.result, function(theBuffer){
            track.pause();
            //ga('send', 'event', 'File Upload', "Success");

            buffer = theBuffer;
            bufferDuration = theBuffer.duration;
            $("#play-pitchshifter").removeClass("disabled");

            $("#total-time").html(minsSecs(bufferDuration));

            $("#progress").width("0%");
            $("#current-time").html("0:00");


            st = new SoundTouch();
            st.pitch = ($(".pitch-slider")[0].noUiSlider.get() / 100);
            st.tempo = !$("#maintain-tempo").prop("checked") ? ($(".pitch-slider")[0].noUiSlider.get() / 100) : 1;



           f = new SimpleFilter(source, st);
           var BUFFER_SIZE = 2048;

            var node = context.createScriptProcessor ? context.createScriptProcessor(BUFFER_SIZE, 2, 2) : context.createJavaScriptNode(BUFFER_SIZE, 2, 2);

            var samples = new Float32Array(BUFFER_SIZE * 2);

            var pos = 0;

            f.sourcePosition = 0;

            $("#play-pitchshifter").addClass("beginTuning");
            $(".timing").show();
            $("#loading").hide();
        }, function(){ //error function
        	$("#loading").html("Sorry, we could not process this audio file.");
        	//ga('send', 'event', 'File Upload', "Failure");
        })
    };
    reader.readAsArrayBuffer(this.files[0]);
});


noUiSlider.create($(".pitch-slider")[0],{
    start: 100,
    range: {
        'min': 50,
        'max': 150
    },
});

twelth_root = 1.05946309436;
st.pitch = 1;

$(".pitch-slider")[0].noUiSlider.on("slide", function(){
    var value = $(".pitch-slider")[0].noUiSlider.get();
    st.pitch = (value / 100);
    st.tempo = 1;
    var pitch = Math.pow(twelth_root, parseFloat(value)) 
    var pitchFormatted = (100 * pitch).toFixed(2);
    // console.log($(this).val() / 100);
    // $("#semitones").val(parseFloat(($(this).val() / 100 - 1) / 0.05946309436).toFixed(2));
    $("#semitones").val(Math.log(value / 100)/Math.log(twelth_root));
    $("#pitch-shift-value").html(value);


});

noUiSlider.create($(".tempo-slider")[0],{
    start: 100,
    range: {
        'min': 25,
        'max': 400
    }
});

st.tempo = 1;

$(".tempo-slider")[0].noUiSlider.on("slide", function(){
    var value = $(".tempo-slider")[0].noUiSlider.get();
    st.tempo = (value / 100);
    $("#tempo-shift-value").html(value);
});


$(".pitch-slider")[0].noUiSlider.on("change", function(){
	//ga('send', 'event', 'Pitch shift', "Slider", $(this).val());
})

$("#semitones").change(function(){

	//ga('send', 'event', 'Pitch shift', "Semitone", $(this).val());


    if ($(this).val() <= 12 && $(this).val() >= - 12){

    // $(".pitch-slider").val(100.0 + 1*parseFloat(( parseFloat($(this).val())) * parseFloat(twelth_root-1) * 100).toFixed(2));
    // $("#pitch-shift-value").html((100.0 + 1*parseFloat($(this).val() * parseFloat(twelth_root-1) * 100)).toFixed(2));


    // console.log(100 + (1+ parseFloat($(this).val()) * parseFloat(twelth_root-1) * 100));
    // st.pitch = st.pitch + parseFloat($(this).val()) * parseFloat(twelth_root-1);
    // st.pitch = (1+ parseFloat($(this).val()) * parseFloat(twelth_root-1));

    var pitch = Math.pow(twelth_root, parseFloat($(this).val())) 
    var pitchFormatted = (100 * pitch).toFixed(2);

    st.pitch = pitch;

    $(".pitch-slider")[0].noUiSlider.set(pitchFormatted);
    $("#pitch-shift-value").html(pitchFormatted);

    st.tempo = !$("#maintain-tempo").prop("checked") ? ($(".pitch-slider").val() / 100) : 1;

    // st.pitch = $(this).val() + 1
    } else {
        alert("Please enter a number between -12 and +12");
    }
});


noUiSlider.create($(".play-slider")[0],{
    start: 0,
    range: {
        'min': 0,
        'max': 100
    },
    connect: [true, false]
});

var updateSlider = true;

$(".play-slider").on("pointerdown touchstart",function(e){
    updateSlider = false;
    console.log("Mouse down");
});

$(document.body).on("pointerup touchend",function(e){
    console.log("Mouse up");
    updateSlider = true;
});

$(document.body).on("mouseup",function(e){
    console.log("Mouse up");
    updateSlider = true;
});

$(".play-slider")[0].noUiSlider.on("slide", function(){
    var value = $(".play-slider")[0].noUiSlider.get();
    track.pause();
    st = new SoundTouch();
   st.pitch = $(".pitch-slider")[0].noUiSlider.get() /100;
   st.tempo = !$("#maintain-tempo").prop("checked") ? ($(".pitch-slider")[0].noUiSlider.get() / 100) : 1;
   f = new SimpleFilter(source, st);
   var BUFFER_SIZE = 2048;

   var node = context.createScriptProcessor ? context.createScriptProcessor(BUFFER_SIZE, 2, 2) : context.createJavaScriptNode(BUFFER_SIZE, 2, 2);

   var samples = new Float32Array(BUFFER_SIZE * 2);

   var pos = 0;
   f.sourcePosition = parseInt((value / 100) * bufferDuration * context.sampleRate);
   if (is_playing){
       track.play();
   }
});