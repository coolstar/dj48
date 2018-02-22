# DJ48 - CS48 Project at UCSB

## Draft Project

### Description
Our project is a free web-based DJ application that allows users to upload, save, retrieve audio, mix two audio files and shows the user the speed of the track (Beats Per Minute) and a spectrogram, which is a visualization of the frequencies of the audio file. Features of the application include matching the track speeds and modifying the speed of a track. Users can seek through positions in a track, as well as add effects, such as distortion or delays, to modify the song. This application is intended for users to modify and play sound files.

### Features
* Produces BPM for any audio file
* Produces a spectrogram that represent the frequencies of any audio file
* Allows for the mixing of at most two audio files
* Allows DJ functions provided by the Pizzicato library
* Allows for the slowing down or speeding up of any audio files using BPM
* Allows the uploading and saving of audio files

### Build and Execute
1. Clone repo.
2. Checkout 'draftproject' branch.
3. Open the top-level index.html file.  
   Note: Recorder feature requires web workers; some browsers may not allow this functionality on local files.
   In this case, use Firefox, or go to the server-based copy of this repo at [http://cs48-vps.coolstar.org/draftproject/](http://cs48-vps.coolstar.org/draftproject/).
4. To load a song, click on 'Choose File', and choose a mp3 file of your choice (samples are provided for convenience in 'samples' folder of repo).
5. If you wish to record your mix, check the checkbox 'Save output to downloadable file?'.
6. Hit 'play'.
7. Use the appropriate sliders to change volume, seek, shift pitch, or shift tempo of the track.
8. You can change the Visualizer setting by selecting your visualizer choice in the dropdown menu next to 'Visualizer setting'.
9. If you had the 'Save output...' box checked, your recording will be available under 'Recordings' of that track when you hit 'pause'.
10. You can play and mix two tracks by using the section for the second track, under the section for the first track.

### Dependencies
All below libraries are included in the repo under 'vendors'.
* jquery
* soundtouch
* nouislider
* recorder
