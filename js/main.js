(()=>{
  var stats = new Stats();
  stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );

  var t = 0, last = 0, now = 0,

  playerX = WIDTH/2, playerY = HEIGHT/2,

  worldWidth = 10000; worldHeight = 10000;

  blocks = [];




load=()=>{
  //load external non-script assets
  init();
}

init=()=>{
  //state vars, initial game state
  let i = 40000;
  while(--i){
    blocks.push(
      Math.random()*worldWidth|0, //x
      Math.random()*worldHeight|0, //y
      0, //WIDTH or Radius
      0, //HEIGHT
      22, //color
      3, //type 0:block, 1:circle, 2: filledCircle, 3:dot
    )
  }
  let j = 50000;
  while(--j){
    blocks.push(
      Math.random()*worldWidth|0, //x
      Math.random()*worldHeight|0, //y
      Math.random()*10+5|0, //WIDTH or Radius
      Math.random()*10+5|0, //HEIGHT
      Math.random()*64|0, //color
      Math.random()*3|0, //type 0:block, 1:circle, 2: filledCircle, 3:dot
    )
  }
  console.log(blocks)
  loop();
}

loop=()=>{
  stats.begin();
  t++;

  step(t);
  draw(t);

  render(t);

  stats.end();
  requestAnimationFrame(loop);

}

step=(dt)=>{
if(t%5<1){
  // for(let i = 0; i < blocks.length; i+=6){
  //     blocks[i] += Math.random()-.5;
  //     blocks[i+1]+= Math.random()-.5;
  // }
}

if(Key.isDown(Key.d) || Key.isDown(Key.RIGHT))       { playerX++; viewX++}
else if(Key.isDown(Key.a)|| Key.isDown(Key.LEFT)) { playerX--; viewX--;}
if(Key.isDown(Key.w)|| Key.isDown(Key.UP))      { playerY--; viewY--;}
else if(Key.isDown(Key.s)|| Key.isDown(Key.DOWN))  { playerY++; viewY++;}
}


draw=(dt)=>{
 clear(30);
 //let i = blocks.length;
 ellipse(20,20,60,25,4);
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

drawThings=()=>{

  for(let i = 0; i < blocks.length; i+=6){
      let x = blocks[i]-viewX,
       y = blocks[i+1]-viewY,
       c = blocks[i+4],
       wr = blocks[i+2],
       h = blocks[i+3],
       type = blocks[i+5],
       p = 100;

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
          fillCircle(x,y, wr, c);
          case 3:
          pset(x, y, c);
          break;
        }
      }
    }

}

})();
