const osc = require('./server/oscbridge.js')
const express = require('express')
const app = express()
const port = 3000
var host = "127.0.0.1"


// middleware
app.use(express.json());
app.use(express.urlencoded());

app.use("/public", express.static('public'))

app.get('/', function (req, res)
{
    res.redirect('/public/index.html');
});

app.listen(port, () =>
{
    console.log(`Example app listening on port ${ port }`)
})



app.post("/sendosc", (req, res) =>
{


    let val = req.body.exprVal;

    if (!req.body.active) 
    {
        //defautl to value 0 if inactive
        val = 0
    }

    let gestureVal = 0;
    if (req.body.swipe)
    {
        if (req.body.swipe === "swipeRight")
        {
            gestureVal = 1;
        }
        else if (req.body.swipe === "swipeLeft")
        {
            gestureVal = -1;
        }
    }

    osc.oscSend("/y", [{ type: "f", value: val }])
    osc.oscSend("/swipe", [{ type: "f", value: gestureVal }])

    res.send("Sent Osc message");
});

