const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Import socket.io
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Create an HTTP server
const server = http.createServer(app);

// Configure Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (adjust as needed for security)
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Listen for the pickupSuccess_sender event
    socket.on('pickupSuccess_sender', (data) => {
        console.log('Received pickupSuccess_sender event:', data);

        // Broadcast the event to all connected clients
        io.emit('pickupSuccess', { message: 'Picked up!', rideId: data.rideId });
    });

    socket.on("booked_sender", (data) => {
        console.log('Received booked_sender event:', data);

        // Broadcast the event to all connected clients
        io.emit('bookedSucess', { message: 'Picked up!', rideId: data.rideId });
    })

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// Define a simple route
app.get('/', (req, res) => {
    res.send('Socket.IO server is running.');
});

// const createRide = async (rideData) => {
//     try {
//       // Save ride to the database (your existing logic)
//       const newRide = await saveRideToDatabase(rideData);
  
//       // Emit the event to all connected clients
//       io.emit("rideCreated", newRide);
  
//       return newRide;
//     } catch (error) {
//       console.error("Error creating ride:", error);
//       throw error;
//     }
//   };

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});