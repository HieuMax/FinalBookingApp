import { io, Socket } from "socket.io-client";
import { baseURL_server } from './index';

let socket: Socket | null = null;
// console.log(`baseURL_server: ${baseURL_server}`);
export const getSocket = () => {
  if (!socket) {
    socket = io(baseURL_server, {
        transports: ["websocket"],
        reconnection: true, // Automatically reconnect
        reconnectionAttempts: 5, // Retry up to 5 times
        reconnectionDelay: 1000, // Wait 1 second between retries
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  return socket;
};