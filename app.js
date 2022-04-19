// import { sendOsc } from './server/oscbridge.js'
const osc = require('./server/oscbridge.js')
// console.log("OSC:" + osc)
// const reaperbridge = require('./server/reaperbridge.js')
// const pose = require('./public/src/pose.js')
const express = require('express')
const app = express()
const port = 3000
var host = "127.0.0.1"
// var dgram = require('dgram');
// var client = dgram.createSocket('udp4');
const leftHandIdx = 15
const rightHandIdx = 16

//for normalizing
const yMax = 0.7
const yMin = 0.3

// import { test } from './public/shared.js'
// const Shared = require('./public/shared.js')
// console.log("app js: " + Shared.test)



// middleware
app.use(express.json());
app.use(express.urlencoded());

app.use("/public", express.static('public'))


app.listen(port, () =>
{
    console.log(`Example app listening on port ${ port }`)
})

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

app.post("/sendosc", (req, res) =>
{
    // console.log("sendosc api endpoint called, got data")

    if (!req.body.pose[rightHandIdx].y)
        if (!req.body.pose[rightHandIdx].y)
        {
            console.log("no right hand")
            return
        }

    let val = req.body.pose[rightHandIdx].y

    val = normalize(1 - val, 0.2, 0.8)


    if (!req.body.active) 
    {
        //defautl to value 0 if inactive
        val = 0
    }

    // console.log(req.body.pose[rightHandIdx].x)
    // console.log(val)


    // osc.oscSend("/y", [{ type: "f", value: req.body.pose[rightHandIdx].y }])
    osc.oscSend("/y", [{ type: "f", value: val }])
    // document.getElementById("right-hand-y-norm").textContent = "Right Hand y norm: " + val;

    res.send("Sent Osc message");
});

