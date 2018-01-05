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