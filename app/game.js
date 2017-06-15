var Board = require("./board.js");
import Brick from "./brick.js";
import Figures from "./figures.js";
import BrickController from "./brick_controller.js";

export default
function Game(previewPaper,
	      mainPaper,
	      cellPxSize,
	      haveGravity,
	      gravitySpeed,
	      initialFallDuration,
	      fastFallDuration)
{
    this.previewBoard = new Board(previewPaper, cellPxSize, false, gravitySpeed);
    this.mainBoard = new Board(mainPaper, cellPxSize, haveGravity, gravitySpeed);
    this.brickController = new BrickController(this.mainBoard, initialFallDuration, fastFallDuration);

    this.brick = this.randomBrick();
    this.previewBrick(this.brick);
}

Game.prototype.randomBrick = function () {
    return new Brick(Figures.randomFigure());
};

Game.prototype.previewBrick = function (brick) {
    // get decimal middle
    var realMidX = (this.previewBoard.width - brick.rotatedWidth(0)) / 2;
    var realMidY = (this.previewBoard.height - brick.rotatedHeight(0)) / 2;
    brick.draw(this.previewBoard, realMidX, realMidY, 0);
};

Game.prototype.startGame = function (gameFinishedCallback) {
    this.gameFinishedCallback = gameFinishedCallback;
    this.startDropBrick();
};

Game.prototype.startDropBrick = function () { 
    var currentBrick = this.brick;
    currentBrick.removeFromPaper();
    this.brick = this.randomBrick();
    this.previewBrick(this.brick);
    var that = this;
    this.brickController.start(currentBrick, function (nsteps) {
	if(nsteps > 0) {
	    that.startDropBrick();
	} else {
	    that.gameFinishedCallback();
	}
    });
};

Game.prototype.tryLeft = function () {
    this.brickController.move(-1);
};

Game.prototype.tryRight = function () {
    this.brickController.move(1);
};

Game.prototype.tryRotate = function () {
    this.brickController.rotate(1);
};

Game.prototype.dropFast = function () {
    this.brickController.doFallFast(true);
};

Game.prototype.dropNormal = function () {
    this.brickController.doFallFast(false);
};

Game.prototype.togglePause = function () {
    this.brickController.togglePause();
};


