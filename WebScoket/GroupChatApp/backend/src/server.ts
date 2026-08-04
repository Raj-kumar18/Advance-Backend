import { server } from "./app"
import { io } from "./app"



const ROOM = 'group'

io.on("connection", (socket) => {
    console.log(`A user connected : ${socket.id}`)

    socket.on("joinRoom", async (username) => {
        console.log(username, "is joinig the group")

        await socket.join(ROOM)

        //send to all
        // io.to(ROOM).emit("roomNotice", username)
        //broadcst ka matlab -> jisne join kiya hai usko nahi bhejna hai baki sabb ko bhejna hai 

        socket.broadcast.to(ROOM).emit("roomNotice", username)
    })

    socket.on("chatMessage", (msg) => {
        socket.to(ROOM).emit("chatMessage", msg)
    })

    socket.on("typing", (username) => {
        socket.broadcast.to(ROOM).emit("typing", username)
    })

    socket.on("stopTyping", (username) => {
        socket.broadcast.to(ROOM).emit("stopTyping", username)
    })

})

server.listen(3000, () => {
    console.log("Server is running on port 3000")
})
