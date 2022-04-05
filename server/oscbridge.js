// var OSC = require("osc-js");

// var oscPort = 2399
var oscPort = 3005
var listenPort = 0
// var oscHost = "::1" //"localhost" // "127.0.0.1"
var oscHost = "localhost" // "127.0.0.1"

// osc = new OSC()


// var OSC = require("osc-js");
var osc = require("osc");
// var osc = new OSC.
// console.log("OSC: ")
// console.log(osc)
// Create an osc.js UDP Port listening on port 57121.
var udpPort = new osc.UDPPort({
    localAddress: oscHost, //"0.0.0.0",
    localPort: listenPort,
    broadcast: true
    // metadata: true
});

// Listen for incoming OSC messages.
// udpPort.on("message", function (oscMsg, timeTag, info)
// {
//     console.log("An OSC message just arrived!", oscMsg);
//     console.log("Remote info is: ", info);
// });

// Open the socket.
udpPort.open();


// When the port is read, send an OSC message to, say, SuperCollider
udpPort.on("ready", function ()
{
    udpPort.send({
        address: "/s_new",
        args: [
            {
                type: "s",
                value: "default"
            },
            {
                type: "i",
                value: 100
            }
        ]
    }, oscHost, oscPort);
});

function oscSend(addr, cur_args)
{

    console.log('sending osc message: ' + cur_args)
    udpPort.send({
        address: addr,
        args: cur_args
    }, oscHost, oscPort);
}

module.exports = { oscSend, oscPort, oscHost } 