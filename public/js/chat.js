const socket = io()

socket.on('countUpdated', (count) => {
    console.log('The count has been udpated!', count)
})

document.querySelector('#increment').addEventListener('click', () => {
    console.log('Clicked')
    socket.emit('increment')
})