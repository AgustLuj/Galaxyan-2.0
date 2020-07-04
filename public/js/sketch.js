 
var ID = null;

var W = 0;
var H = 0;

var cr = 0;
var cg = 0;
var cb = 0;

var sx = 0;
var sy = 0;

var ax = 0;
var ay = 0;

var movey = 0;// 1 = up,2 = down
var movex = 0;//1 = right,2 = left

var p = [];
var p2 = [];
var bases = [];
var routes = [];
var booms = [];
var players = [];
var stars = [];
var asteroids = [];

var a = -1;
var b = -1;

var img = null;

var showmap = false;
var flag = false;

/***********************************************/

function Boom(x,y,c){

	this.x = x;
	this.y = y;

	this.c = c;

	this.d = 5;

	this.draw = function(){

		stroke(this.c);
		strokeWeight(1);
		noFill();

		ellipse(this.x + sx,this.y + sy,this.d);

		this.d++;
	}
}

function Ship(x,y,route,c){

	this.x = x;
	this.y = y;

	this.dx = p[route.b].x - this.x;
	this.dy = p[route.b].y - this.y;	

	this.d = createVector(this.dx,this.dy);
	this.old = this.d;

	this.out = false;

	this.vel = random(0.70,1.20);

	this.route = route;

	this.v = createVector(p[route.b].x - this.x,p[route.b].y - this.y);
	this.v.normalize();

	this.c = c;

	this.draw = function(){

		fill(this.c);
		noStroke();

		rect(this.x + sx,this.y + sy,2,2);
	}

	this.update = function(){

		this.x += route.v.x * this.vel + this.v.x;
		this.y += route.v.y * this.vel + this.v.y;

		this.dx = p[route.b].x - this.x;
		this.dy = p[route.b].y - this.y;

		this.d = createVector(this.dx,this.dy);

		if(this.d.mag() > this.old.mag()){
			this.out = true;
		}

		this.old = this.d;
	}
}

function Route(a,b,pop,ok){

	this.id = null;

	this.pid = null;

	this.a = a;
	this.b = b;

	this.pop = pop;
	this.ok= ok;

	this.dx = p[b].x - p[a].x;
	this.dy = p[b].y - p[a].y;

	this.v = createVector(this.dx,this.dy);
	this.v.normalize();

	this.ships = [];

	this.c = color(p[a].r,p[a].g,p[a].b);

	this.pop2 = 0;

	if(this.pop < 1000){this.pop2 = this.pop;}else{this.pop2 = 1000;}

	for(var i = 0;i < this.pop2;i++){
		this.ships.push(new Ship(p[a].x + random(-p[a].d / 2,p[a].d /2),p[a].y + random(-p[a].d / 2,p[a].d /2),this,this.c));
	}

	this.draw = function(){

		for(var i = 0;i < this.ships.length;i++){

			if((this.ships[i].x > p[b].x - p[b].d / 2 && this.ships[i].x < p[b].x + p[b].d / 2 && this.ships[i].y > p[b].y - p[b].d / 2 && this.ships[i].y < p[b].y + p[b].d / 2) || this.ships[i].out){

				booms.push(new Boom(this.ships[i].x,this.ships[i].y,this.c));
				this.ships.splice(i,1);
				
			}else{
				this.ships[i].update();
				if(this.ships[i].x + sx > -5 && this.ships[i].x + sx < W + 5 && this.ships[i].y + sy > -5 && this.ships[i].y + sy < H + 5){this.ships[i].draw();}
			}
		}
	}
}

function Planet(id,x,y,d){

	this.id = id;
	this.pid = 0;

	this.base = false;

	this.x = x;
	this.y = y;

	this.d = d;

	this.pop = 0;
	this.maxpop = Math.ceil(this.d * 4);

	this.c = color(255,0,0);

	this.r = 255;
	this.g = 0;
	this.b = 0;

	this.draw = function(){

		if(this.pid != 0){
			fill(color(this.r,this.g,this.b));
		}else{
			fill(100,100,100);
		}

		if(this.pid == ID){stroke(255);strokeWeight(2);}else{noStroke();}

		ellipse(this.x + sx,this.y + sy,this.d);

		fill(10);
		textSize(18);
		noStroke();

		if(this.pop != 0 && this.pid != 0){

			var xx = (this.x - textWidth(this.pop) / 2) + sx;
			var yy = (this.y + 6) + sy;

			text(this.pop,xx,yy);
		}

		/*fill(255);
		textSize(16);
		text("ID: "+this.id+" PID: "+this.pid,this.x + sx,this.y - 50 + sy);*/
	}
}

function Star(x,y){

	this.x = x;
	this.y = y;
	this.w = random(1,3);

	this.draw = function(){

		fill(255);
		noStroke();
		rect(this.x + sx / 10,this.y + sy / 20,this.w,this.w);
	}
}

