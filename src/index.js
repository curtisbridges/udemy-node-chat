const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, '../public')))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.emit('sendMessage', 'Welcome!')
    socket.broadcast.emit('message', 'A new user has joined.')

    socket.on('sendMessage', (message) => {
        io.emit('sendMessage', message)
    })

    socket.on('sendLocation', (position) => {
        io.emit('message', `Location: ${position.latitude}, ${position.longitude}`)
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left.')
    })
})

server.listen(port, () => {
    console.log(`Server started http://localhost:${port}`)
})
