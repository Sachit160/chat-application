const socket = io() 

// ELements
const $messageForm = document.querySelector('#formmy')
const $messageFormInput = $messageForm.querySelector('#data')
const $messageFormButton = $messageForm.querySelector('#message-button')
const $locationButton = document.querySelector('#send-location')
$messages = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate =document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () =>{
     // New message element
     const $newMessage = $messages.lastElementChild

     //Height of the new message
     const newMessageSytles = getComputedStyle($newMessage)
     const newMessageMargin = parseInt(newMessageSytles.marginBottom)
     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container 
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled ?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if((containerHeight - newMessageHeight )<= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    // console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable button
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.data.value
    socket.emit('sendMessage',message,(error)=>{
       
        //enablebutton
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        // console.log('The message was delivered!')
    })
})

$locationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }
    //disable
    $locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
    // console.log(position)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $locationButton.removeAttribute('disabled')
            // console.log('Location Shared!')
        })
    })
})

socket.on('locationMessage',(message)=>{
    const html = Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData',({room , users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML =html
})