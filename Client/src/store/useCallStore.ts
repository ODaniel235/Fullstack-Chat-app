import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
import { create } from "zustand";

// Initialize Socket.IO client
const socket = io("http://localhost:5000"); // Replace with your server's URL

const useCallStore = create((set, get) => ({
  incomingCall: false,
  incomingCallData: null,
  inCall: false,
  callerData: null,
  callData: null,
  peer: null,
  stream: null,
  remoteStream: null,

  // Actions
  setCallData: (data) => {
    set({
      inCall: true,
      callerData: get().incomingCallData?.callerData || data.callerData,
      callData: data.callData,
      incomingCall: false,
      incomingCallData: null,
    });
  },
  setIncomingCall: (data) => {
    set({ incomingCall: true, incomingCallData: data });
  },
  setPeer: (peer) => {
    set({ peer });
  },
  setStream: (stream) => {
    set({ stream });
  },
  setRemoteStream: (stream) => {
    set({ remoteStream: stream });
  },
  getLocalStream: async () => {
    try {
      /*       const callType = get().incomingCallData?.type === "video" ? true : false; */
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      get().setStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  },
  initiateCall: async (receiverId: string) => {
    try {
      console.log("Initiaitng");
      const stream = await get().getLocalStream();
      const peer = new SimplePeer({ trickle: true, initiator: true, stream });
    } catch (error) {
      console.log("Error====>", error);
    }
  },
  answerCall: async (remoteSignal) => {
    const stream = await get().getLocalStream();
    const peer = new SimplePeer({
      trickle: false,
      initiator: false,
      stream,
    });

    peer.signal(remoteSignal);

    peer.on("signal", (signal) => {
      socket.emit("answerSignal", { signal, to: get().incomingCallData?.from });
    });

    peer.on("stream", (remoteStream) => {
      get().setRemoteStream(remoteStream);
    });

    peer.on("error", (err) => console.error("Peer error:", err));
    peer.on("close", () => get().wipeCallData());

    get().setPeer(peer);
  },
  wipeCallData: () => {
    const peer = get().peer;
    if (peer) peer.destroy();
    set({
      inCall: false,
      callData: null,
      callerData: null,
      peer: null,
      stream: null,
      remoteStream: null,
    });
  },
}));

export default useCallStore;
