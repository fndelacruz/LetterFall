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

  function gameObjectMove(gameObject) {
    gameObject.move();
  }

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
    this.tiles.forEach(gameObjectMove);
    this.handleRowTransition();
  };

  Game.prototype.handleRowTransition = function() {
    if (this.isOutOfBounds(this.tiles[0].drawPos)) {
      if (this.lastRowHasPlayer()) {
        this.isGameOver = true;
      } else {
        this.tiles = this.tiles.slice(Game.xDimChars, this.tiles.length + 1);
        this.addNewLine();
        this.numRowsGone += 1;
      }
    }
  };

  Game.prototype.lastRowHasPlayer = function() {
    return this.tiles.slice(0, Game.xDimChars).some(function(tile) {
      return tile.hasPlayer;
    });
  };

  Game.prototype.checkGameOver = function() {
    if (this.isGameOver) {
      this.speed = 0;
      $(".gameover").css({
        visibility: "visible"
      });

      clearInterval(window.gameTimer);
    }
  };

  Game.prototype.draw = function(ctx) {
    ctx.clearRect(0, 0, this.constructor.DIM_X, this.constructor.DIM_Y);

    this.tiles.forEach(function(gameObject){
      gameObject.draw(ctx, gameObject);
    });
  };

  Game.prototype.startGame = function() {
    if (!this.isGameStarted) {
      this.speedTimer = root.setInterval(function() {
        this.changeSpeed(0.01);
      }.bind(this), 100);
      this.isGameStarted = true;
    }
  };

  Game.prototype.move = function(keypress) {
    this.keypress = keypress;
    var neighbors = this.getPlayerNeighbors();
    var newmove = neighbors.filter(function(neighbor){
      var direction = Object.keys(neighbor)[0];
      var tile = neighbor[direction];

      return (tile && neighbor[Object.keys(neighbor)[0]].letter.toLowerCase() === keypress);
    }.bind(this));
    if (newmove.length !== 0) {
      this.startGame();
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
      this.checkGameOver();
      this.timer += 0.02;
      this.renderStats();
    }
  };

  Game.prototype.renderStats = function() {
    document.getElementById('time').textContent = "time: " + this.timer.toFixed(2) + " s";
    document.getElementById('speed').textContent = "pain: " + this.speed.toFixed(2);
    document.getElementById('lines').textContent = "lines: " + this.numRowsGone;
    document.getElementById('points').textContent = "score: " + this.points;
  };

  Game.prototype.changeSpeed = function(increment) {
    var newSpeed = this.speed + increment;
    if (newSpeed < 0) {
      this.speed = 0;
    } else {
      this.speed = newSpeed;
    }
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

  Game.prototype.bindResetHandler = function() {
    $('#lines').html("ex: " + newGame.printNeighbors());
    $(document).keypress(function(e) {
      if (e.keyCode === 32 && newGame.isGameOver) {
        ctx.clearRect(0, 0, 800, 800);
        $('#time').html("collect pain relief");
        $('#speed').html("type adjacent keys to move");
        $('#lines').html("hello hello");
        $('#points').html("collect points");

        $(".gameover").fadeIn().css({
          visibility: "hidden"
        });

        newGame = new LetterFall.Game();
        startNewGame(newGame);
      }
    });
  };
})(this);
