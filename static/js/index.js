 const socket = io()



socket.on('connect', function(){
  let input = document.getElementsByClassName('test')
  input.value = "접속됨"
})

function send(){
  let message = document.getElementById('test').value;
  // console.log(message + "메세지")
  console.log(document.getElementById('test').value)
  document.getElementById('test').value = ''

  socket.emit('send',{msg: message})
}
