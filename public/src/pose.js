// Inside your app
// import Handsfree from 'handsfree'


console.log("hello world")

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


// reeference for plugins: https://handsfree.js.org/guide/the-loop.html#basic-plugins
// A plugin that console logs your data on every frame

handsfree.use('consoleLogger', (data) =>
{
    // console.log("DATA: " + JSON.stringify(data))

    if (!data.pose) return

    console.log(data.pose.poseLandmarks)





    // https://stackoverflow.com/questions/6396101/pure-javascript-send-post-data-without-a-form
    fetch("/sendosc", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify(data.pose.poseLandmarks)
        // body: { name: "sebastian" }
    }).then(res =>
    {
        console.log("Request complete! response:", res);
    });


})

// handsfree.plugin.consoleLogger.enable()
// handsfree.plugin.consoleLogger.disable()



handsfree.start()