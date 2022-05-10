# Gesturner

## Pre requisites

- PureData <https://puredata.info/>
- Node.js <https://nodejs.org/en/>

## Getting started

### PureData/sound processing

Move the content of the `PureData` folder into `Documents/externals`, then run the `effectsrig.pd` patch in the `effectrig` folder. In pureData. select your audio interface/guitar audio as an input, and turn on DSP in the console. You should hear your guitar processed through the audio! Then choose the whammy solo or whammy half solo button in the top left of the patch to get the correct patch engaged.

### Gesture recognition/webapp

In the project folder, run `node app.js`. Then open Google Chrome and go to <http://localhost:3000/public/index.html>. Everything should now be ready to go!

### Tutorial

Make sure Spoken Feedback is on and your default system input is your laptop microphone, and click calibrate or say "help"!
