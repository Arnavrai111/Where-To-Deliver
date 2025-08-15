const { calculateDistanceAndEta } = require("./controlers/locationController");
let roomUsers = {};

const handleSocketConnection=(socket,io) => {
  console.log('A user connected:',socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    socket.roomId = roomId;
    if(!roomUsers[roomId]) roomUsers[roomId] = {};
    roomUsers[roomId][socket.id] = {};
  });
  socket.on('locationUpdate',async (data) => {
    const {lat , lng} = data;
    const roomId = socket.roomId;
    if(!roomId) return;
    roomUsers[roomId][socket.id] = {lat , lng};

    //calculate distance/ETA for all Room
    const users = roomUsers[roomId];
    const updateUsers = await Promise.all(
        Object.keys(users).map(async (id) => {
            let distance = null , duration = null;
            if(users[socket.id] && users[id]){
                try {
                    if( id !== socket.id){
                        const result = await calculateDistanceAndEta(users[id], users[socket.id]);
                        distance = result.distance;
                        duration = result.duration;
                    }

                } catch (error) {
                    distance = 'N/A';
                    duration = 'N/A';
                }
            }
            return{
                userId : id,
                lat: users[id].lat,
                lng: users[id].lng,
                distance,
                eta:duration,
            };
        })
    )
    io.to(roomId).emit('user-offline', updateUsers); //user-offline
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const roomId = socket.roomId;
    if( roomId && roomUsers[roomId]){
        delete roomUsers[roomId][socket.Id];
        io.to(roomId).emit('user-offline',Object.keys(roomUsers[roomId]).map(id=>({
            userId: id,
            ...roomUsers[roomId][id] // Include lat and lng of remaining users
        })));
        if(Object.keys(roomUsers[roomId]).length === 0) {
            delete roomUsers[roomId]; // Remove the room if no users left
        }
    }
  });
}

module.exports = {handleSocketConnection};