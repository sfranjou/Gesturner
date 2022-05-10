// Inside your app

import { updateKnob } from "./pureknob.js"
import { postMessage, updateDistorsionTextStatus } from "./swipeMessage.js"

const leftHandIdx = 15
const rightHandIdx = 20

const rightHipIdx = 24
const leftHipIdx = 23

const rightShoulderIdx = 12
const leftShoulderIdx = 11

const rightEarIdx = 8
const leftEarIdx = 7

const rightThumbIdx = 22
const rightWristIdx = 16

const rightEyeIdx = 5;
const mouthRightIdx = 10

let activeZoneMarginX = 0.10
let activeZoneCalibrationOn = false

let lowDeadZone = 0.2
let lowDeadZoneCalibrationOn = false

let highDeadZone = 0.8
let highDeadZoneCalibrationOn = false

let audioFeedback = true

const headXMargin = 0
// const headHeight = 0.3
let headBoxHeightScaling = 3; // height of head bounds compared to eye-mouth distance
const headBoxYOffset = 0.2; //offset in terms of eye-mouth distance

let headBoxCalibrationOn = false;

export const activeColor = 'rgba(0,225,0,0.5)';
export const inactiveColor = 'rgba(225,0,0,0.5)';

const swipeBoundsColor = 'rgba(0,0,225,0.5)';

let distorsionOn = false;

//TODO: add timeout to prevent suprious swipe gestures
//This class provides a clean interface for detecting swipe gestures. Updating an instance with the data from the handsfree will return the swipe gesture when it is detected.
class SwipeGesture
{
    constructor()
    {
        this.swipeStartSide = null;
        this.swiping = false;
        this.previousPos = null
    }

    // returns null, "swipeLeft" or "swipeRight"
    update(data)
    {
        if (!data.pose.poseLandmarks) return null
        let headBounds = getHeadBounds(data);
        if (!headBounds) return null;
        let rightHand = data.pose.poseLandmarks[rightThumbIdx];
        if (!rightHand) return null;



        // if we start from null, just update pos and return
        if (!this.previousPos)
        {
            this.previousPos = rightHand;
            return null
        }

        let rightBoundary = headBounds.x - headBounds.width
        let leftBoundary = headBounds.x

        let bottomBoundary = headBounds.y + headBounds.height;
        let topBoundary = headBounds.y;

        if (rightHand.y < topBoundary || rightHand.y > bottomBoundary)
        {
            this.swiping = null;
            this.swipeStartSide = null;
            this.previousPos = rightHand;
            return null
        }

        else if (!this.swiping && (rightHand.x < rightBoundary || rightHand.x > leftBoundary))
        {
            this.swiping = null;
            this.swipeStartSide = null;
            this.previousPos = rightHand;
            return null
        }

        // console.log(rightHand.x, rightBoundary, leftBoundary)


        // detect entrance from right (small x)
        if (!this.swiping && this.previousPos.x < rightBoundary && (leftBoundary >= rightHand.x >= rightBoundary))
        {
            this.swiping = true
            this.swipeStartSide = 'right'
        }
        else if (!this.swiping && this.previousPos.x > leftBoundary && (leftBoundary >= rightHand.x >= rightBoundary))
        {
            this.swiping = true
            this.swipeStartSide = 'left'
        }

        // now handle the exiting the thing case
        // if we were not swiping and didn;t enter, then we exit here
        else if (!this.swiping)
        {
            this.swiping = null;
            this.swipeStartSide = null;
        }
        //here this.swiping is true: we have entered. Just check the exit side
        else if (this.swipeStartSide = 'left' && rightHand.x < rightBoundary)
        {
            this.swiping = null;
            this.swipeStartSide = null;

            this.previousPos = rightHand
            return "swipeRight"
        }
        else if (this.swipeStartSide = "right" && rightHand.x > leftBoundary)
        {
            this.swiping = null;
            this.swipeStartSide = null;

            this.previousPos = rightHand
            return "swipeLeft"
        }
        else 
        {
            // we exited the same side we arrive on
            this.previousPos = rightHand
        }



        this.previousPos = rightHand


    }
}

