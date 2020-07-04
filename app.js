var express = require('express');
var app = express(); 
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('public'));
/****************************************/
var f=new Date();
cad=f.getHours()+":"+f.getMinutes()+":"+f.getSeconds(); 
var user = [];
var soc=true;
var id = 0;
var planets = genPlants();
var routes =[];
var routes_id =0;
var bases = 1;
/******************************************/
io.on('connection',function(socket) {
	console.log("Se a conectado una persona "+socket.id);

	if(soc){
		io.emit('recharge');
		soc=false;
	}

	socket.on('users',function(fn) {
		var color = genBase(socket.id);
		user.push({
			'socket_id':socket.id,
			'name':socket.id.substring(socket.id.length-6,socket.id.length),
			'id':id,
			'color':color.color,
			'p':1,
			'e':50,
			'on':true
		});

		fn(socket.id,color.color)
	
		id++;
	
		io.emit('setPlayers',user);
		planets.forEach(({base,x,y,pid})=>{
			if(base != null){
				io.emit('setBase',{'x':x,'y':y,'id':pid});
			} 
		})
	});

	socket.on('setRoutes',function({a,b,pop,pid}) {
		let h ={}
		planets.forEach(({id,color},i)=>{
			if(id == a ){
				h={a, b, pop, id: routes_id,pid, color,ok:true,};
				planets[i].pop -= pop;	
			}
		})
		routes.push(h);
		io.emit('getRoute',h);
		routes_id++;
		
	});

	socket.on('disconnect',function() {
		user.find(({socket_id},i)=>{
			if(socket_id === socket.id){
				planets.find(({pid},j)=>{
					if (pid == socket.id) {
						planets[j].pid = 0;
						planets[j].pop = 0;
						io.emit('setPlanets',planets);
						user[i].on=false;
						io.emit('setPlayers',user);
					}
				})
			}
		})
	});
	socket.on('cleanRoute',function(data){
		var rou = true;
		routes.find((route,i)=>{
			try{
				if(route.id == data.id || route.ok){
					if (routes[i].a != undefined && routes[i].b != undefined){
						if(planets[routes[i].b].pid == 0 && planets[routes[i].b].pop == 0){ //conquista de neutro (PID B = 0)
							//var a = info(1,planets[routes[i].a].pid)
							planets[routes[i].b].pid = routes[i].pid;
							planets[routes[i].b].pop = data.pop;
							planets[routes[i].b].color = routes[i].color;
							//user[a].p++;
						}else if(planets[routes[i].b].pid == routes[i].pid){ //mismo planeta (PID A = PID B)
							planets[routes[i].b].pop += data.pop;
						}else if(planets[routes[i].b].pid != routes[i].pid){ //conquista otra base (PID A != PID B)
							planets[routes[i].b].pop -= data.pop;
							if(planets[routes[i].b].pop <= 0){
								//var a = info(1,planets[routes[i].a].pid);
								//var b = info(1,planets[routes[i].b].pid);
								//user[b].p -=1;
								//user[a].p++;
								planets[routes[i].b].pid = routes[i].pid;
								planets[routes[i].b].pop = -planets[routes[i].b].pop;
								planets[routes[i].b].color = routes[i].color;
							}
						}
						io.emit('setPlayers',user);
						io.emit('updatePlanets',[planets[routes[i].a],planets[routes[i].b]]);
						routes[i].ok=false;
						//routes.splice(i,1);
					}
				}
			}catch{
				console.log("un fallo :S")
			}
			
		})
	})
});

server.listen(80,function() {

	console.log('El servidor esta corriendo en 8080 '+cad);

});

/***********************************************************/
function genBase(name) {

	var x  = bases * 4000;
	var y  = Math.random() * 700;
	var id_planet = planets.length;

	var plane={
		'x':x,
		'y':y,
		'd':150,
		'base':true,
		'id':id_planet,
		'pid':name,
		'pop':50,
		'color':{
			r:Math.floor((Math.random() * 200) + 50),
			g:Math.floor((Math.random() * 200) + 50),
			b:Math.floor((Math.random() * 200) + 50),
		},
	};

	id_planet++;
	bases++;

	planets.push(plane);

	return plane;

}
function info(tp,data) {
	if (tp == 1) {
		for (var i = 0; i < user.length; i++) {
			if(user[i].socket_id == data ){
				return i;
			}
		}
	}
	if (tp == 2) {
		for (var i = 0; i < planet.length; i++) {
			if(planet[i].pid == data){
				return planets[i];
			}
		}
	}
}

function genPlants(){

	var planets=[];
	var id_planet = planets.length;

	var xx = -1000;

	var c = 0;

	for(var i = 0;i < 100;i++){

		for(var j = 0;j < 100;j++){

			xx += 300 + (Math.random() * 800);
			
			var rad = 40 + (Math.random() * 80);

			planets.push({'x':xx,'y': (i * 300),'d':rad,'id':id_planet,'pid':0,'pop':0,color:{r:100,g:100,b:100,}});
			id_planet++;

			c++;
		}

		xx = 0;
	}
	return planets;
}

/********************** Game Loop *************************/
var juego =(function(argument) {
	var timer,velocidad = 250;

	function actualizar() {
		var cont = 0;
		for (var i = 0; i < planets.length; i++) {
			for (var j = 0; j < user.length; j++) {
				if(user[j].socket_id == planets.pid){
					cont++;
					user[j].p = cont;
				}
			}
			if(planets[i].pop > 0 && planets[i].pip != 0 ){
				if(planets[i].pop < planets[i].d*4 && planets[i].pop >= 0){
					planets[i].pop++;
				}else if(planets[i].pop > (planets[i].d*4)+1) {
					reducir_max(planets[i].id);
				}
			}
		}
	}
	function reducir_max(i) {
		planets[i].pop -=3 ;
	}
	function enviar() {
		for (var i = 0; i < user.length; i++) {
			io.to(user[i].socket_id).emit('setPlanets',planets);
			io.to(user[i].socket_id).emit('setPlayers',user);
		}
	}
	function loop() {
		actualizar();
		enviar();
		timer = setTimeout(loop,velocidad);
	}
	return{
		iniciar : function() {
			loop();
		},
		detener:function() {
			clearTimeout(timer);
		}
	}
})();

juego.iniciar();
/***********************************************************/