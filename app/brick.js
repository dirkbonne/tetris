const c = require("./coord.js");

var Brick = function(figure) {
    this.figure = figure;
    this.imageSrc = figure.imageSrc;
    this.stones = [];
};

// given the new rotation and the position of the brick, return the new Coord of the
// brick so it does not collide with stones in the board.
// This function returns null if no valid origin was found
Brick.prototype.validateWithWiggle = function (board, ox, oy, rot) {
    let origins = this.figure.getRotation(rot).originPositions;
    for(let i = 0; i < origins.length; ++i) {
	var newox = ox + origins[i].x;
	var newoy = oy + origins[i].y;
	if(this.validate(board, newox, newoy, rot)) {
	    return c.make(newox, newoy);
	}
    }
    return null;
};

Brick.prototype.rotatedWidth = function (rot) {
    return this.figure.getRotation(rot).w;
};

Brick.prototype.rotatedHeight = function (rot) {
    return this.figure.getRotation(rot).h;
};

Brick.prototype.validate = function (board, ox, oy, rot) {
    var stones = this.figure.getRotation(rot).stoneList;
    for(var j = 0; j < stones.length; ++j) {
	if(null !== board.getStone(ox + stones[j].x, oy + stones[j].y))
	    return false;
    }
    return true;
};

Brick.prototype.draw = function(board, x, y, rot) {
    var form = this.figure.getRotation(rot).stoneList;
    var paper = board.paper;
    for(var i = 0; i < form.length; ++i) {
	var c = form[i];
	var pxx = board.getStonePxX(x + c.x);
	var pxy = board.getStonePxY(y + c.y);
	if(this.stones.length <= i) {
	    this.stones.push(paper.image(this.imageSrc, pxx, pxy,
					 board.cellPxSize,
					 board.cellPxSize));
	} else {
	    var stone = this.stones[i];
	    stone.attr({ x: pxx, y: pxy });
	    if(stone.paper != paper) paper.append(stone);
	}
    }
};

// put the stones on the board at the postion
Brick.prototype.cementStones = function (board, x, y, rot) {
    // make sure it is drawn at the postion
    this.draw(board, x, y, rot);
    var form = this.figure.getRotation(rot).stoneList;
    for(var i = 0; i < form.length; ++i) {
	var c = form[i];
	board.setStone(x + c.x, y + c.y, this, this.stones[i]);
    }
    this.stones = [];
};

Brick.prototype.removeFromPaper = function() {
    for(var i = 0; i < this.stones.length; ++i) {
	this.stones[i].remove();
    }
};

module.exports = Brick;
