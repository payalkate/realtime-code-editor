const express = require('express')
const app = express();   //express obj
const http = require('http');
const {Server} = require('socket.io');
const ACTIONS = require('./src/Action');
const path = require('path');

const server = http.createServer(app); //passing obj to server
const io = new Server(server);  //instance of Server class

app.use(express.static('build')); //express.static is inbuilt middleware. build is static folder which picks index.html file
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
}); 

const userSocketMap = {};    //whenever new user joins, his username and socketid will be stored in map
//map data is stored in our memory, if server restarts all the data will be deleted

function getAllConnectedClients(roomId) {
    //array of socketid
    //io.sockets.adapter.rooms.get(roomId) return type is map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId],
        }
    });    
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    socket.on(ACTIONS.JOIN, ({roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);           //join socket inside room
        const clients = getAllConnectedClients(roomId);    //list of all existing clients
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED, {        //io.to : sends to every socketid
                clients,
                username,
                socketId: socket.id,
            });                 
        })
    });

    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {code});     //send to all clients except the client who send it server
    })

    socket.on(ACTIONS.SYNC_CODE, ({socketId, code}) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {code});     //send to all clients except the client who send it server
    })
    //event before getting disconnected
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms]; //creates array of all the rooms on server
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

