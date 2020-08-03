const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const puzzlegen = require("./js/puzzlegen.js");

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
app.get("/", (req, res) => res.sendFile(__dirname + "/html/index.html"));

const makePuzzle = async function () {
	const data = await puzzlegen.createPuzzle();
	io.emit("createPuzzle", data);
};

io.on("connection", (client) => client.on("getNewPuzzle", makePuzzle));

server.listen(4280, console.log("Wordprowl\nListening on port 4280"));
