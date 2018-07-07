//jshint esversion:6
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var puzzlegen = require('./js/puzzlegen.js');

app.get('/wordprowl', function (req, res) {
    res.sendFile(__dirname + '/html/index.html');
});

io.on('connection', function (client) {
    console.log('Client connected...');
    let makePuzzle = async function () {
        var data = await puzzlegen.createPuzzle();
        console.log(data);
        io.emit('createPuzzle', data.category, data.puzzle, data.words);
    };
    makePuzzle();
    client.on('getNewPuzzle', async function () {
        var data = await puzzlegen.createPuzzle();
        console.log(data);
        io.emit('createPuzzle', data.category, data.puzzle, data.words);
    });
});

server.listen(3000, function () {
    console.log('listening on port 3000');
});
