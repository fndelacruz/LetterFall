(function(root) {
  if (typeof LetterFall === "undefined") {
    root.LetterFall = {};
  }

  var MovingObject = LetterFall.MovingObject = function(options) {
    this.drawPos = options.drawPos;
    this.vel = options.vel;
    this.radius = options.radius;
    this.color = options.color;
    this.game = options.game;
    this.letter = options.letter;
    this.numRow = options.numRow;
    // debugger
    // if (this.letter === "Q") {
    //   this.isEnterable = false;
    // }
    if (typeof options.isEnterable === "undefined") {
      this.isEnterable = true;
    } else {
      this.isEnterable = options.isEnterable;
    }
    this.hasPlayer = options.hasPlayer;

    this.gridPos = options.gridPos;
  };

  MovingObject.prototype.draw = function(ctx, gameObject) {
    if (this.gridPos[0] === this.game.playerPos[0] && this.gridPos[1] === this.game.playerPos[1]) {
    }
    ctx.fillStyle = this.color;
    ctx.beginPath();
    if (this instanceof LetterFall.Tile ||
        this instanceof LetterFall.Bullet ||
        this instanceof LetterFall.Exhaust) {
      ctx.textAlign = "center";
      ctx.textBaseline = "hanging";

      ctx.font = "48px monospace";
      ctx.fillText(gameObject.letter, this.drawPos[0], this.drawPos[1]);

      // // NOTE: use the below to debug grid coordinates
      // letter = this.gridPos;
      // ctx.fillText(letter, this.drawPos[0], this.drawPos[1] + 10);
      if (gameObject.letter === "Q") {
        // debugger
      }

      if (gameObject.hasPlayer) {
        ctx.fillStyle = "rgba(71, 250, 250, 0.3)";
        // ctx.arc(
        //   this.drawPos[0],
        //   this.drawPos[1] + 20,
        //   25,
        //   0,
        //   2 * Math.PI,
        //   false
        // );

        ctx.fillRect(
          (this.drawPos[0] - 25),
          this.drawPos[1] - 5,
          50,
          50
        );
      } else if (!gameObject.isEnterable) {
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(
          (this.drawPos[0] - 25),
          this.drawPos[1] - 5,
          50,
          50
        );
      }
    }

    ctx.fill();
  };

  MovingObject.prototype.move = function() {
    this.drawPos[0] += this.vel[0];
    this.drawPos[1] += this.vel[1];
    if (this.game.isOutOfBounds(this.drawPos)) {
      if (this.isWrappable) {
        this.drawPos = this.game.wrap(this.drawPos);
      } else {
        if (this.numRow === this.game.numRowsGone) {
          this.game.numRowsGone += 1;
          this.game.addNewLine();
        }

        if (this.hasPlayer === true) {
          this.game.isGameOver = true;
        } else {
          this.game.remove(this);
        }
      }
    }
  };

})(window);
