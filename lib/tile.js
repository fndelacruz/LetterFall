(function(root) {
  if (typeof LetterFall === "undefined") {
    root.LetterFall = {};
  }

  var Tile = LetterFall.Tile = function(options) {
    options.vel = options.vel;
    options.radius = Tile.RADIUS;
    options.color = Tile.COLOR;
    LetterFall.MovingObject.call(this, options);
  };

  // Tile.INITIAL_VELOCITY = [0, 2];
  Tile.COLOR = "#000000";
  Tile.HAS_PLAYER_COLOR = "#00FF00";
  Tile.RADIUS = 0;

  LetterFall.Util.inherits(Tile, LetterFall.MovingObject);
})(window);
