var gameConfig = {
    previewGridWidth: 6,
    previewGridHeight: 6,

    gridWidth: 10,
    gridHeight: 20,

    cellPxSize: 40,
    initialFallTime: 500,
    // when user wants to make it fall now
    fallFastTime: 30,
    
    figures: [
	{
	    form: [[true],
		   [true],
		   [true],
		   [true]],
	    width: 1,
	    height: 4,
	    // number of rotations
	    nrot: 2,
	    // rotation point measured from the bottom-left
	    rotx: 0, roty: 2
	},
	{
	    form: [[true, true, false],
		   [false, true, true]],
	    width: 3,
	    height: 2,
	    nrot: 2,
	    rotx: 1, roty: 1,
	},
	{
	    form: [[true, true],
		   [true, true]],
	    width: 2,
	    height: 2,
	    nrot: 0,
	    rotx: 1, roty: 1,
	},
	{
	    form: [[true, true, true],
		   [false, false, true]],
	    width: 3,
	    height: 2,
	    nrot: 4,
	    rotx: 1, roty: 1,
	}

    ],
};

// FieldConfig can either be a pre view field or the actual play field.
//
// note: if varname is prefixed with px, then we mean pixel instead of
// grid position
function FieldConfig(gameConfig, paper, width, height, snapToGrid) {
    this.gameConfig = gameConfig;
    // the snap paper to draw on
    this.paper = paper;
    // size of the cell - later we can add a padding too
    this.cellPxSize = gameConfig.cellPxSize;
    // number of horizontal cells
    this.width = width;
    // number of cells stacked
    this.height = height;
    // if stones should be aligned to the grid
    this.snapToGrid = snapToGrid;
    // set background:
    var r = paper.rect(0,0, this.cellPxSize*width, this.cellPxSize*height);
    r.attr({ fill: "#000000" });
    
}

FieldConfig.prototype.snapIt = function (v) {
    return this.snapToGrid? Math.floor(v) : v;
}

// calculates the lower-left corner of a cell
FieldConfig.prototype.getStonePxX = function (x) {
    return this.snapIt(x) * this.cellPxSize;
}

// calculates the lower.left corner of a cell
FieldConfig.prototype.getStonePxY = function (y) {
    return (this.height - 1 - this.snapIt(y)) * this.cellPxSize;
}

function StoneConfig(name, src, imagePxSize)
{
    this.name = name;
    this.src = src;
    this.imagePxSize = imagePxSize;;
}

var paddingStoneConfig = new StoneConfig("padding", null, 0);

var stoneConfigurations = [
    new StoneConfig("red", "redstone.jpg", 40),
    new StoneConfig("blue", "bluestone.jpg", 40),
    new StoneConfig("green", "greenstone.jpg", 40),
    new StoneConfig("yellow", "yellowstone.jpg", 40),
];

// The bricks that fall down are made up of stones.
//
// Note the field coordinates are not stored in the Stone, they are
// only in the brick.
function Stone(stoneConfig) {
    this.stoneConfig = stoneConfig;
    this.element = null;
}

// moves to another paper
Stone.prototype.draw = function (fieldConfig, x, y) {
    var s = fieldConfig.paper;
    var pxx = fieldConfig.getStonePxX(x);
    var pxy = fieldConfig.getStonePxY(y);

    if(!this.element) {
	this.element = s.image(this.stoneConfig.src, pxx, pxy,
			       this.stoneConfig.cellPxSize,
			       this.stoneConfig.cellPxSize);
    } else {
	this.element.attr({
	    x: pxx,
	    y: pxy });
	// move to another paper:
	if(this.element.paper != s) {
	    s.append(this.element);
	}
    }
}

Stone.prototype.remove = function() {
    if(this.element) {
	this.element.remove();
    }
}

// Brick constructor
//
// x, y are through the middle of the brick
function Brick(stoneConfig, figure) {
    // where it is drawn
    this.fieldConfig = null;
    this.figure = figure;
    // create a grid of stones:
    var form = figure.form;
    this.grid = new Array(figure.height);
    for(var h = 0; h < form.length; ++h) {
	var fline = form[h];
	var line = this.grid[h] = new Array(figure.width);
	for(var w = 0; w < line.length; ++w) {
	    line[w] = fline[w]? new Stone(stoneConfig) : null;
	}
    }
}

