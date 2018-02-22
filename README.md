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
   In this case, use Firefox (seems to work), or go to the server-based copy of this repo at [http://cs48-vps.coolstar.org/draftproject/](http://cs48-vps.coolstar.org/draftproject/)
