const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, { debug: true });

app.use("/peerjs", peerServer);
app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("join-call", ({ username, peerId }) => {
    socket.broadcast.emit("new-user", { peerId });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
