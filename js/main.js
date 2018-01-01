(()=>{
  var stats = new Stats();
  stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );

  var t = 0, last = 0, now = 0,

  chunkWidth = 32, chunkHeight = 32, //actually radius or half of chunk

  //worldWidth = Math.pow(2^54)

  playerX = 0, playerY = 0,

  viewX = playerX - WIDTH/2, viewY = playerY - HEIGHT/2,
  blocks = [], lcg = new LCG(), starColors, currentChunk, moved,

  gp = {},




load=()=>{
  //load external non-script assets
  init();
}

init=()=>{
  chunkCoords = [0,0];
  currentChunk = [0,0];
  moved = 0;
  lcg.setSeed(chunkCoords[0] * 314159 + chunkCoords[1] * 314159);
  starColors = [17,18,19,20,21,22];
  generateChunk(chunkCoords);
  loop();
}

generateChunk=(coords)=>{
  lcg.setSeed(coords[0] * 314159 + coords[1] * 314159);

  let i = 80,
  x = coords[0] * chunkWidth * 2,
  left = x-chunkWidth,
  right = x+chunkWidth,
  y = coords[1] * chunkWidth * 2,
  top = y - chunkWidth,
  bottom = y + chunkWidth;
  console.log(left,right,top,bottom);

  while(--i){
    blocks.push(
      lcg.nextIntRange(left, right), //x
      lcg.nextIntRange(top, bottom), //y
      0, //WIDTH or Radius
      0, //HEIGHT
      starColors[lcg.nextIntRange(0,5)], //color
      3, //type 0:block, 1:circle, 2: filledCircle, 3:dot
    )
  }
  let j = 10;
  while(--j){
    blocks.push(
      lcg.nextIntRange(left,right), //x
      lcg.nextIntRange(top,bottom), //y
      lcg.nextIntRange(5,10), //WIDTH or Radius
      lcg.nextIntRange(5,10), //HEIGHT
      lcg.nextIntRange(0,63), //color
      lcg.nextIntRange(0,2), //type 0:block, 1:circle, 2: filledCircle, 3:dot
    )
  }
  console.log(blocks.length);
}

drawThings=(dt)=>{

  for(let i = 0; i < blocks.length; i+=6){
      let x = blocks[i]-viewX,
       y = blocks[i+1]-viewY,
       c = blocks[i+4],
       wr = blocks[i+2],
       h = blocks[i+3],
       type = blocks[i+5],
       p = 60; //overscan check to prevent popping and too much overdraw

       //now we need to generate new chunks at the edges instead of wrapping

       // if(x+playerX < worldWidth + WIDTH/2 && x < 0-p)x += worldWidth;
       // if(x-playerX > WIDTH/2 && x > WIDTH+p)x -= worldWidth;
       // if(y+playerY < worldHeight + HEIGHT/2 && y < 0-p)y += worldHeight;
       // if(y-playerY > HEIGHT/2 && y > HEIGHT+p)y -= worldHeight;

      if(x > 0-p && x < WIDTH+p && y > 0-p && y < HEIGHT+p){
        switch(type){
          case 0:
          let i = 5;
          while(i--){
            fillCircle(x+Math.random()*6-3,y+Math.random()*6-3, wr, c);
          }
          //fillRect(x, y, wr, h, c);
          break;
          case 1:
          circle(x,y, wr, c);
          break;
          case 2:
          fillCircle(x*1.1,y*1.1, wr, c);
          case 3:
          pset(x, y, c);
          break;
        }
      }
    }

}
drawPlayer=()=>{
  fillRect(playerX-viewX, playerY-viewY, 8, 8, 4);
}

drawMiniMap=(dt)=>{
  let scalar = 64/10000,
  x = 320-70,
  y = 180-70;
  fillRect(x,y, 64,64, 1);
  for(let i = 0; i < blocks.length; i+=6){
      let ex = blocks[i]*scalar,
       ey = blocks[i+1]*scalar,
       c = blocks[i+4],
       wr = blocks[i+2],
       h = blocks[i+3],
       type = blocks[i+5],
       p = 100;

      if(type == 2 && wr > 23){
          pset(x + ex,y + ey,30)
      }
    }
    pset(x+playerX*scalar, y+playerY*scalar, 4);

}

function buttonPressed(b) {
  if (typeof(b) == "object") {
    return b.pressed;
  }
  return b == 1.0;
}

loop=()=>{
  stats.begin();
  var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
  gp = gamepads[0];
  t++;

  step(t);
  draw(t);

  render(t);

  stats.end();
  requestAnimationFrame(loop);

}

step=(dt)=>{
  //keyboard input
  if(Key.isDown(Key.d) || Key.isDown(Key.RIGHT)) playerX++;
  else if(Key.isDown(Key.a)|| Key.isDown(Key.LEFT)) playerX--;
  if(Key.isDown(Key.w)|| Key.isDown(Key.UP)) playerY--;
  else if(Key.isDown(Key.s)|| Key.isDown(Key.DOWN)) playerY++;

  //gamepad input
  if(gp){
    if(buttonPressed(gp.buttons[3]) ) playerX++;
    else if(buttonPressed(gp.buttons[2]) ) playerX--;
    if(buttonPressed(gp.buttons[0]) ) playerY--;
    else if(buttonPressed(gp.buttons[1]) ) playerY++;

    if(Math.abs(gp.axes[0]) > .1)playerX+= 5 * gp.axes[0]; //allow for deadzone
    if(Math.abs(gp.axes[1]) > .1)playerY+= 5 * gp.axes[1];
  }

  chunkCoords[0] = playerX / (chunkWidth) | 0;
  chunkCoords[1] = playerY / (chunkWidth) | 0;

  if(chunkCoords[0] != currentChunk[0] || chunkCoords[1] != currentChunk[1]){
    //moved++;
    currentChunk[0] = chunkCoords[0];
    currentChunk[1] = chunkCoords[1];
    generateChunk(chunkCoords);
  }
  viewX = playerX - WIDTH/2; viewY = playerY - HEIGHT/2;
}


draw=(dt)=>{
 clear(30);
 drawThings();
 drawPlayer();
 //drawMiniMap();
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
window.addEventListener("gamepadconnected", function(e) {
  console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index, e.gamepad.id,
    e.gamepad.buttons.length, e.gamepad.axes.length);
});

load();


})();