Brick.prototype.rotatedWidth = function (rot) {
    return rot & 1? this.figure.height : this.figure.width;
}

Brick.prototype.rotatedHeight = function (rot) {
    return rot & 1? this.figure.width : this.figure.height;
}

// forget the stone without removing or destroying them
Brick.prototype.forgetStones = function() {
    for(var h = 0; h < this.grid.length; ++h) {
	var line = this.grid[h];
	for(var w = 0; w < line.length; ++w) {
	    line[w] = null;
	}
    }
}

// remove from the board. Data is not destroyed
Brick.prototype.remove = function() {
    for(var h = 0; h < this.grid.length; ++h) {
	var line = this.grid[h];
	for(var w = 0; w < line.length; ++w) {
	    if(line[w]) line[w].remove();
	}
    }
}    

// return true if all calls was true. If the function fct returns
// false the iteration is stopped
//
// Note that rotation is left aligned. 
Brick.prototype.iterateStones = function(rot, fct) {
    var rotation =  (rot + 4) % 4;
    var width = this.figure.width;
    var height = this.figure.height;
    for(var y = 0; y < height; ++y) {
	var line = this.grid[y];
	for(var x = 0; x < width; ++x) {
	    if(line[x]) {
		var relx, rely;
		switch(rotation) {
		case 0:
		    relx = x; rely = y;
		    break;
		case 1:
		    relx = y; rely = width - 1 - x;
		    break;
		case 2:
		    relx = width - 1 -x; rely = height - 1 - y;
		    break;
		case 3:
		    relx = height - 1 - y; rely = x;
		    break;
		}
		if(!fct(relx, rely, line[x])) return false;
	    }
	}
    }
    return true;
}

Brick.prototype.draw = function(fieldConfig, x, y, rot) {
    this.fieldConfig = fieldConfig;
    this.iterateStones(rot,
		       function(sx, sy, stone) {
			   stone.draw(fieldConfig, x + sx, y + sy);
			   return true;
		       });
}

// play field constructor
function Board(fieldConfig) {
    this.gameConfig = fieldConfig.gameConfig;
    this.fallTime = this.gameConfig.initialFallTime;
    
    this.fieldConfig = fieldConfig;
    this.width = fieldConfig.width;
    this.height = fieldConfig.height;
    this.paddingStone = new Stone(paddingStoneConfig);
    
    this.grid = new Array(this.height);
    for(var y = 0; y < this.grid.length; ++y) {
	var line = new Array(this.width);
	for(var i = 0; i < line.length; ++i) {
	    line[i] = null;
	}
	this.grid[y] = line;
    }
}

Board.prototype.clearGrid = function() {
    for(var y = 0; y < this.height; ++y) {
	var line = this.grid[y];
	for(var i = 0; i < line.length; ++i) {
	    if(line[i]) {
		line[i].remove();
		line[i] = null;
	    }
	}
    }
}

Board.prototype.getStone = function(x,y) {
    if(x < 0 || x >= this.width || y < 0) {
	// is taken:
	return this.paddingStone;
    } else if(y >= this.grid.length) {
	// open on the top
	return null;
    } else {
	return this.grid[Math.floor(y)][Math.floor(x)];
    }
}

Board.prototype.setStone = function(x,y, stone) {
    if(x >= 0 && x <= this.width && y >= 0 && y < this.height) {
	this.grid[Math.floor(y)][Math.floor(x)] = stone;
	stone.draw(this.fieldConfig, x, y);
    }
}

Board.prototype.validate = function(brick, posX, posY, rot) {
    var that = this;
    return brick.iterateStones(rot, function(relx, rely, stone) {
	return null == that.getStone(posX + relx, posY + rely);
    });
}

Board.prototype.drawBrick = function(brick, posX, posY, rotation) {
    brick.draw(this.fieldConfig, posX, posY, rotation);
}