function Asteroid(x,y){

	this.x = x;
	this.y = y;
	this.d = random(5,15);

	this.draw = function(){

		fill(138,86,57);
		noStroke();
		ellipse(this.x + sx,this.y + sy,this.d);
	}
}

/*********************************************************************************/

function setup(){

	W = 1000;
	H = windowHeight - 5;

	createCanvas(W,H);

	for(var i = 0;i < 60;i++){
		stars.push(new Star(random(1500) - 250,random(900) - 100));
	}

	img = loadImage("../img/planet.png");
}

function createRing(xx,yy){

	for(i = 0;i < 180;i++){

		var x = Math.sin(radians(((i + random(1,2)) * 2))) * 1000;
		var y = Math.cos(radians(((i + random(1,2)) * 2))) * 1000;

		asteroids.push(new Asteroid(x + xx,y + yy));

		var x = Math.sin(radians(((i + random(1,2)) * 2))) * 975;
		var y = Math.cos(radians(((i + random(1,2)) * 2))) * 975;

		asteroids.push(new Asteroid(x + xx,y + yy));
	}
}

function draw(){

	background(0);

	for(var i = 0;i < stars.length;i++){ //DRAW OF BACK STARS
		stars[i].draw();
	}

	for(var i = 0;i < routes.length;i++){ //DRAW OF ROUTES
		if(routes[i].ok){
			if(routes[i].ships.length > 0){
				routes[i].draw();
			}else{
				cleanRoute({'id':routes[i].id,'pop':routes[i].pop});
				//routes.splice(i,1);
				routes[i].ok=false;
			}
		}
	}

	if(a != -1 && b == -1){    //DRAWING OF PATH
	    
		if(p[a].pid == ID){

			stroke(cr,cg,cb,100);
			strokeWeight(5);

			line(p[a].x + sx,p[a].y + sy,mouseX,mouseY);

		}else {

			a = -1;
			b = -1;
		}
	}

	p2 = [];
	bases = [];

	for(var i = 0;i < p.length;i++){ //PLANETS DRAWING

		//GALACTIC MAP

		if(p[i].pid != 0){
			bases.push(p[i]);
		}

		if(p[i].x + sx > -100 && p[i].x + sx < W + 100 && p[i].y + sy > -100 && p[i].y + sy < H + 100){p[i].draw();p2.push(p[i]);}
	}

	for(var i = 0;i < asteroids.length;i++){ //DRAW OF ASTEROIDS
		if(asteroids[i].x + sx > -50 && asteroids[i].x + sx < W && asteroids[i].y + sy > -50 && asteroids[i].y + sy < H){asteroids[i].draw();}
	}

	for(var i = 0;i < booms.length;i++){ //BOOMS!

		if(booms[i].d > 20){
			booms.splice(i,1);
		}else {
			if(booms[i].x + sx > -100 && booms[i].x + sx < W + 100 && booms[i].y + sy > - 100 && booms[i].y + sy < H){booms[i].draw();}
		}
	}

	//DRAW OF PLAYERS

	fill(0,0,0,100);
	stroke(255);
	strokeWeight(1);

	rect(5,5,55,100,5);

	//rect(900,10,80,30,5);

	noStroke();

	for(var i = 0;i < players.length;i++){ 

		textSize(10);

		if(players[i].on){

			fill(players[i].color.r,players[i].color.g,players[i].color.b); 
			text(players[i].name,12,20 + i * 10);
		}

		/*if(players[i].socket == ID){  //DRAW OF PLANETS QUANTITY

			fill(255);
			textSize(14);
			text(players[i].p,970 - textWidth(players[i].p),30);

			image(img,907,13,22,24);
		}*/
	}

	//DRAW OF UPPER NAME

	if(ID != null){

		textSize(15);

		fill(0);
		stroke(255);
		strokeWeight(1);

		rect(490 - textWidth(ID) / 2,10,textWidth(ID) + 20,30,5);

		noStroke();
		fill(cr,cg,cb);

		text(ID,500 - textWidth(ID) / 2,30);
	}

	//DRAW OF GALACTIC MAP

	if(showmap){

		stroke(255);
		fill(0,0,0,200);
		strokeWeight(1);

		rect(695,H - 155,300,150,10);

		for(var i = 0;i < bases.length;i++){

			fill(bases[i].r,bases[i].g,bases[i].b);
			noStroke();
			rect(700 + bases[i].x / 100,H - 100 + bases[i].y / 100,1,1);

			if(bases[i].base){
				stroke(bases[i].r,bases[i].g,bases[i].b);
				noFill();
				ellipse(700 + bases[i].x / 100,H - 100 + bases[i].y / 100,20);
			}
		}

		stroke(255);
		noFill();

		rect(700 - (sx / 100),(H - 100) - (sy / 100),W / 100,H / 100);

	}else{

		fill(255);
		textSize(12);
		text("PULSÁ 'ESPACIO' PARA VER MAPA",W - 210,H - 10);
	}

	input();
}

