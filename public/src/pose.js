// Inside your app
// import Handsfree from 'handsfree'
// import { test } from '../shared.js'
// console.log("pose js: " + test)
// const Handsfree = require("handsfree")
const leftHandIdx = 15
const rightHandIdx = 16

const rightHipIdx = 24
const leftHipIdx = 23

const rightShoulderIdx = 12
const leftShoulderIdx = 11

const rightEarIdx = 8
const leftEarIdx = 7

const activeZoneMarginX = 0.20

const headXMargin = 0
const headHeight = 0.3

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

    let bounds = {
        x: leftEar.x,
        y: leftEar.y - headHeight / 2,
        height: headHeight,
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

    context.fillStyle = 'rgba(225,0,0,0.5)';
    context.fillRect(activeRextXPos, 0, activeRectWidth, canvas.height);


    //draw head thing
    let headBounds = getHeadBounds(data);
    if (!headBounds) return null;
    console.log(headBounds)

    context.fillStyle = 'rgba(0,225,0,0.5)';
    context.fillRect((1 - headBounds.x) * canvas.width, headBounds.y * canvas.height, headBounds.width * canvas.width, headBounds.height * canvas.height);


}

// reeference for plugins: https://handsfree.js.org/guide/the-loop.html#basic-plugins
// A plugin that console logs your data on every frame

handsfree.use('consoleLogger', (data) =>
{
    // console.log("DATA: " + JSON.stringify(data))

    if (!data.pose.poseLandmarks) return

    // console.log(data.pose.poseLandmarks)


    // https://stackoverflow.com/questions/6396101/pure-javascript-send-post-data-without-a-form
    fetch("/sendosc", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify({ active: isActive(data), pose: data.pose.poseLandmarks })
        // body: { name: "sebastian" }
    }).then(res =>
    {
        // console.log("Request complete! response:", res);
    });
})

handsfree.use('UIupdater', (data) =>
{
    if (!data.pose.poseLandmarks) return

    document.getElementById("right-hand-x").textContent = "Right Hand x: " + data.pose.poseLandmarks[rightHandIdx].x;
    document.getElementById("right-hand-y").textContent = "Right Hand y: " + data.pose.poseLandmarks[rightHandIdx].y;
    document.getElementById("active-indicator").textContent = "Is Active: " + isActive(data);

    // drawActiveZone(getActiveZoneXThresh(data));
    drawActiveZone(data);
})

// handsfree.plugin.consoleLogger.enable()
// handsfree.plugin.consoleLogger.disable()

// module.exports = { leftHandIdx, rightHandIdx }


handsfree.start()
