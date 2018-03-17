# DJ48 - CS48 Project at UCSB
## Final Project

### Description
DJ48 is a web-based DJ application that allows users to upload and play tracks, add live effects, and produce recordings of their mixes.

### Table of Contents
* [Features](https://github.com/coolstar/dj48#features)
  * [Track Retrieval](https://github.com/coolstar/dj48#track-retrieval)
  * [Audio Visualization](https://github.com/coolstar/dj48#audio-visualization)
  * [Playback Controls](https://github.com/coolstar/dj48#playback-controls)
  * [Sync BPMs](https://github.com/coolstar/dj48#sync-bpms)
  * [Real-Time Effects](https://github.com/coolstar/dj48#real-time-effects)
* [Build, Execute, and Run](https://github.com/coolstar/dj48#build-execute-and-run)
  * [Local Access](https://github.com/coolstar/dj48#local-access)
  * [Server Access](https://github.com/coolstar/dj48#server-access)
* [Testing](https://github.com/coolstar/dj48#testing)
* [Known Bugs](https://github.com/coolstar/dj48#known-bugs)
* [Dependencies](https://github.com/coolstar/dj48#dependencies)

### Features
#### Track Retrieval
* User can upload up to two audio files from their local filesystem
* System prepares the track(s) for playing, mixing, and recording
#### Audio Visualization
* Utilizes Fourier Transform to decompose tracks into its frequencies
* Using the above decomposition, displays a spectrogram
* Using a drop-down box, can change visualization to a sine wave
* Sine wave visualization shows amplitudes of combined frequencies across time
#### Playback Controls
* Play and pause in one button, switches functions on press
* Volume control
* Live playback of tracks with their effects and filters
* Seekbar that shows progress of track, and allows position to be changed
#### Sync BPMs
* Averages the BPM of the two tracks
* Sets the BPM of both tracks to the above calculated average
#### Recording
* Switch to enable/disable recording
* Records audio output from the web-page
#### Real-Time Effects
##### Pitch
* Shifts frequencies higher or lower
* Percentage-based
##### Tempo
* Increases or decreases tempo, or beats-per-minute
* Percentage-based
##### Delay
* Plays back sound in defined intervals
* Echo effect
##### Ping-Pong Delay
* Similar to regular Delay
* On each feedback loop, output is swapped between left and right channels
##### Dub Delay
* Similar to regular Delay
* On each feedback loop, output is routed through a biquad filter
* Biquad filter "dubs" (swirling, psychedelic effect) successive echoes
##### Distortion
* Alters sound by increasing gain, producing "fuzzy", "growling", or "gritty" tone
* aka Overdrive
##### Quadrafuzz
* Divides sound into separate bands
* Applies distortion effects to each band independently
##### Flanger
* Swirling effect
* Delays a copy of the sound by a small, gradually changing period
* Blends the copy back into the original signal
* Produces "comb filtering", constructive and destructive interference
##### Compressor
* Squashes an audio signal's dynamic range, ratio between largest and smallest values
* Reduces volume of loud sounds
* Amplifies quiet sounds
##### Low-Pass Filter
* Passes signals with frequencies lower than cutoff
* Attenuates signals with frequencies higher than the cutoff
##### High-Pass Filter
* Passes signals with frequencies higher than cutoff
* Attenuates signals with frequencies lower than cutoff
##### Stereo Panner
* Adjusts the distribution of the sound signal between the left and right channels
##### Reverb
* Simulates particular physical environments
* Simulates the resonance or repercussion of sound in that environment
##### Ring Modulator
* Multiplies the track signal with a sine wave modulating the track
* Recreates the distortion applied to audio signals as it travels through diode nodes
* Cybermen and The Daleks from Dr Who
##### Tremolo
* Changes volume of the sound over time
* Similar outcome to changing volume up and down periodically

### Build, Execute, and Run
#### Local Access
  Note: Recorder feature requires web workers; some browsers may not allow this functionality on local files.
  In this case, see the below section 'Server Access'.
1. Clone repo.
2. Checkout 'finalproject' branch.
3. Open the top-level index.html file.
4. Load songs by clicking either upload button, and choosing mp3 files of your choice.  
   Samples are provided for convenience in 'samples' folder of repo.
5. Click the sync button (tooltip: 'Sync') at the top of the page to set the BPMs of both tracks to the average of the two, if necessary.
6. Click respective play buttons to play individual tracks, or click the play button (tooltip: 'Play All') at the top to play both at once.
7. Add and modify effects using their respective sliders.
8. The visualizer setting can be changed by selecting your choice from the dropdown menu next to 'Visualizer setting'.
9. Create a macro that copies user inputs on the transport and effects controls by clicking on the record button (tooltip: 'Record Macro').
10. Replay a macro by clicking on the play button (tooltip: 'Play Macro').
11. To import a macro, click on the button with tooltip: 'Upload Macro'.
#### Server Access
To more conveniently view the application, visit the below link.
The recording feature works on this server-hosted application.
[link](http://cs48-vps.coolstar.org/finalproject/dj48/)
1. Load songs by clicking either upload button, and choosing mp3 files of your choice.  
   Samples are provided for convenience in 'samples' folder of repo.
2. Turn on the 'Record' switch to record your output.
3. Click the sync button (tooltip: 'Sync') at the top of the page to set the BPMs of both tracks to the average of the two, if necessary.
4. Click respective play buttons to play individual tracks, or click the play button (tooltip: 'Play All') at the top to play both at once.
5. Add and modify effects using their respective sliders.
6. The visualizer setting can be changed by selecting your choice from the dropdown menu next to 'Visualizer setting'.
7. Recorded output is available by clicking 'Recordings'.
8. Create a macro that copies user inputs on the transport and effects controls by clicking on the record button (tooltip: 'Record Macro').
9. Replay a macro by clicking on the play button (tooltip: 'Play Macro').
10. To import a macro, click on the button with tooltip: 'Upload Macro'.

### Testing
Testing details can be found in the 'tests' directory.

### Known Bugs
* Race condition between playback update and user drag event on seekbar
  * Sometimes prevents proper dragging of seeker

### Dependencies
All libraries below are included in the repo under 'lib'.
* jquery
* nouislider
* pizzicato
* recorder
* soundtouch