Board.prototype.cementBrick = function(brick, posX, posY, rotation) {
    var that = this;
    brick.iterateStones(rotation, function(relx, rely, stone) {
	that.setStone(posX + relx, posY + rely, stone);
	return true;
    });
    // the stones are now ours
    brick.forgetStones();

    // check for full lines
    var y2 = 0; // where we copy to
    for(var y = 0; y < this.height; ++y) {
	var line = this.grid[y];
	if(line.every(function(el) { return el != null; })) {
	    for(var i = 0; i < line.length; ++i) {
		line[i].remove();
		line[i] = null;
	    }
	} else {
	    if(y2 < y) {
		var line2 = this.grid[y2];
		for(var i = 0; i < line.length; ++i) {
		    if(line[i]) {
			line2[i] = line[i];
			line[i] = null;
			line2[i].draw(this.fieldConfig, i, y2);
		    }
		}
	    }
	    ++y2;
	}
    }
}

function BrickController(board) {
    this.board = board;
    this.brick = null;
    this.timer = null;
}

BrickController.prototype.start = function (brick, finishedCallback)
{
    this.brick = brick;
    this.x = (this.board.width - 1) / 2;
    this.y = this.board.height; // will get decremented immediately
    this.rotation = 0;

    this.fallTime = this.board.fallTime;
    this.fallFast = false;
    this.finishedCallback = finishedCallback;
    this.nsteps = 0;
    
    this.startTimer();
}

BrickController.prototype.doStep = function ()
{
    if(!this.board.validate(this.brick, this.x, this.y - 1, this.rotation)) {
	this.board.cementBrick(this.brick, this.x, this.y, this.rotation);
	// loose the brick
	this.brick = null;
	this.timer = 0;
	this.finishedCallback(this.nsteps);
    } else {
	++this.nsteps;
	--this.y;
	this.board.drawBrick(this.brick, this.x, this.y, this.rotation);
	this.startTimer();
    }
}

BrickController.prototype.startTimer = function () {
    var that = this;
    this.timer = setTimeout(function() {
	that.doStep();
    }, this.fallFast? this.board.gameConfig.fallFastTime : this.fallTime);
}

BrickController.prototype.move = function (delta) {
    if(this.board.validate(this.brick, this.x + delta, this.y, this.rotation)) {
	this.x += delta;
	this.board.drawBrick(this.brick, this.x, this.y, this.rotation);
    }
}

BrickController.prototype.rotate = function (rot) {
    var newRotation = this.rotation + rot;

    console.log("rotate " + this.rotation + " -> " + newRotation);
    // when a brick is rotated the brick is always aligned bottom
    // left. Here we make the rotation look more natural + plus we
    // allow for some wiggling so the brick between / above existing
    // stones
    var w = this.brick.rotatedWidth(this.rotation);
    var h = this.brick.rotatedHeight(this.rotation);
    var neww = this.brick.rotatedWidth(newRotation);
    var newh = this.brick.rotatedHeight(newRotation);
    console.log("wh " + w + "," + h + " -> " + neww + "," + newh);
    // natural new bottom left. we take trunc instead of floor
    // otherwise the bricks will float to the left
    var xs = Math.trunc((w - neww) / 2);
    var ys = Math.trunc((h - newh) / 2);
    console.log("xs/ys " + xs + "," + ys);
    // wiggle to the left - allow wiggle from xs so the right side of
    // the brick rotations match or the left side match
    var wiggle_left = xs <= 0? (neww - w + xs) : xs;
    // wiggle to the right - allow wiggle so the left side match
    var wiggle_right = xs <= 0? -xs : (w - neww - xs);
    // wiggle up (we do not wiggle down)
    var wiggle_up = ys < 0? (newh - h + ys) : ys;
    console.log("wiggle " + wiggle_left + "," + wiggle_right + ", " + wiggle_up);
    // the checking loop is a bit wierd because we start looking from (xs,ys) and increase wiggling
    var max_wiggle = Math.max(wiggle_left, wiggle_right, wiggle_up);
    for(var wiggle = 0; wiggle <= max_wiggle; ++wiggle) {
	console.log("wiggle " + wiggle);
	// we iterate over the coordinates that have the same chevyshev distance (wiggle)
	for(var relx = -wiggle; relx <= wiggle; relx += 1) {
	    // true if the chebychev is ensured by x
	    var chebyshev_ensured = Math.abs(relx) == wiggle;
	    var ystart = chebyshev_ensured? 0 : wiggle;
	    var yincr = chebyshev_ensured? 1 : wiggle; 
	    console.log("try relx" + relx);
	    for(var rely = ystart; rely <= Math.min(wiggle, wiggle_up); ++rely) {
		console.log("try " + relx + ", " + rely);
		if(this.board.validate(this.brick, this.x + xs + relx, this.y + ys + rely, newRotation)) {
		    console.log("*** validated");
		    this.rotation = newRotation;
		    this.x += xs + relx;
		    this.y += ys + rely;
		    this.board.drawBrick(this.brick, this.x, this.y, this.rotation);
		    return;
		}
	    }
	}
    }
}

