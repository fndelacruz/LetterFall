(function(root) {
  if (typeof LetterFall === "undefined") {
    root.LetterFall = {};
  }

  var SLOW_DOWN_POWER_UP_CHANCE = 0.01;
  var SLOW_DOWN_POWER_UP_TIME_DECREMENT = -0.5;
  var POINT_CHANCE = 0.20;

  var Game = LetterFall.Game = function() {
    this.tiles = [];
    this.numRowsGone = 0;
    this.currentRow = 0;
    this.playerPos = [8, 8];
    this.isGameOver = false;
    this.isGameStarted = false;
    this.timer = 0;
    this.speed = 1;
    this.points = 0;
    this.initializeGrid();
  };

  Game.DIM_X = 800;
  Game.DIM_Y = 800;

  Game.xDimChars = 16;
  Game.yDimChars = 16;

  Game.LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // NOTE: This number is used to render the edge case. This might be altered
  // depending on movement direction
  Game.drawOffset = [25, 0];

  Game.prototype.initializeGrid = function() {
    for (var j = Game.yDimChars - 1; j >= -1 ; j--) {
      for (var i = 0; i < Game.xDimChars; i++) {
        var xPos = Game.DIM_X / Game.xDimChars * i;
        var yPos = Game.DIM_Y / Game.yDimChars * j;
        var drawPos = [xPos + Game.drawOffset[0], yPos + Game.drawOffset[1]];
        var newTile = new LetterFall.Tile({
          vel: [0, this.speed],
          letter: Game.LETTERS[Math.floor(Math.random() * Game.LETTERS.length)],
          drawPos: drawPos,
          game: this,
          numRow: this.currentRow,
          hasPlayer: i === this.playerPos[0] && j === this.playerPos[1] - 1 ? true : false,
          gridPos: [i , this.currentRow]
        });
        this.add(newTile);
      }
      this.currentRow += 1;
    }

  };

  Game.prototype.addNewLine = function() {
    this.currentRow += 1;
    for (var i = 0; i < Game.xDimChars; i++) {
      var letter = Game.LETTERS[Math.floor(Math.random() * Game.LETTERS.length)];
      var xPos = Game.DIM_X / Game.xDimChars * i;
      var drawPos = [xPos + Game.drawOffset[0], -Game.DIM_Y / Game.yDimChars + Game.drawOffset[1]];
      var gridPos = [i , this.currentRow - 1];
      var isValid = this.checkConflicts(gridPos, letter);
      if (!isValid) {
        letter = Game.LETTERS[Math.floor(Math.random() * Game.LETTERS.length)];
        isValid = this.checkConflicts(gridPos, letter);
      }
      var newTile = new LetterFall.Tile({
        vel: [0, this.speed],
        letter: isValid ? letter : " ",
        drawPos: drawPos,
        game: this,
        numRow: this.currentRow - 1,
        gridPos: gridPos,
        isEnterable: isValid ? true: false
      });

      if (isValid) {
        if (Math.random() < SLOW_DOWN_POWER_UP_CHANCE)
        newTile.powerUp = "TIME_SLOWER";
      }

      if (isValid) {
        if (Math.random() < POINT_CHANCE)
        newTile.powerUp = "POINT";
      }
      this.add(newTile);
    }
  };

  Game.prototype.moveObjects = function() {
    this.tiles.forEach(function(gameObject){
      gameObject.move();
      this.checkGameOver();
    }.bind(this));
  };

  Game.prototype.checkGameOver = function() {
    if (this.isGameOver) {
      this.haltMovement();
      $(".gameover").css({
        visibility: "visible"
      });

      $("body").css({
        backgroundColor: "black",
        transition: "all 1s"
      });
      $("#title").css({
        color: "white",
        transition: "all 2s"
      });
      clearInterval(window.gameTimer);
      setTimeout(function() {
        $("body").css({
          backgroundColor: "black",
          transition: "all 1s"
        });
        $("#title").css({
          color: "white",
          transition: "all 2s"
        });
        console.log("setTimeout");
      }, 0);
    }
  };

  Game.prototype.haltMovement = function() {
    this.tiles.forEach(function(gameObject) {
      gameObject.vel = [0, 0];
    });
  };

  Game.prototype.draw = function(ctx) {
    ctx.clearRect(0, 0, this.constructor.DIM_X, this.constructor.DIM_Y);

    this.tiles.forEach(function(gameObject){
      // debugger
      gameObject.draw(ctx, gameObject);
    }.bind(this));
  };

  Game.prototype.startGame = function() {
    if (!this.isGameStarted) {
      this.speedTimer = root.setInterval(function() {
        this.changeSpeed(0.01);
        this.resetSpeed();
      }.bind(this), 100);
      this.isGameStarted = true;
    }
  };

  Game.prototype.move = function(keypress) {
    // console.log(keypress);
    this.keypress = keypress;
    var neighbors = this.getPlayerNeighbors();
    var newmove = neighbors.filter(function(neighbor){
      var direction = Object.keys(neighbor)[0];
      var tile = neighbor[direction];

      return (tile && neighbor[Object.keys(neighbor)[0]].letter.toLowerCase() === keypress);
    }.bind(this));
    // debugger
    if (newmove.length !== 0) {
      this.startGame();
      // NOTE: this only gets the first letter if there are multiple letters.
      // Deal with this by making duplicate letters turn into uncrossable blocks
      var direction = Object.keys(newmove[0])[0];
      var oldPlayer = this.findPlayer();
      var newPlayerPos = oldPlayer.gridPos.slice();
      var newPlayer;
      switch (direction) {
        case "w":
          newPlayerPos[0] -= 1;
          break;
        case "nw":
          newPlayerPos[0] -= 1;
          newPlayerPos[1] += 1;
          break;
        case "ne":
          newPlayerPos[0] += 1;
          newPlayerPos[1] += 1;
          break;
        case "n":
          newPlayerPos[1] += 1;
          break;
        case "e":
          newPlayerPos[0] += 1;
          break;
        case "s":
          newPlayerPos[1] -= 1;
          break;
        case "sw":
          newPlayerPos[0] -= 1;
          newPlayerPos[1] -= 1;
          break;
        case "se":
          newPlayerPos[0] += 1;
          newPlayerPos[1] -= 1;
          break;
      }
      newPlayer = this.findTileByGridPos(newPlayerPos);
      if (newPlayer.isEnterable) {
        this.playerPos = newPlayerPos;
        newPlayer.hasPlayer = true;
        oldPlayer.hasPlayer = false;
        if (newPlayer.powerUp) {
          switch (newPlayer.powerUp) {
            case "TIME_SLOWER":
              this.changeSpeed(SLOW_DOWN_POWER_UP_TIME_DECREMENT);
              break;
            case "POINT":
              this.points += 1;
              break;
          }
          newPlayer.powerUp = undefined;
        }

      }
    }
  };

  Game.prototype.step = function() {
    if (this.isGameStarted && !this.isGameOver) {

      this.moveObjects();
      this.timer += 0.02;
      bar1.textContent = "time: " + this.timer.toFixed(2) + " s";
      bar2.textContent = "pain: " + this.speed.toFixed(2);
      bar3.textContent = "lines: " + this.numRowsGone;
      bar4.textContent = "score: " + this.points;

      this.handleBackground();
    }
  };

  Game.prototype.handleBackground = function() {
    var alpha = this.playerScalableHeight.toFixed(2);
    var backgroundColor = "rgba(255, 0, 0, " + alpha + ")";
    $("body").css('background-color', backgroundColor);
    if (alpha > 0) {
      $("#title").css('color', "rgba(0, 0, 0, " + (1 - alpha) + ")");
    }
    console.log("changing background");
  };

  Game.prototype.changeSpeed = function(increment) {
    var newSpeed = this.speed + increment;
    if (newSpeed < 0) {
      this.speed = 0;
    } else {
      this.speed = newSpeed;
    }
  };

  Game.prototype.resetSpeed = function() {
    this.tiles.forEach(function(tile) {
      tile.vel = [0, this.speed];
    }.bind(this));
  };

  Game.prototype.add = function(obj) {
    if (obj instanceof LetterFall.Tile) {
      this.tiles.push(obj);
    }
  };

  Game.prototype.remove = function(obj) {
    if (obj instanceof LetterFall.Tile) {
      this.tiles.splice(this.tiles.indexOf(obj), 1);
    }
  };

  Game.prototype.isOutOfBounds = function (pos) {
    if (pos[1] > Game.DIM_Y ) {
      return true;
    }
  };

  Game.prototype.findPlayer = function () {
    return (this.tiles.filter(function(tile) {
      return (tile.hasPlayer === true);
    }))[0];
  };

  Game.prototype.findTileByGridPos = function(gridPos) {
    return (this.tiles.filter(function(letter) {
      return (letter.gridPos[0] === gridPos[0] && letter.gridPos[1] === gridPos[1]);
    }))[0];
  };

  Game.prototype.getPlayerNeighbors = function () {
    pos = this.playerPos;
    return ([
      {nw: this.findTileByGridPos([pos[0] - 1, pos[1] + 1])},
      {n: this.findTileByGridPos([pos[0], pos[1] + 1])},
      {ne: this.findTileByGridPos([pos[0] + 1, pos[1] + 1])},
      {e: this.findTileByGridPos([pos[0] + 1, pos[1]])},
      {se: this.findTileByGridPos([pos[0] + 1, pos[1] - 1])},
      {s: this.findTileByGridPos([pos[0], pos[1] - 1])},
      {sw: this.findTileByGridPos([pos[0] - 1, pos[1] - 1])},
      {w: this.findTileByGridPos([pos[0] - 1, pos[1]])}
    ]);
  };

  Game.prototype.checkConflicts = function (pos, letter) {
    var isValid = true;
    var newPos, tile;
    for (var i = -2; i <= 2; i++) {
      for (var j = -2; j < 0; j++) {
        newPos = pos.slice();
        newPos[0] += i;
        newPos[1] += j;
        tile = this.findTileByGridPos(newPos);
        if (tile && tile.letter === letter) {
          isValid = false;
          break;
        }
      }
    }
    for (var k = -2; k < 0; k++) {
      newPos = pos.slice();
      newPos[0] += k;
      tile = this.findTileByGridPos(newPos);
      if (tile && tile.letter === letter) {
        isValid = false;
      }
    }
    return isValid;
  };

  Game.prototype.printNeighbors = function() {
    letters = [];
    this.getPlayerNeighbors().forEach(function(neighbor) {
      letters.push(neighbor[Object.keys(neighbor)[0]].letter);
    });
    return letters.join(" ");
  };
})(window);
