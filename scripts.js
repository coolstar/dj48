var currentFile = "";
    function playAudio() {
        // Check for audio element support.
        if (window.HTMLAudioElement) {
            try {
                var oAudio = document.getElementById('myaudio');
                var btn = document.getElementById('play');
                var audioURL = document.getElementById('audiofile');
                //Skip loading if current file hasn't changed.
                if (audioURL.value !== currentFile) {
                    oAudio.src = audioURL.value;
                    currentFile = audioURL.value;
                }
                // Tests the paused attribute and set state.
                if (oAudio.paused) {
                    oAudio.play();
                    btn.textContent = "Pause";
                }
                else {
                    oAudio.pause();
                    btn.textContent = "Play";
                }
            }
            catch (e) {
                // Fail silently but show in F12 developer tools console
                 if(window.console && console.error("Error:" + e));
            }
        }
    }
