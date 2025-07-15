import { Server as ServerHttp } from "http"
import { Server, Socket } from "socket.io"
const initSocket = (httpServer: ServerHttp) => {
    const io = new Server(httpServer, {
        cors: {
            origin: 'http://localhost:3000'
        }
    })
    io.on('connection', async (socket: Socket) => {
        socket.on('open-comment-task', (taskId: string) => {
            socket.join(taskId)
        })

        socket.on('send-comment', (data: { taskId: string, message: string }) => {
            io.to(data.taskId).emit('receive-comment', data.message)
        })
    })
    return io
}

export default initSocket;