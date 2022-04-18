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

const activeZoneMarginX = 0.20

let getActiveZoneXThresh = (data) =>
{
    if (!data.pose.poseLandmarks) return null

    // let rightHipX = data.pose.poseLandmarks[rightHipIdx].x
    let rightShoulderX = data.pose.poseLandmarks[rightShoulderIdx].x

    if (!rightShoulderX) return null

    let xBoundary = rightShoulderX - activeZoneMarginX
    return xBoundary
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
    console.log(rightHandX)

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
let drawActiveZone = (activeZoneXThresh) =>
{
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

    // console.log(height, width, canvas.style.height, canvas.style.width)
    canvas.style.height = height.toString() + "px";
    canvas.style.width = width.toString() + "px";
    // console.log(height, width, canvas.style.height, canvas.style.width)
    context.fillStyle = 'rgba(225,0,0,0.5)';
    // context.fillStyle = 'green';
    let rectWidth = canvas.width * activeZoneXThresh
    let xPos = canvas.width * (1 - activeZoneXThresh)
    context.clearRect(0, 0, canvas.width, canvas.height);
    // context.fillRect(0, 0, width, height);
    context.fillRect(xPos, 0, rectWidth, canvas.height);
    // context.fillRect(10, 10, 250, 250);
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

    drawActiveZone(getActiveZoneXThresh(data));
})

// handsfree.plugin.consoleLogger.enable()
// handsfree.plugin.consoleLogger.disable()

// module.exports = { leftHandIdx, rightHandIdx }


handsfree.start()
