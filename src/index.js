const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

app.use(express.static(path.join(__dirname, '../public')))

// socket.emit - send to a specific client
// io.emit - send to all clients
// socket.broadcast.emit - send to every client other than origin
// io.to(channel).emit - send to everyone in a channel
// io.broadcast.to(channel).emit - send to everyone in a channel other than origin

io.on('connection', (socket) => {
  console.log('New WebSocket connection')

  // events for joining a chat room
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room })

    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    // send a message to newly connected clients.
    socket.emit('message', generateMessage('📢', 'Welcome!'))
    // send a message to all clients on new connections.
    socket.broadcast
      .to(user.room)
      .emit('message', generateMessage('📢', `${user.username} has joined.`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    })

    callback()
  })

  // when the server receives a 'sendMessage', send it out to all clients.
  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    const user = getUser(socket.id)
    if (user) {
      io.to(user.room).emit('message', generateMessage(user.username, message))
      callback()
    }
  })

  // when the server receives a 'sendLocation', send that location to all clients.
  socket.on('sendLocation', (position, callback) => {
    const user = getUser(socket.id)

    if (user) {
      io.emit(
        'locationMessage',
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${position.latitude},${position.longitude}`
        )
      )
      callback()
    }
  })

  // notify all clients that someone disconnected.
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit('message', generateMessage('📢', `${user.username} has left.`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      })
    }
  })
})

server.listen(port, () => {
  console.log(`Server started http://localhost:${port}`)
})
