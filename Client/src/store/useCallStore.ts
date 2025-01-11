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
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: get().callData?.type == "video",
        },
        stream,
        config: {
          iceServers: [
            {
              urls: "stun:numb.viagenie.ca",
            },
            {
              urls: "turn:numb.viagenie.ca",
              username: "username",
              credential: "password",
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
    try {
      const socket = useAuthStore.getState().socket;
      if (!socket) {
        console.log("Socket refused");
        return;
      }

      if (!remoteSignal) {
        console.error("Invalid remoteSignal received.");
        return;
      }
      const stream = await get().getLocalStream();
      if (!stream) {
        console.log("Local stream is null or undefined.");
        return;
      }
      
      const peer = new SimplePeer({
        trickle: true,
        initiator: false,
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: get().callData?.type == "video",
        },
        stream,
        config: {
          iceServers: [
            {
              urls: "stun:numb.viagenie.ca",
            },
            {
              urls: "turn:numb.viagenie.ca",
              username: "username",
              credential: "password",
            },
          ],
        },
      });

      // Update state
      set({
        inCall: true,
        incomingCall: false,
        callData: get().incomingCallData,
      });

      // Handle incoming signal from the caller
      peer.signal(remoteSignal);

      // Handle outgoing signal to the caller
      peer.on("signal", (signal) => {
        console.log("Sending answer signal to the backend:", {
          signal,
          to: get().incomingCallData?.callerData.id,
          socket,
        });

        socket.emit("answerCall", {
          signal,
          to: get().incomingCallData?.callerData.id,
          type: "audio",
        });
      });

      // Handle the remote stream
      peer.on("stream", (remoteStream) => {
        console.log("Remote stream received.");
        get().setRemoteStream(remoteStream);
      });

      // Handle errors
      peer.on("error", (err) => {
        console.error("Peer connection error:", err);
        get().wipeCallData();
      });

      // Handle call closure
      peer.on("close", () => {
        console.log("Call ended.");
        get().wipeCallData();
      });

      // Save the peer instance
      get().setPeer(peer);
    } catch (error) {
      console.error("Error answering call:", error);
      get().wipeCallData();
    }
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
