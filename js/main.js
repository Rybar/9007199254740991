(()=>{
  var t = 0, last = 0, now = 0,

  playerX = WIDTH/2, playerY = HEIGHT/2,



load=()=>{
  //load external non-script assets
  init();
}

init=()=>{
  //state vars, initial game state
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
if(Key.isDown(Key.d))playerX++;
else if(Key.isDown(Key.a))playerX--;
if(Key.isDown(Key.w))playerY--;
else if(Key.isDown(Key.s))playerY++;
}

draw=(dt)=>{
 clear(1);
 fillRect(playerX, playerY, 8, 8, 4);
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

loop();

})();
