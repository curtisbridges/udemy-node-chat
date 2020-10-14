const socket = io()

// Elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()

  // disable form
  $messageFormButton.setAttribute('disabled', 'disabled')

  const message = e.target.elements.message.value
  socket.emit('sendMessage', message, (error) => {
    // enable form
    $messageFormButton.removeAttribute('disabled')
    // clear input and focus text area
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if (error) {
      console.log(error)
    } else {
      console.log('Message delivered.')
    }
  })
})

socket.on('message', (message) => {
  console.log(message)
})

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
  }

  $sendLocationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('sendLocation', {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
        $sendLocationButton.removeAttribute('disabled')
        console.log('Location shared!')
    })
  })
})
