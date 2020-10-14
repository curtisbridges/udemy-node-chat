const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, '../public')))


io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    // send a message to newly connected clients.
    socket.emit('sendMessage', 'Welcome!')
    // send a message to all clients on new connections.
    socket.broadcast.emit('message', 'A new user has joined.')

    // when the server receives a 'sendMessage', send it out to all clients.
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        io.emit('message', message)
        callback()
    })

    // when the server receives a 'sendLocation', send that location to all clients.
    socket.on('sendLocation', (position, callback) => {
        io.emit('message', `https://google.com/maps?q=${position.latitude},${position.longitude}`)
        callback()
    })

    // notify all clients that someone disconnected.
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left.')
    })
})

server.listen(port, () => {
    console.log(`Server started http://localhost:${port}`)
})
