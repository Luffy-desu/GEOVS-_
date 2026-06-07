const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let rooms = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', (roomCode) => {
        if (!rooms[roomCode]) rooms[roomCode] = { players: [], seed: null, round: 0 };
        if (rooms[roomCode].players.length < 2) {
            socket.join(roomCode);
            rooms[roomCode].players.push(socket.id);
            socket.emit('joined', { role: rooms[roomCode].players.length });
            
            if (rooms[roomCode].players.length === 2) {
                startRound(roomCode);
            }
        }
    });

    socket.on('submitAnswer', (data) => {
        // Logic for scoring would go here to calculate based on timestamp
        io.to(data.room).emit('playerSolved', { player: socket.id, time: data.time });
    });
});

function startRound(roomCode) {
    const seed = Math.floor(Math.random() * 10000);
    io.to(roomCode).emit('newRound', { seed });
}

http.listen(process.env.PORT || 3000, () => console.log('Server running'));