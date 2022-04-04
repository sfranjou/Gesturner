// const http = require('http');

// const hostname = '127.0.0.1';
// const port = 3000;

// // const server = http.createServer((req, res) =>
// // {
// //     res.statusCode = 200;
// //     res.setHeader('Content-Type', 'text/html');
// //     res.end('Hello world');
// // });

// // server.listen(port, hostname, () =>
// // {
// //     console.log(`Server at http://${ hostname }:${ port }/`);
// // });

// var fs = require('fs');

// http.createServer(function (req, res)
// {
//     fs.readFile('index.html', function (err, data)
//     {
//         res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': data.length });
//         res.write(data);
//         res.end();
//     });
// }).listen(port, hostname);


const express = require('express')
const app = express()
const port = 3000

// middleware
app.use(express.json());
app.use(express.urlencoded());

app.use("/public", express.static('public'))

// app.get('/', (req, res) =>
// {
//     res.send('Hello World!')
// })

app.listen(port, () =>
{
    console.log(`Example app listening on port ${ port }`)
})

app.post("/sendosc", (req, res) =>
{
    console.log("sendosc api endpoint called, got data")
    console.log(req.body[0].x)
    // console.log("headers: " + req.headers)
    res.send("Hello world");
});