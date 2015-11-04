(function(root){
  if (typeof LetterFall === "undefined") {
    root.LetterFall = {};
  }

  LetterFall.Util = {};

  LetterFall.Util.inherits = function(childClass, parentClass) {
    var Surrogate = function(){};
    Surrogate.prototype = parentClass.prototype;
    childClass.prototype = new Surrogate();
    childClass.prototype.constructor = childClass;
  };

  LetterFall.Util.randomVel = function(maxVel) {
    var vel = [ 0, 2 ];
    return vel;
  };
})(this);
