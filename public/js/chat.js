const socket = io()
const $messageForm = document.querySelector('#messageForm')
const $joinForm = document.querySelector('#joinForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

const $locationButton = document.querySelector('#share-location')
const $joinButton = document.querySelector('#join-button')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true }) //tarayıcıdaki parametreleri aldı

socket.on('information', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    let message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) =>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value =''
        $messageFormInput.focus()
        if(error) {
            return console.log(error)
        }
        console.log(message)
        window.scrollTo(0, document.body.scrollHeight); 
        var objDiv = document.getElementById("messages"); //scroll
        objDiv.scrollTop = objDiv.scrollHeight;
    }) //kursta sendMessage
})
socket.on('message', (message, userName) => {
    console.log('Welcome, ' + message)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        userName: userName
    })
    $messages.insertAdjacentHTML('beforeend', html)
})
socket.on('locationMessage', (url, userName) => {
    console.log(url)    
    const html = Mustache.render(locationTemplate, {
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm'),
        userName: userName
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('geolocation is not supported by your browser')
    }
    $locationButton.setAttribute('disabled', 'disabled')
        navigator.geolocation.getCurrentPosition((position) => {
            socket.emit('location', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, ()=> {
                console.log('Location has been shared')
                $locationButton.removeAttribute('disabled')
                var objDiv = document.getElementById("messages"); //scroll
                objDiv.scrollTop = objDiv.scrollHeight;
            })
        })
})
socket.emit('join', {
    username,
    room}, (error) => {
        if(error){
        alert(error)
        location.href = '/' //tarayıcıyı başlangıça götür
        }
    })
