const socket = io();
let peer, localStream;
let peers = {};
const joinBtn = document.getElementById("join-btn");
const usernameInput = document.getElementById("username");
const callType = document.getElementById("callType");

joinBtn.onclick = async () => {
  const username = usernameInput.value.trim();
  if (!username) return alert("Enter your name");

  document.getElementById("join-screen").classList.add("hidden");
  document.getElementById("call-screen").classList.remove("hidden");
  document.getElementById("my-name").textContent = username;

  peer = new Peer();
  peer.on("open", async (id) => {
    const isVideo = callType.value === "video";
    localStream = await navigator.mediaDevices.getUserMedia({
      video: isVideo,
      audio: true,
    });

    document.getElementById("local-video").srcObject = localStream;

    socket.emit("join-call", { username, peerId: id });

    peer.on("call", (call) => {
      call.answer(localStream);
      call.on("stream", (remoteStream) => addRemoteStream(remoteStream, call.peer));
    });
  });

  socket.on("new-user", ({ peerId }) => {
    const call = peer.call(peerId, localStream);
    call.on("stream", (remoteStream) => addRemoteStream(remoteStream, call.peer));
  });
};

function addRemoteStream(stream, id) {
  if (peers[id]) return;
  const video = document.createElement("video");
  video.srcObject = stream;
  video.autoplay = true;
  video.playsInline = true;
  document.getElementById("remote-videos").appendChild(video);
  peers[id] = video;
}

document.getElementById("leave-btn").onclick = () => location.reload();

document.getElementById("toggle-video").onclick = () => {
  localStream.getVideoTracks()[0].enabled =
    !localStream.getVideoTracks()[0].enabled;
};

document.getElementById("toggle-audio").onclick = () => {
  localStream.getAudioTracks()[0].enabled =
    !localStream.getAudioTracks()[0].enabled;
};

document.getElementById("share-screen").onclick = async () => {
  const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const track = screenStream.getVideoTracks()[0];
  const sender = peer.connections[Object.keys(peer.connections)[0]][0].peerConnection
    .getSenders()
    .find((s) => s.track.kind === "video");
  sender.replaceTrack(track);
};

document.getElementById("record-btn").onclick = () => {
  alert("Recording not yet implemented!");
};
