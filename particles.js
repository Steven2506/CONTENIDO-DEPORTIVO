/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for(let i=0;i<70;i++){
particles.push({
x:Math.random()*canvas.width,
y:Math.random()*canvas.height,
size:Math.random()*3+1,
speedX:(Math.random()-0.5)*0.5,
speedY:(Math.random()-0.5)*0.5
});
}

function animate(){

ctx.clearRect(0,0,canvas.width,canvas.height);

ctx.fillStyle="#a200ff";

particles.forEach(p=>{

ctx.beginPath();
ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
ctx.fill();

p.x+=p.speedX;
p.y+=p.speedY;

if(p.x<0||p.x>canvas.width)p.speedX*=-1;
if(p.y<0||p.y>canvas.height)p.speedY*=-1;

});

for(let a=0;a<particles.length;a++){
for(let b=a;b<particles.length;b++){

let dx=particles[a].x-particles[b].x;
let dy=particles[a].y-particles[b].y;
let dist=Math.sqrt(dx*dx+dy*dy);

if(dist<120){
ctx.strokeStyle="rgba(162,0,255,0.2)";
ctx.lineWidth=1;
ctx.beginPath();
ctx.moveTo(particles[a].x,particles[a].y);
ctx.lineTo(particles[b].x,particles[b].y);
ctx.stroke();
}

}
}

requestAnimationFrame(animate);
}

animate();
