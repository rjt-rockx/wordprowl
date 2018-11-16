const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const puzzlegen = require('./js/puzzlegen.js');

app.get('/', (req, res) => res.sendFile(__dirname + '/html/index.html'));

let makePuzzle = async function () {
    let data = await puzzlegen.createPuzzle();
    io.emit('createPuzzle', data);
};

io.on('connection', (client) => client.on('getNewPuzzle', makePuzzle));

server.listen(4280, console.log('Wordprowl\nListening on port 4280'));
