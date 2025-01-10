import { io } from "socket.io-client";
import { create } from "zustand";
import SimplePeer from "simple-peer";
import useAuthStore from "./useAuthStore";
// Initialize Socket.IO client
const socket = io("http://localhost:5000"); // Replace with your server's URL

const useCallStore = create<any>((set, get) => ({
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
    set({
      incomingCall: true,
      incomingCallData: data.callData,
      callerData: data.callerData,
      callData: { initiator: false, ...data.callData },
    });
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
        /*      video: callType, */
      });

      get().setStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  },
  initiateCall: async (receiverData: any) => {
    try {
      const socket = useAuthStore.getState().socket;
      if (!socket) {
        console.log("Socket refused");
        return;
      }
      console.log("Initiaitng");
      const stream = await get().getLocalStream();

      const peer = new SimplePeer({
        trickle: true,
        initiator: true,
        stream,
        config: {
          iceServers: [
            {
              urls: "stun:stun.l.google.com:19302", // Google’s public STUN server
            },
          ],
        },
      });
      set({
        inCall: true,
        callerData: {
          name: receiverData.name,
          id: receiverData.id,
          avatar: receiverData.avatar,
        },
        callData: { initiator: true, type: "audio" },
      });
      peer.on("signal", (signal) => {
        console.log("Send this signal to the remote peer: ", signal);
        // Send the signal via WebSocket or any signaling server
        socket.emit("sendSignal", {
          signal,
          from: useAuthStore.getState().userData,
          to: receiverData.id,
          type: "audio",
        });
      });

      peer.on("stream", (remoteStream) => {
        console.log("Remote stream received");
        get().setRemoteStream(remoteStream);
      });

      peer.on("error", (err) => console.error("Peer error:", err));

      peer.on("close", () => {
        console.log("Call ended");
        get().wipeCallData();
      });

      get().setPeer(peer);
    } catch (error) {
      console.log("Error====>", error);
    }
  },
  answerCall: async (remoteSignal: any) => {
    console.log("Signal===>", remoteSignal);
    const stream = await get().getLocalStream();
    console.log(remoteSignal);
    const peer = new SimplePeer({
      trickle: false,
      initiator: false,
      stream,
      config: {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302", // Google’s public STUN server
          },
        ],
      },
    });
    set({
      inCall: true,
      incomingCall: false,
      callData: get().incomingCallData,
    });

    peer.signal(remoteSignal);

    peer.on("signal", (signal) => {
      console.log("Signals sent===>", {
        signal,
        to: get().incomingCallData?.callerData.id,
       });

      socket.emit("answerSignal", {
        signal,
        to: get().incomingCallData?.callerData.id,
        type: "audio",
      });
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
      incomingCall: false,
      incomingCallData: null,
      callerData: null,
      peer: null,
      stream: null,
      remoteStream: null,
    });
  },
}));

export default useCallStore;
