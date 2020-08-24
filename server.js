const express = require("express");
const app = express();
const puzzlegen = require("./js/puzzlegen.js");
const port = 4280;

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/favicons", express.static(__dirname + "/assets/favicons"));
app.get("/", (_, res) => res.sendFile(__dirname + "/html/index.html"));

const server = app.listen(port, console.log(`Wordprowl listening on port ${port}`));

class puzzleBuffer {
	constructor(socketServer) {
		this.socketServer = socketServer;
		this.clients = new Map();
		this.timeout = 600;
		this.socketServer.on("connect", socket => {
			this.clients.set(socket.id, { puzzle: puzzlegen.createPuzzle(), lastUpdated: Date.now() });
			socket.on("getNewPuzzle", () => this.servePuzzle(socket.id));
		});
		setInterval(() => this.purgeOldClients(this.timeout), 60);
	}

	async servePuzzle(id) {
		this.socketServer.to(id).emit("createPuzzle", await this.clients.get(id).puzzle);
		const data = { puzzle: puzzlegen.createPuzzle(), lastUpdated: Date.now() };
		this.clients.set(id, data);
		return { id, ...data };
	}

	purgeOldClients(seconds = 600) {
		const ms = seconds * 1000;
		const current = Date.now();
		for (const [id, client] of this.clients) {
			if (client.lastUpdated < (current - ms))
				this.clients.delete(id);
		}
	}
}

new puzzleBuffer(require("socket.io")(server, { path: "/socket" }));