function input(){

	if(keyIsDown(87)){
		if(ay < 9){ay += 0.4;}
		movey = 1;
	}else if(keyIsDown(83)){
		if(ay > -9){ay -= 0.4;}
		movey = 2;
	}else{

		if(movey == 1){
			if(ay > 0){ay -= 0.5;}else{ay = 0;movey = 0;}
		}else if(movey == 2){
			if(ay < 0){ay += 0.5;}else{ay = 0;movey = 0;}
		}
	}

	sy += ay;

	if(keyIsDown(65)){
		if(ax < 9){ax += 0.4;}
		movex = 1;
	}else if(keyIsDown(68)){
		if(ax > -9){ax -= 0.4;}
		movex = 2;
	}else{

		if(movex == 1){
			if(ax > 0){ax -= 0.5;}else{ax = 0;movex = 0;}
		}else if(movex == 2){
			if(ax < 0){ax += 0.5;}else{ax = 0;movex = 0;}
		}
	}

	sx += ax;

	if(keyIsDown(32)){
		showmap = true;
	}else{
		showmap = false;
	}

	for(var i = 0;i < p2.length;i++){

		if(p2[i].pid != 0){
			if(mouseX > p2[i].x + sx - p2[i].d / 2 && mouseX < p2[i].x + sx + p2[i].d / 2 && mouseY > p2[i].y + sy - p2[i].d / 2 && mouseY < p2[i].y + sy + p2[i].d / 2){

				noStroke();
				fill(p2[i].r,p2[i].g,p2[i].b);
				text(p2[i].pid,(p2[i].x - textWidth(p2[i].pid) / 2) + sx,p2[i].y + sy - p2[i].d / 2 - 20);
			}
		}
	}

	if(mouseIsPressed){

		if(showmap && mouseX > 700 && mouseX < 1000 && mouseY > H - 155 && mouseY < H - 155 + 150){

			var dx = mouseX - 700;
			var dy = mouseY - (H - 100);

			sx = -dx * 100 + (W / 2);
			sy = -dy * 100 + (H / 2);
		}
	}
}

function mousePressed(){

	var flag = false;

	for(var i = 0;i < p.length;i++){

		if(mouseX > p[i].x + sx - p[i].d / 2 && mouseX < p[i].x + sx + p[i].d / 2 && mouseY > p[i].y + sy - p[i].d / 2 && mouseY < p[i].y + sy + p[i].d / 2){

			flag = true;

			if(a == -1 && p[i].pid == ID){a = p[i].id;}else if(a != -1 && p[i] != p[a]){b = p[i].id;}
		}
	}

	if(!flag && !showmap){
		a = -1;
		b = -1;
	}

	if(a != -1 && b != -1 && a != b){

		var pop = Math.ceil(p[a].pop * 0.25);

		if(((p[a].pid == p[b].pid && p[b].pop < p[b].maxpop) || (p[a].pid != p[b].pid)) && p[a].pop > 0){

			emitRoute({'a':a,'b':b,'pop':pop,'pid':p[a].pid});
		}

		a = -1;
		b = -1;
	}
}

function setId(data){
	ID = data;
}

function setPlayers(data){
	players = data;
}

function setColor(data){

	cr = data.r;
	cg = data.g;
	cb = data.b;
}

function setRoute(data){

	routes.push(new Route(data.a,data.b,data.pop,true));
	routes[routes.length-1].id = data.id;
	routes[routes.length-1].pid = data.pid;
}

function gen(data){

	createRing(data.x,data.y);

	if(data.id == ID && !flag){
		sx = -data.x + 500;
		sy = -data.y + 350;
		flag = true;
	}
}

function setPlanets(data){

	p = [];

	for(var i = 0;i < data.length;i++){

		p.push(new Planet(data[i].id,data[i].x,data[i].y,data[i].d));

		p[i].pid = data[i].pid;
		p[i].pop = data[i].pop;

		p[i].r = data[i].color.r;
		p[i].g = data[i].color.g;
		p[i].b = data[i].color.b;

		if(data[i].base){
			p[i].base = data[i].base;
		}
	}
}

function updatePlanets(data){

	for(var i = 0;i < data.length;i++){

		if(p[i].id == data[i].id){

			p[i] = new Planet(data[i].id,data[i].x,data[i].y,data[i].d);

			p[i].pid = data[i].pid;
			p[i].pop = data[i].pop;

			p[i].r = data[i].color.r;
			p[i].g = data[i].color.g;
			p[i].b = data[i].color.b;
		}
	}
}