let swipeGesture = new SwipeGesture();

let getActiveZoneXThresh = (data) =>
{
    if (!data.pose.poseLandmarks) return null

    // let rightHipX = data.pose.poseLandmarks[rightHipIdx].x
    let rightShoulderX = data.pose.poseLandmarks[rightShoulderIdx].x

    if (!rightShoulderX) return null

    let xBoundary = rightShoulderX - activeZoneMarginX
    return xBoundary
}


// return objkect with x,y coordinates for x, y, width, height
let getHeadBounds = (data) =>
{
    if (!data.pose.poseLandmarks) return null
    let rightEar = data.pose.poseLandmarks[rightEarIdx]
    let leftEar = data.pose.poseLandmarks[leftEarIdx]

    if (!rightEar || !leftEar)
        return null

    let headHeight = Math.abs(data.pose.poseLandmarks[rightEyeIdx].y - data.pose.poseLandmarks[mouthRightIdx].y);

    let bounds = {
        x: leftEar.x,
        y: leftEar.y - headHeight / 2 + headHeight * headBoxYOffset,
        height: headHeight * headBoxHeightScaling,
        width: Math.abs(leftEar.x - rightEar.x),
    }

    return bounds;
}

// returns true if the hand is in tje active zone
let isActive = (data) =>
{

    if (!data.pose.poseLandmarks) return false

    let rightShoulderX = data.pose.poseLandmarks[rightShoulderIdx].x
    let rightHandX = data.pose.poseLandmarks[rightHandIdx].x

    if (!rightHandX || !rightShoulderX)
        return false

    // normalize


    let Xboundary = getActiveZoneXThresh(data)

    if (rightHandX <= Xboundary)
    {
        return true
    }
    return false
}



const handsfree = new Handsfree({
    // Show debug inside a specific element
    showDebug: true,
    // - Note: Setting this to true may result in better accuracy 
    upperBodyOnly: false,

    // Helps reduce jitter over multiple frames if true
    // smoothLandmarks: true,
    setup: {
        wrap: {
            $parent: document.querySelector('#debugger-holder')
        }
    },
    pose: true
})
handsfree.enablePlugins('browser')

//takes in noirmalitve corodinates
let drawActiveZone = (data) =>
{

    let activeZoneXThresh = getActiveZoneXThresh(data)
    if (!activeZoneXThresh) return null

    const canvas = document.getElementById("debugger-canvas") // first make a index . html with a canvas height and width and id of pong or whatever
    // and then we have to get access to our context to draw on it
    const context = canvas.getContext('2d')

    // then you do...

    // https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element
    let el = document.querySelector('#debugger-holder');
    let width = el.offsetWidth
    let height = el.offsetHeight



    // TODO: the width and hieght don't change even though the video changes size, not sure 

    // source for debug eleme4nt code https://github.com/MIDIBlocks/handsfree/blob/481f7cdba849940e1472a370e7ab7418487629a8/src/handsfree.js#L840  


    // Draw the gesture active zone
    canvas.style.height = height.toString() + "px";
    canvas.style.width = width.toString() + "px";

    context.clearRect(0, 0, canvas.width, canvas.height);


    let activeRectWidth = canvas.width * activeZoneXThresh
    let activeRectXPos = canvas.width * (1 - activeZoneXThresh)

    context.fillStyle = isActive(data) ? activeColor : inactiveColor;
    context.fillRect(activeRectXPos, 0, activeRectWidth, canvas.height);

    // draw nonDead zone darker
    context.fillStyle = 'rgba(0,0,0,0.5)';
    context.fillRect(activeRectXPos, canvas.height * (1 - highDeadZone), activeRectWidth, canvas.height * (highDeadZone - lowDeadZone));

    //draw head thing
    let headBounds = getHeadBounds(data);
    if (!headBounds) return null;

    context.fillStyle = swipeBoundsColor;
    context.fillRect((1 - headBounds.x) * canvas.width, headBounds.y * canvas.height, headBounds.width * canvas.width, headBounds.height * canvas.height);



}

