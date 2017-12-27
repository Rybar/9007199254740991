(()=>{
  var t = 0, last = 0, now = 0,

  playerX = WIDTH/2, playerY = HEIGHT/2,

  blocks = [];




load=()=>{
  //load external non-script assets
  init();
}

init=()=>{
  //state vars, initial game state
  let i = 1000;
  while(--i){
    blocks.push(
      Math.random()*1000|0, //x
      Math.random()*1000|0, //y
      Math.random()*10+5|0, //WIDTH
      Math.random()*10+5|0, //HEIGHT
    )
  }
  console.log(blocks)
  loop();
}

loop=()=>{
    last = now;
    now = new Date().getTime();
    dt = Math.min(1, (now - last) / 1000);
    t += dt;

    step(dt);
    draw(dt);

  render(dt);
  requestAnimationFrame(loop);

}

step=(dt)=>{
if(Key.isDown(Key.d))       { playerX++; viewX++}
else if(Key.isDown(Key.a))  { playerX--; viewX--;}
if(Key.isDown(Key.w))       { playerY--; viewY--;}
else if(Key.isDown(Key.s))  { playerY++; viewY++;}
}


draw=(dt)=>{
 clear(30);
 //let i = blocks.length;
 for(let i = 0; i < blocks.length; i++){
   if(i%4==0)fillRect(blocks[i]-viewX, blocks[i+1]-viewY, blocks[i+2], blocks[i+3], 21);
 }
 fillRect(playerX-viewX, playerY-viewY, 8, 8, 4);

}

window.addEventListener('keyup', function (event) {
  Key.onKeyup(event);
}, false);
window.addEventListener('keydown', function (event) {
  Key.onKeydown(event);
}, false);
window.addEventListener('blur', function (event) {
  paused = true;
}, false);
window.addEventListener('focus', function (event) {
  paused = false;
}, false);

load();

})();
