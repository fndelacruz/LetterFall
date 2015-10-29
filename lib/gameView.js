(function(root) {
  if (typeof LetterFall === "undefined") {
    root.LetterFall = {};
  }

  var GameView = LetterFall.GameView = function(game, ctx) {
    this.game = game;
    this.ctx = ctx;
  };

  GameView.prototype.start = function() {
    this.bindKeyHandlers();
    setInterval(function(){
      this.game.step();
      this.game.draw(this.ctx);
    }.bind(this), 20);
  };

  GameView.prototype.bindKeyHandlers = function() {
    var game = this.game;
    var movements = ["left", "right", "up", "down"];
    var letters = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];
    var allMovements = movements.concat(letters);
    allMovements.forEach(function(movement) {
    key(movement, function() {
      game.move(movement);
      });
    }.bind(this));
  };
})(window);
