(()=>{
  var stats = new Stats();
  stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );

  var t = 0, last = 0, now = 0,

  chunkWidth = 360, //actually radius or half of chunk

  playerX = 0, playerY = 0,

  viewX = playerX - WIDTH/2, viewY = playerY - HEIGHT/2,
  blocks,
  lcg = new LCG(), scrNG = new LCG(), starColors, currentChunk, generated = [],

  gp = {};

load=()=>{
  //load external non-script assets
  init();
}

init=()=>{
  chunkCoords = [0,0];
  currentChunk = [0,0];
//  moved = 0;
  starColors = [17,18,19,20,21,22,30,30,30,30,30,30,30,30];
  generateChunks(chunkCoords);
  loop();
}

findChunk=(coords, generated)=>{
  let results = false;
  for(let i = 0; i < generated.length; i++){
    console.log(generated[i][0][0], coords[0], generated[i][0][1], coords[1] )
    if(generated[i][0][0] == coords[0] && generated[i][0][1] == coords[1]){
      results = true;
    }
    console.log('been here : ' + results);
    return results;
  }
}

generateChunk=(coords)=>{

  if(!findChunk(coords, generated) ){
    lcg.setSeed(1117+Math.abs(coords[0]+coords[1])*1234.5678);

    var x = coords[0] * chunkWidth * 2,
    left = x-chunkWidth,
    right = x+chunkWidth,
    y = coords[1] * chunkWidth * 2,
    top = y - chunkWidth,
    bottom = y + chunkWidth;

    let chunk = [];
    let i = 1000;
    while(--i){
      chunk.push(
        lcg.nextIntRange(left, right), //x
        lcg.nextIntRange(top, bottom), //y
        0, //WIDTH or Radius
        0, //HEIGHT
        starColors[lcg.nextIntRange(0,starColors.length-1)], //color
        3, //type 0:block, 1:circle, 2: filledCircle, 3:dot
      )
    }
    let j = 10;

    while(--j){
      chunk.push(
        lcg.nextIntRange(left,right), //x
        lcg.nextIntRange(top,bottom), //y
        lcg.nextIntRange(60,180), //WIDTH or Radius
        lcg.nextIntRange(5,5), //HEIGHT
        lcg.nextIntRange(0,63), //color
        lcg.nextIntRange(0,2), //type 0:block, 1:circle, 2: filledCircle, 3:dot
      )
    }
    generated.push([coords.slice(), chunk]);
  }

}

generateChunks=(coords)=>{
  generateChunk(coords);
  generateChunk([ coords[0]-1, coords[1] ]);
  generateChunk([ coords[0], coords[1]-1 ]);
  generateChunk([ coords[0]+1, coords[1] ]);
  generateChunk([ coords[0], coords[1]+1 ]);
  generateChunk([ coords[0]-1, coords[1]-1 ]);
  generateChunk([ coords[0]+1, coords[1]-1 ]);
  generateChunk([ coords[0]+1, coords[1]+1 ]);
  generateChunk([ coords[0]-1, coords[1]+1 ]);
  console.log(generated.length);

}

cullChunks=(coords)=>{
  let i = generated.length;
  while(--i){
    if(generated[i][0][0] > coords[0]+1 || generated[i][0][0] < coords[0]-1
      || generated[i][0][1] > coords[1]+1 || generated[i][0][1] < coords[1]-1){
        generated.splice(i,1);
    }
  }
}

drawThings=(dt)=>{
  for(let j = 0; j < generated.length; j++){
    for(let i = 0; i < generated[j][1].length; i+=6){

      blocks = generated[j][1],
      x = blocks[i]-viewX,
       y = blocks[i+1]-viewY,
       c = blocks[i+4],
       wr = blocks[i+2],
       h = blocks[i+3],
       type = blocks[i+5],
       p = 100; //overscan check to prevent popping and too much overdraw

      if(x > 0-p && x < WIDTH+p && y > 0-p && y < HEIGHT+p){
        switch(type){
          case 0:
            //renderTarget = MIDGROUND; fillRect(x,y, wr, wr, c);
          break;
          case 1:
          renderTarget = COLLISION; fillRect(x,y, wr, wr, 1);
          renderTarget = FOREGROUND; drawPlanet(x,y,wr,c);
          break;
          case 2:

          break;
          default:
          renderTarget = BACKGROUND; pset(x, y, c);
          renderTarget = SCREEN;
          break;
          //default
        }
      }
    }
  }

}
drawPlayer=()=>{
  renderTarget = FOREGROUND;
  fillRect(playerX-viewX, playerY-viewY, 8, 8, 4);
}
drawPlanet=(x,y,w,c)=>{
  scrNG.setSeed(1019);
  fillRect(x,y,w,w,c);
  let i = w*w/4|0;
  while(i--)pset(scrNG.nextIntRange(x, x+w), scrNG.nextIntRange(y, y+w), c+1);
  rect(x,y,w,w,c+2);
  rect(x+4,y+4,w-8,w-8,c+2);
}
composite=()=>{
  renderTarget = SCREEN;

  renderSource = BACKGROUND; spr();
  renderSource = MIDGROUND; spr();
  renderSource = FOREGROUND; spr();

}
clearLayers=()=>{
  renderTarget = SCREEN; clear(0);
  renderTarget = BACKGROUND; clear(0);
  renderTarget = MIDGROUND; clear(0);
  renderTarget = FOREGROUND; clear(0);
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
  cullChunks(currentChunk);
  //keyboard input
  if(Key.isDown(Key.d) || Key.isDown(Key.RIGHT)) playerX+=3;
  else if(Key.isDown(Key.a)|| Key.isDown(Key.LEFT)) playerX-=3;
  if(Key.isDown(Key.w)|| Key.isDown(Key.UP)) playerY-=3;
  else if(Key.isDown(Key.s)|| Key.isDown(Key.DOWN)) playerY+=3;



  //gamepad input
  if(gp){
    if(buttonPressed(gp.buttons[3]) ) playerX++;
    else if(buttonPressed(gp.buttons[2]) ) playerX--;
    if(buttonPressed(gp.buttons[0]) ) playerY--;
    else if(buttonPressed(gp.buttons[1]) ) playerY++;

    if(Math.abs(gp.axes[0]) > .1)playerX+= 5 * gp.axes[0]; //allow for deadzone
    if(Math.abs(gp.axes[1]) > .1)playerY+= 5 * gp.axes[1];
  }

  chunkCoords[0] = Math.round( playerX / (chunkWidth * 2) );
  chunkCoords[1] = Math.round( playerY / (chunkWidth * 2) );

  if(chunkCoords[0] != currentChunk[0] || chunkCoords[1] != currentChunk[1]){
    //moved++;
    currentChunk[0] = chunkCoords[0];
    currentChunk[1] = chunkCoords[1];
    generateChunks(chunkCoords);
  }
  viewX = playerX - WIDTH/2; viewY = playerY - HEIGHT/2;


}


draw=(dt)=>{
 clearLayers(0);
 drawThings();
 drawPlayer();
 composite();
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
