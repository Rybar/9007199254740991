collides () {
  if(this.b.x + this.hitRadius >= WIDTH-1 && player.xvel > 0){
    this.x = WIDTH + 1;
  }
  for(var i = -this.hitRadius; i < this.hitRadius; i++){
    for(var j = -this.hitRadius; j < this.hitRadius; j++){

      let check = ram[COLLISION + (this.b.x + i) + (this.b.y + j) * WIDTH]
      if(check == WALLS || check == TERRA || check == FUELCRYSTAL){
        //player.jumping = false;
        return true;
      }
    }
  }
  return false;
},

overlaps () {
  for(var i = -this.radius; i < this.radius; i++){
    for(var j = -this.radius * 2; j < this.radius; j++){
      let overlap = ram[COLLISION + (this.b.x + i) + (this.b.y + j) * WIDTH]
      if(overlap){
        return {
          x: this.b.x + i,
          y: this.b.y + j,
          o: overlap
        }
      };
    }
  }
  return false;
},
