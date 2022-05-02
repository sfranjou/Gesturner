// Inside your app
// import Handsfree from 'handsfree'
// import { test } from '../shared.js'
// console.log("pose js: " + test)
// const Handsfree = require("handsfree")
import { updateKnob } from "./pureknob.js"
import { postMessage } from "./swipeMessage.js"

const leftHandIdx = 15
const rightHandIdx = 16

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

const activeZoneMarginX = 0.10

const headXMargin = 0
// const headHeight = 0.3
const headBoxHeightScaling = 3; // height of head bounds compared to eye-mouth distance
const headBoxYOffset = 1; //offset in terms of eye-mouth distance


const activeColor = 'rgba(0,225,0,0.5)';
const inactiveColor = 'rgba(225,0,0,0.5)';

const swipeBoundsColor = 'rgba(0,0,225,0.5)';

//TODO: add timeout to prevent suprious swipe gestures
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
        // console.log(rightHand.y)

        if (rightHand.y < topBoundary || rightHand.y > bottomBoundary)
        {
            this.swiping = null;
            this.swipeStartSide = null;
            this.previousPos = rightHand;
            // console.log("out of bounds y");
            return null
        }

        else if (!this.swiping && (rightHand.x < rightBoundary || rightHand.x > leftBoundary))
        {
            this.swiping = null;
            this.swipeStartSide = null;
            this.previousPos = rightHand;
            // console.log("out of bounds x");
            return null
        }

        // console.log(rightHand.x, rightBoundary, leftBoundary)


        // detect entrance from right (small x)
        if (!this.swiping && this.previousPos.x < rightBoundary && (leftBoundary >= rightHand.x >= rightBoundary))
        {
            this.swiping = true
            this.swipeStartSide = 'right'
            // console.log("enter on right")
        }
        else if (!this.swiping && this.previousPos.x > leftBoundary && (leftBoundary >= rightHand.x >= rightBoundary))
        {
            this.swiping = true
            this.swipeStartSide = 'left'
            // console.log("enter on left")
        }

        // now handle the exiting the thing case
        // if we were not swiping and didn;t enter, then we exit here
        else if (!this.swiping)
        {
            this.swiping = null;
            this.swipeStartSide = null;
            // console.log("not swiping")
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
            // console.log(this.swiping, this.swipeStartSide, this.previousPos)
            // this.swiping = null;
            // this.swipeStartSide = null;
            this.previousPos = rightHand
            // console.log("youp")
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
    //TODO: add x margin

    // let topLeft = { x: leftEar.x, y: leftEar.y - headHeight / 2 }
    // let topRight = { x: rightEar.x, y: rightEar.y - headHeight / 2 }
    // let bottomLeft = { x: leftEar.x, y: leftEar.y + headHeight / 2 }
    // let bottomRight = { x: rightEar.x, y: rightEar.y + headHeight / 2 }

    // let bounds = {
    //     topLeft: topLeft,
    //     topRight: topRight,
    //     bottomLeft: bottomLeft,
    //     bottomRight: bottomRight
    // }
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

    // let rightHipX = data.pose.poseLandmarks[rightHipIdx].x
    let rightShoulderX = data.pose.poseLandmarks[rightShoulderIdx].x
    let rightHandX = data.pose.poseLandmarks[rightHandIdx].x

    if (!rightHandX || !rightShoulderX)
        return false

    // normalize
    // let rightHandXNorm = rightHandX / handsfree.debug.$video.videoWidth
    // console.log(rightHandX)

    // also require y osition higher than average of the hip and shoudler maybe?

    // use the furthest value out of shoulder and hip (to account for hi movements while playing)
    // let boundary = Math.min(rightShoulderX, rightHipX) - activeZoneMargin
    // let Xboundary = rightShoulderX - activeZoneMarginX
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
    smoothLandmarks: true,
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

    // context.fillStyle = 'green';
    // https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element
    let el = document.querySelector('#debugger-holder');
    let width = el.offsetWidth
    let height = el.offsetHeight

    // let width = this.handsfree.debug.$video.videoWidth
    // let height = this.handsfree.debug.$video.videoHeight

    // TODO: the width and hieght don't change even though the video changes size, not sure 

    // source for debug eleme4nt code https://github.com/MIDIBlocks/handsfree/blob/481f7cdba849940e1472a370e7ab7418487629a8/src/handsfree.js#L840  


    // Draw the gesture active zone
    canvas.style.height = height.toString() + "px";
    canvas.style.width = width.toString() + "px";

    context.clearRect(0, 0, canvas.width, canvas.height);


    let activeRectWidth = canvas.width * activeZoneXThresh
    let activeRextXPos = canvas.width * (1 - activeZoneXThresh)

    // context.fillStyle = 'rgba(225,0,0,0.5)';
    context.fillStyle = isActive(data) ? activeColor : inactiveColor;
    context.fillRect(activeRextXPos, 0, activeRectWidth, canvas.height);


    //draw head thing
    let headBounds = getHeadBounds(data);
    if (!headBounds) return null;
    // console.log(headBounds)

    // context.fillStyle = 'rgba(0,225,0,0.5)';
    context.fillStyle = swipeBoundsColor;
    context.fillRect((1 - headBounds.x) * canvas.width, headBounds.y * canvas.height, headBounds.width * canvas.width, headBounds.height * canvas.height);


}

// reeference for plugins: https://handsfree.js.org/guide/the-loop.html#basic-plugins
// A plugin that console logs your data on every frame

handsfree.use('consoleLogger', (data) =>
{
    // console.log("DATA: " + JSON.stringify(data))

    if (!data.pose.poseLandmarks) return

    // console.log(data.pose.poseLandmarks)
    let gesture = swipeGesture.update(data);
    if (gesture)
    {
        // var flashMessages = document.getElementsByClassName('js-flash-message');
        // //show first flash message avilable in your page
        // showFlashMessage(flashMessages[0]);
        console.log(gesture);
        postMessage(gesture);
    }


    // https://stackoverflow.com/questions/6396101/pure-javascript-send-post-data-without-a-form
    // send data for the expression
    fetch("/sendosc", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify({ active: isActive(data), pose: data.pose.poseLandmarks, swipe: gesture })
        // body: { name: "sebastian" }
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


// function showFlashMessage(element)
// {
//     var event = new CustomEvent('showFlashMessage');
//     element.dispatchEvent(event);
// };



handsfree.use('UIupdater', (data) =>
{
    if (!data.pose.poseLandmarks) return

    // document.getElementById("right-hand-x").textContent = "Right Hand x: " + data.pose.poseLandmarks[rightHandIdx].x;
    // document.getElementById("right-hand-y").textContent = "Right Hand y: " + data.pose.poseLandmarks[rightHandIdx].y;
    let exprVal = normalize(1 - data.pose.poseLandmarks[rightHandIdx].y, 0.2, 0.8);
    document.getElementById("expression-indicator").textContent = "Expression: " + exprVal;
    // document.getElementById("active-indicator").textContent = "Is Active: " + isActive(data);

    // drawActiveZone(getActiveZoneXThresh(data));
    drawActiveZone(data);
    updateKnob(exprVal * 100);




})

// handsfree.plugin.consoleLogger.enable()
// handsfree.plugin.consoleLogger.disable()

// module.exports = { leftHandIdx, rightHandIdx }

// handsfree.hideDebugger()
handsfree.start()
