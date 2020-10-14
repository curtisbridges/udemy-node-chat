const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const timeFormat = 'HH:mm.ss'

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on('message', (message) => {
  // console.log(message)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format(timeFormat),
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (locationMessage) => {
  // console.log(url)
  const html = Mustache.render(locationTemplate, {
    username: locationMessage.username,
    url: locationMessage.url,
    createdAt: moment(locationMessage.createdAt).format(timeFormat),
  })
  $messages.insertAdjacentHTML('beforeend', html)
})

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

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser')
  }

  $sendLocationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute('disabled')
        console.log('Location shared!')
      }
    )
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})
