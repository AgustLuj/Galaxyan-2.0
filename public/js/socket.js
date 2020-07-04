const socket = io.connect({'forceNew':true});
var con = false; 
function ingresar() {
	socket.emit('users',function(id,color) {
		setId(id);
		setColor(color);
		con=true;
	});
}
socket.on('recharge',function() {
	location.reload();
});
socket.on('setPlayers',function(data) {
	if (con) {
		setPlayers(data);
	}
});
socket.on('setBase',function(data) {
	if (con) {
		gen(data);
	}
});
socket.on('setPlanets',function(data) {
	if (con) {
		setPlanets(data);
	}
});
function emitRoute(data) {

	socket.emit('setRoutes',data);

}
socket.on('getRoute',function(data) {
	if (con) {
		setRoute(data);
	}
});
function cleanRoute(data) {
	socket.emit('cleanRoute',data);
}
socket.on('updatePlanets',function(data) {
	if (con) {
		updatePlanets(data);
	}
});