// reeference for plugins: https://handsfree.js.org/guide/the-loop.html#basic-plugins
// A plugin that console logs your data on every frame

handsfree.use('consoleLogger', (data) =>
{
    if (!data.pose.poseLandmarks) return

    let gesture = swipeGesture.update(data);
    if (gesture)
    {
        updateDistorsionTextStatus(gesture);
    }

    let exprVal = normalize(1 - data.pose.poseLandmarks[rightHandIdx].y, lowDeadZone, highDeadZone);


    // https://stackoverflow.com/questions/6396101/pure-javascript-send-post-data-without-a-form
    // send data for the expression
    fetch("/sendosc", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify({ active: isActive(data), pose: data.pose.poseLandmarks, swipe: gesture, exprVal: exprVal, dist: distorsionOn })
    }).then(res =>
    {
        // console.log("Request complete! response:", res);
    });
})


//TODO share somehow with frontend
//nomralize from range to target range, and clips if exceeds the range, Defaults to 0 1 as target
let normalize = (val, low, high, targetLow = 0, targetHigh = 1) =>
{
    let tval = (val - low) / (high - low) // brings it to 0-1 range
    tval *= (targetHigh - targetLow)
    tval += targetLow
    if (tval >= targetHigh) return targetHigh
    if (tval <= targetLow) return targetLow
    return tval
}





handsfree.use('UIupdater', (data) =>
{
    if (!data.pose.poseLandmarks) return


    let exprVal = normalize(1 - data.pose.poseLandmarks[rightHandIdx].y, lowDeadZone, highDeadZone);


    if (activeZoneCalibrationOn)
        setActiveZonePosition(data);
    if (lowDeadZoneCalibrationOn)
        setLowDeadZonePosition(data);
    if (highDeadZoneCalibrationOn)
        setHighDeadZonePosition(data);
    if (headBoxCalibrationOn)
        setHeadBoxSize(exprVal);

    updateKnob(isActive(data) ? exprVal * 100 : 0);

    drawActiveZone(data);


})


