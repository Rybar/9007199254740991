(()=>{
  var stats = new Stats();
  stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );

  const TOP = 0;
  const BOTTOM = 1;
  const LEFT = 2;
  const RIGHT = 3;

  var t = 0, last = 0, now = 0,

  chunkWidth = 360, //actually radius or half of chunk

  playerX = 0, playerY = 0, pDeltaX = 0, pDeltaY = 0, pColor = 4,
  pWidth = 8, pHeight = 8, pTop = [], pBottom=[], pLeft = [], pRight = [], pHit,
  pMaxVelX = 2, pMaxVelY = 2, pSpeed = .2, pDrag = .98,

  viewX = playerX - WIDTH/2, viewY = playerY - HEIGHT/2,
  blocks,
  lcg = new LCG(), scrNG = new LCG(), starColors, currentChunk, chunkCoords, generated = [],

  gp = {};

  load=()=>{
    //load external non-script assets
    init();
  }

  init=()=>{
    chunkCoords = [0,0];
    currentChunk = [0,0];
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

  overlaps=(o)=>{
    let x = (o[0]-=viewX)|0, y = (o[1]-=viewY)|0;
    return ram[COLLISION + y*WIDTH+x];
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
          lcg.nextIntRange(3,63), //color
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
        p = 200; //overscan check to prevent popping and too much overdraw

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
    fillRect(playerX-viewX, playerY-viewY, 8, 8, pColor);
    pset(pTop[0], pTop[1], 21);
    pset(pLeft[0], pLeft[1], 12);
    pset(pRight[0], pRight[1], 13);
    pset(pBottom[0], pBottom[1], 14);
  }

  drawPlanet=(x,y,w,c)=>{
    scrNG.setSeed(1019);
    fillRect(x,y,w,w,c);
    let i = w*w/4|0;
    while(i--)pset(scrNG.nextIntRange(x, x+w), scrNG.nextIntRange(y, y+w), c+1);
    rect(x,y,w,w,c+2);
    rect(x+4,y+4,w-8,w-8,c+2);
  }

  drawUI=()=>{
    let
    cXColor = chunkCoords[0] < 0 ? 4 : 12,
    cYColor = chunkCoords[1] < 0 ? 4 : 12,
    pXColor = playerX < 0 ? 4 : 12,
    pYColor = playerY < 0 ? 4 : 12;
    text([ ' ' + chunkCoords[0],
    WIDTH-4, 4, 1, 3, 'right', 'top', 1, cXColor ]);
    text([ ' ' + chunkCoords[1],
    WIDTH-44, 4, 1, 3, 'right', 'top', 1, cYColor ]);

    text([ '' + (playerX|0),
    WIDTH-200, 4, 1, 3, 'right', 'top', 1, pXColor ]);
    text([ '' + (playerY|0),
    WIDTH-100, 4, 1, 3, 'right', 'top', 1, pYColor ]);
  }

  composite=()=>{
    renderTarget = SCREEN;

    renderSource = BACKGROUND; spr();
    renderSource = MIDGROUND; spr();
    renderSource = FOREGROUND; spr();
    renderSOurce = UI; spr();

  }

  clearLayers=()=>{
    renderTarget = SCREEN; clear(0);
    renderTarget = BACKGROUND; clear(0);
    renderTarget = MIDGROUND; clear(0);
    renderTarget = FOREGROUND; clear(0);
    renderTarget = COLLISION; clear(0);
  }

  updatePlayer=()=>{
    //keyboard input
    if(Key.isDown(Key.d) || Key.isDown(Key.RIGHT)) pDeltaX+=pSpeed;
    else if(Key.isDown(Key.a)|| Key.isDown(Key.LEFT)) pDeltaX-=pSpeed;
    if(Key.isDown(Key.w)|| Key.isDown(Key.UP)) pDeltaY-=pSpeed;
    else if(Key.isDown(Key.s)|| Key.isDown(Key.DOWN)) pDeltaY+=pSpeed;
    //gamepad input
    if(gp){
      if(buttonPressed(gp.buttons[3]) ) pDeltaX+=pSpeed;
      else if(buttonPressed(gp.buttons[2]) ) pDeltaX-=pSpeed;
      if(buttonPressed(gp.buttons[0]) ) pDeltaY-=pSpeed;
      else if(buttonPressed(gp.buttons[1]) ) pDeltaY+=pSpeed;

      if(Math.abs(gp.axes[0]) > .1)pDeltaX+= pSpeed * gp.axes[0]; //allow for deadzone
      if(Math.abs(gp.axes[1]) > .1)pDeltaY+= pSpeed * gp.axes[1];
    }
    pDeltaX *= pDrag;
    pDeltaY *= pDrag;
    pTop = [playerX+pDeltaX+pWidth/2, playerY+pDeltaY];
    pLeft = [playerX+pDeltaX, playerY+pDeltaY+pHeight/2];
    pRight = [playerX+pDeltaX+pWidth, playerY+pDeltaY+pHeight/2];
    pBottom = [playerX+pDeltaX+pWidth/2, playerY+pDeltaY+pHeight];
    pOverlaps = [overlaps(pTop), overlaps(pBottom), overlaps(pLeft), overlaps(pRight)];

    if(pOverlaps[LEFT])pDeltaX = 0;
    if(pOverlaps[RIGHT])pDeltaX = 0;
    if(pOverlaps[TOP])pDeltaY = 0;
    if(pOverlaps[BOTTOM])pDeltaY = 0;

    playerX += pDeltaX;
    playerY += pDeltaY;

    pHit = pOverlaps.find(function(value){return value > 0});
    //console.log(pOverlaps);
    pColor = pHit ? 12 : 4;




  }

  buttonPressed=(b)=>{
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
    updatePlayer();

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
    drawUI();
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
