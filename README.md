# Gesturner

## Pre requisites

- PureData (vanilla shoudl be fine) <https://puredata.info/>
- Node.js <https://nodejs.org/en/>
- Google Chrome web browser
- This was only tested on a Macbook air M1 with Mac OS 12.3.1 Monterey

## Getting started

### PureData/sound processing

Move the content of the `PureData` folder into `Documents/externals`, then run the `effectsrig.pd` patch in the `effectrig` folder. In pureData. select your audio interface/guitar audio as an input, and turn on DSP in the console. You should hear your guitar processed through the audio! Then choose the whammy solo or whammy half solo button in the top left of the patch to get the correct patch engaged.

### Gesture recognition/webapp

In the project folder, run `node app.js`. Then open Google Chrome and go to <http://localhost:3000/public/index.html>. Everything should now be ready to go!

### Tutorial

Make sure Spoken Feedback is on and your default system input is your laptop microphone, and click calibrate or say "help"!

# Source code structure

## Backend

### `app.js`

Handles the backend, receives messages from the webapp and forwards them to PureData using OSC.js, since browsers make UDP difficult

### `oscbridge.js`

Contains the functions for communicating with pureData over OSC/UDP.

### `effectsrig.pd`

Handles the sound processing and receives osc from app.js over UDP.

## Frontend

### `index.html`

HTML file describing the layout of the UI and calling the scripts. Most fancy elements are just plain divs here that get updated in the javascript code.

### `speechRec.js`

Handles speech recognition

### `pureKnob.js`

Modified form <https://github.com/andrepxx/pure-knob>, handles the knob display

### `swipeMessage.js`

Handles the UI corresponding to the swipe gestures

### `pose.js`

The meat of the code. Handles all the skeletal tracking, including swipe gesture detection, value normalization, UI updates, and calibration. Would benefit from being split up probably.
