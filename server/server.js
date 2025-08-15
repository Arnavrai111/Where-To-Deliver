
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const {handleSocketConnection} = require('./socketHandlers');
const locationRoute = require('./routes/locationRoute');
dotenv.config();
const app = express(); 
app.use(cors({
    origin: '*', //Allow all origins for simplicity; adjust as needed
    methods: ['GET','POST'],
    credentials: true, //Allow credential if needed
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors : {
        origin: '*', //Allow all origins for simplicity; adjust as needed
        methods: ['GET','POST'],
        credentials: true,

    },
});
app.use(express.json());


app.get('/',(req, res) =>{
    res.send('Hello from the server!');
});

app.use('/api/locations', locationRoute);

io.on('connection', (socket) => {
    handleSocketConnection(socket,io);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}` );
});