export function startCalibration()
{
    const countdown = document.getElementById("countdown");
    const timeInterval = 1000;
    let schedTime = 0;
    let timeIdx = 0

    const calibrationIndicator = document.getElementById("calibration-indicator")
    //calibrate active zone X position

    calibrationIndicator.innerText = "Calibrating Active Zone";

    if (audioFeedback)
    {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance('Beginning Calibration. The rectangle on the right represents the active zone. The poarameter control will only engage when your right hand is in the active zone.'));
        window.speechSynthesis.speak(new SpeechSynthesisUtterance('Please hold your right hand at the limit at which you want parameter control to engage'));
        schedTime += timeInterval * 2;
        timeIdx = timeIdx + 15;
    }


    setTimeout(() => { countdown.innerText = "3"; activeZoneCalibrationOn = true; }, timeInterval * timeIdx++)
    setTimeout(() => { countdown.innerText = "2" }, timeInterval * timeIdx++)
    setTimeout(() => { countdown.innerText = "1" }, timeInterval * timeIdx++)
    setTimeout(() =>
    {
        countdown.innerText = "";
        activeZoneCalibrationOn = false;
    }, timeInterval * timeIdx++);


    if (audioFeedback)
    {
        setTimeout(() => window.speechSynthesis.speak(new SpeechSynthesisUtterance('Please hold your right hand at the height corresponding to the minimum parameter value, zero')), timeInterval * timeIdx++);
        timeIdx += 3;
    }
    setTimeout(() =>
    {

        lowDeadZoneCalibrationOn = true;
        calibrationIndicator.innerText = "Calibrating minimum value height";
        countdown.innerText = "3";
    }, timeInterval * timeIdx++);
    setTimeout(() => { countdown.innerText = "2" }, timeInterval * timeIdx++);
    setTimeout(() => { countdown.innerText = "1" }, timeInterval * timeIdx++);
    setTimeout(() => { countdown.innerText = ""; lowDeadZoneCalibrationOn = false; }, timeInterval * timeIdx++);

    if (audioFeedback)
    {
        setTimeout(() => window.speechSynthesis.speak(new SpeechSynthesisUtterance('Please hold your right hand at the height corresponding to the maximum parameter value, one')), timeInterval * timeIdx++)
        timeIdx += 3;
    }

    setTimeout(() =>
    {
        highDeadZoneCalibrationOn = true;
        calibrationIndicator.innerText = "Calibrating maximum value height";
        countdown.innerText = "3";
    }, timeInterval * timeIdx++);
    setTimeout(() => { countdown.innerText = "2" }, timeInterval * timeIdx++);
    setTimeout(() => { countdown.innerText = "1" }, timeInterval * timeIdx++);
    setTimeout(() =>
    {
        countdown.innerText = "";
        highDeadZoneCalibrationOn = false;
    }, timeInterval * timeIdx++);


    if (audioFeedback)
    {
        setTimeout(() => window.speechSynthesis.speak(new SpeechSynthesisUtterance('Swiping through the blue rectangle will toggle distorsion depending on swipe direction. Place your hand in the active zone and control the expresion parameter to set the size of the swipe zone.')), timeInterval * timeIdx++)
        timeIdx += 10;
    }

    setTimeout(() =>
    {
        headBoxCalibrationOn = true;
        calibrationIndicator.innerText = "Calibrating swipe zone";
        countdown.innerText = "3";
    }, timeInterval * timeIdx++);
    setTimeout(() => { countdown.innerText = "2" }, timeInterval * timeIdx++);
    setTimeout(() => { countdown.innerText = "1" }, timeInterval * timeIdx++);
    setTimeout(() =>
    {
        countdown.innerText = ""; headBoxCalibrationOn = false; calibrationIndicator.innerText = "Calibrating complete";
    }, timeInterval * timeIdx);
    if (audioFeedback)
        setTimeout(() => { window.speechSynthesis.speak(new SpeechSynthesisUtterance('Calibration complete')) }, timeInterval * timeIdx++);







}

function setActiveZonePosition(data)
{
    if (!data.pose.poseLandmarks) return null
    let rightShoulderX = data.pose.poseLandmarks[rightShoulderIdx].x
    let rightHandX = data.pose.poseLandmarks[rightHandIdx].x
    if (!rightShoulderX) return null
    activeZoneMarginX = - rightHandX + rightShoulderX
}

function setLowDeadZonePosition(data)
{
    if (!data.pose.poseLandmarks) return null
    let rightHandY = data.pose.poseLandmarks[rightHandIdx].y
    if (!rightHandY) return null
    lowDeadZone = (1 - rightHandY);
}

function setHighDeadZonePosition(data)
{
    if (!data.pose.poseLandmarks) return null
    let rightHandY = data.pose.poseLandmarks[rightHandIdx].y
    if (!rightHandY) return null
    highDeadZone = (1 - rightHandY);
}

function setHeadBoxSize(exprVal)
{
    const minScale = 1;
    const maxScale = 7;
    headBoxHeightScaling = normalize(exprVal, 0, 1, minScale, maxScale);
}

const calibrateButton = document.getElementById("calibrate-button")
calibrateButton.addEventListener('click', startCalibration)

const audioFeedbackButton = document.getElementById('audio-feedback-button');
audioFeedbackButton.innerText = audioFeedback ? "Speech Feedback ON" : "Speech Feedback OFF"
audioFeedbackButton.style.background = audioFeedback ? 'green' : 'red'

audioFeedbackButton.addEventListener('click', function () { audioFeedback = !audioFeedback; this.innerText = audioFeedback ? "Speech Feedback ON" : "Speech Feedback OFF"; this.style.background = audioFeedback ? 'green' : 'red' })

// handsfree.hideDebugger()
handsfree.start()
