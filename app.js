// import { sendOsc } from './server/oscbridge.js'
// const osc = require('./server/oscbridge.js')

const express = require('express')
const app = express()
const port = 3000
var host = "127.0.0.1"
var dgram = require('dgram');
var client = dgram.createSocket('udp4');


const leftHandIdx = 15
const rightHandIdx = 16



// middleware
app.use(express.json());
app.use(express.urlencoded());

app.use("/public", express.static('public'))


app.listen(port, () =>
{
    console.log(`Example app listening on port ${ port }`)
})

app.post("/sendosc", (req, res) =>
{
    console.log("sendosc api endpoint called, got data")

    if (!req.body)
    {
        return
    }

    console.log(req.body[rightHandIdx].x)

    // osc.sendOsc("/x", [{ x: req.body[0].x }])
    // console.log("headers: " + req.headers)





    var msg = "\rh_x " + req.body[rightHandIdx].x.toString()
    client.send(msg, 0, msg.length, port, host);
    // client.send('Hello2World!', 0, 12, port, host);
    // client.send('Hello3World!', 0, 12, port, host, function (err, bytes)
    // {
    //     client.close();
    // });

    res.send("Sent Osc message");
});


app.post("/closeosc", (req, res) =>
{
    console.log("closing udp connection")

    // osc.sendOsc("/x", [{ x: req.body[0].x }])
    // console.log("headers: " + req.headers)




    var client = dgram.createSocket('udp4');

    var msg = 'Closing connection'
    client.send(msg, 0, msg.length, port, host, function (err, bytes)
    {
        client.close();
    });

    res.send("Sent Osc message");
});