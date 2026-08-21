(() => {
  const canvas = document.getElementById("particles");
  if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  const particles = Array.from({length: 48}, () => ({x:0,y:0,size:0,vx:0,vy:0}));
  let width = 0, height = 0, frame = 0;
  function resize(){width=canvas.width=innerWidth;height=canvas.height=innerHeight;particles.forEach(p=>{p.x=Math.random()*width;p.y=Math.random()*height;p.size=Math.random()*2+1;p.vx=(Math.random()-.5)*.35;p.vy=(Math.random()-.5)*.35;});}
  function draw(){ctx.clearRect(0,0,width,height);ctx.fillStyle="#a200ff";particles.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>width)p.vx*=-1;if(p.y<0||p.y>height)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();for(let j=i+1;j<particles.length;j++){const q=particles[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);if(d<110){ctx.strokeStyle=`rgba(162,0,255,${.16*(1-d/110)})`;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}}});frame=requestAnimationFrame(draw);}
  addEventListener("resize",resize,{passive:true});document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelAnimationFrame(frame);else draw();});resize();draw();
})();
