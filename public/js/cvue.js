var app4 = new Vue({
  el: '#chat',
  data: {
  	message: '',
    todos:[]
  },
  methods: {
    enviar: function () {
      socket.emit('sendChat',this.message);
    }
  }
});
socket.on('getChat',function (argument) {
	app4.message.push()
})