import { startCalibration } from "./pose.js";


// new speech recognition object
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var recognition = new SpeechRecognition();

// This runs when the speech recognition service starts
recognition.onstart = function ()
{
    console.log("We are listening. Try speaking into the microphone.");
};

recognition.onspeechend = function ()
{
    // when user is done speaking
    recognition.stop();
    // console.log("STOPPED")
    // recognition.start();
}

recognition.onend = function ()
{
    // when user is done speaking
    recognition.start();
    // console.log("RESTARTED")
    // recognition.start();
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
        muteButton.setAttribute("checked", "");
        setTimeout(startCalibration(), 100);
    }
    else if (transcript.includes("turn on") || transcript.includes("unmute"))
    {
        muteButton.setAttribute("checked", "");
    }
    else if (transcript.includes("turn off") || transcript.includes("mute"))
    {
        muteButton.removeAttribute("checked");
    }
    else if (transcript.includes("calibrate") || transcript.includes("calibration"))
    {
        setTimeout(startCalibration(), 100);
    }
    // recognition.start();
};

// start recognition
recognition.start();