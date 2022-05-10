import { startCalibration } from "./pose.js";


// new speech recognition object
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();
var listening = true;

// This runs when the speech recognition service starts
recognition.onstart = function ()
{
    console.log("We are listening. Try speaking into the microphone.");
};

recognition.onspeechend = function ()
{
    // when user is done speaking
    recognition.stop();
}

recognition.onend = function ()
{
    // when user is done speaking
    if (listening)
        recognition.start();
}

// This runs when the speech recognition service returns result
recognition.onresult = function (event)
{
    var transcript = event.results[0][0].transcript;
    var confidence = event.results[0][0].confidence;
    console.log(transcript, confidence)

    let muteButton = document.getElementById("audio-feedback-button");

    // if they ask for help, turn on audio and start tutorial
    if (transcript.includes("help"))
    {
        // muteButton.setAttribute("checked", "");
        setTimeout(startCalibration(), 100);
    }
    else if (transcript.includes("toggle sound") || transcript.includes("toggle mute"))
    {
        muteButton.click();
    }

    else if (transcript.includes("calibrate") || transcript.includes("Start calibration") || transcript.includes("Start calibration"))
    {
        setTimeout(startCalibration(), 100);
    }
    else if (transcript.includes("toggle listening") || transcript.includes("stop listening") || transcript.includes("disable speech input"))
    {
        let listeningButton = document.getElementById("listening-button");
        listeningButton.click();
    }
};



let listeningButton = document.getElementById("listening-button");
listeningButton.addEventListener('click', () =>
{
    listening = !listening;
    if (listening)
        recognition.start();
    else
        recognition.stop();
})

// start recognition
recognition.start();