// import { Reaper } from 'reaper-osc';
var Reaper = require("reaper-osc");


var reaper = new Reaper.Reaper();

// Start listening for messages
reaper.startOsc();

console.log("Hello Reaper!!")
// Subscribe to state changes
reaper.tracks[0].onPropertyChanged('isMuted', () =>
{
    console.log(`Track 1 was ${ reaper.tracks[0].isMuted ? 'muted' : 'unmuted' }`);
});

// Wait for the port to open, then start sending commands
reaper.onReady(() =>
{
    reaper.transport.play();

    reaper.tracks[0].mute();
    reaper.tracks[0].unmute();
});