BrickController.prototype.doFallFast = function (enable) {
    if(enable != this.fallFast && this.timer > 0) {
	this.fallFast = enable;
	clearTimeout(this.timer);
	this.timer = 0;
	this.startTimer();
    }
}

function intRandom(n) {
    return Math.floor(Math.random()*n);
}

function randomElement(arr)
{
    return arr[intRandom(arr.length)];
}


function Game(gameConfig, previewPaper, mainPaper) {
    this.gameConfig = gameConfig;
    
    this.previewField = new FieldConfig(gameConfig, Snap("#preview"),
					gameConfig.previewGridWidth, gameConfig.previewGridHeight,
					false);
    this.mainFieldConfig = new FieldConfig(gameConfig, Snap("#main"),
					   gameConfig.gridWidth, gameConfig.gridHeight,
					   true);
    // holds the stones that were layed
    this.mainBoard = new Board(this.mainFieldConfig);
    this.brickController = new BrickController(this.mainBoard);

    // choose the first brick
    this.brick = this.randomBrick();
    this.previewBrick(this.brick);
}

Game.prototype.randomBrick = function () {
    return new Brick(randomElement(stoneConfigurations),
		     randomElement(gameConfig.figures));
}

Game.prototype.previewBrick = function (brick) {
    // get decimal middle
    var realMidX = (this.previewField.width - brick.rotatedWidth(0) - 1) / 2;
    var realMidY = (this.previewField.height - brick.rotatedHeight(0) - 1) / 2;
    brick.draw(this.previewField, realMidX, realMidY, 0);
}

Game.prototype.startGame = function () {
    this.startDropBrick();
}

Game.prototype.startDropBrick = function () { 
    var currentBrick = this.brick;
    currentBrick.remove();
    this.brick = this.randomBrick();
    this.previewBrick(this.brick);
    var that = this;
    this.brickController.start(currentBrick, function (nsteps) {
	if(nsteps > 0) {
	    that.startDropBrick();
	} else {
	    alert("game over");
	}
    });
}

Game.prototype.tryLeft = function () { this.brickController.move(-1); }
Game.prototype.tryRight = function () { this.brickController.move(1); }
Game.prototype.tryRotate = function () { this.brickController.rotate(1); }
Game.prototype.dropFast = function () { this.brickController.doFallFast(true); }
Game.prototype.dropNormal = function () { this.brickController.doFallFast(false); }

function setup() {
    var game = new Game(gameConfig, Snap("#preview"), Snap("#main"));
    $(document).keydown(function (evdata) {
	switch(evdata.keyCode) {
	case 37: // left
	    game.tryLeft()
	    break;
	case 39: // right
	    game.tryRight()
	    break;
	case 38: // up
	    game.tryRotate();
	    break;
	case 40: // down
	    game.dropFast();
	    break;
	}
    }).keyup(function (evdata) {
	switch(evdata.keyCode) {
	case 40: // down
	    game.dropNormal();
	    break;
	}
    });

    game.startGame();
}

