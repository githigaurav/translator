const {Server}=require('socket.io')
let io; 

// var userID;

const rooms = {}; // Store rooms for each user
function broadCast (message){
  // console.log(message.userid)
io.to(message.userid).emit('message',{message})
}

const webSocket=function(eserver){
     io=new Server(eserver,{
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection",(socket)=>{
      console.log("A user Connected")


      socket.on('joinRoom', (room) => {
        socket.join(room);
        rooms[room ] = socket.id; // Store the room for the user
       
        // console.log(`User ${socket.id} joined room ${room}`);
      });



      socket.on("disconnect",()=>{
        console.log("user has been disconnected")
      })
    })
}



module.exports={webSocket,broadCast}