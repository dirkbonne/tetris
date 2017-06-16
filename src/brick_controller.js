var STATE_NOT_STARTED = 0;
var STATE_RUNNING = 1;
var STATE_WAIT4TIMER = 2;
var STATE_CEMENT_BRICK = 3;

export default function BrickController(board, fallDuration, fastFallDuration) {
    this.board = board;
    this.fallDuration = fallDuration;
    this.fastFallDuration = fastFallDuration;

    this.state = STATE_NOT_STARTED;
    this.brick = null;
    this.timer = null;
    this.isPaused = false;
}

BrickController.prototype.start = function (brick, finishedCallback)
{
    this.isPaused = false;
    this.fallFast = false;
    this.state = STATE_RUNNING;
    
    this.brick = brick;
    this.x = Math.floor((this.board.width - brick.rotatedWidth(0)) / 2);
    this.y = this.board.height - brick.rotatedHeight(0) + 1; // will get decremented immediately
    this.rotation = 0;

    this.finishedCallback = finishedCallback;
    this.nsteps = 0;
    
    this.startTimer();
};

BrickController.prototype.startTimer = function () {
    var that = this;
    this.state = STATE_WAIT4TIMER;
    if(this.timer > 0) console.log("oops timer not 0");
    this.timer = setTimeout(() => {
	that.timer = 0; // more for debugging purposes, to see if two timers are started at once
	that.doStep();
    }, this.fallFast? this.fastFallDuration : this.fallDuration);
};

BrickController.prototype.togglePause = function ()
{
    this.isPaused = !this.isPaused;
    if(!this.isPaused) {
	this.doStep();
    }
};

BrickController.prototype.doStep = function ()
{
    this.state = STATE_RUNNING;
    
    if(this.isPaused) {
	return;
    } else if(!this.brick.validate(this.board, this.x, this.y - 1, this.rotation)) {
	this.state = STATE_CEMENT_BRICK;
	// TODO: here we must wait for animation
	this.brick.cementStones(this.board, this.x, this.y, this.rotation);
	this.board.foldStones();
	// loose the brick
	this.state = STATE_NOT_STARTED;
	this.brick = null;
	this.finishedCallback(this.nsteps);
    } else {
	++this.nsteps;
	--this.y;
	this.brick.draw(this.board, this.x, this.y, this.rotation);
	this.startTimer();
    }
};

BrickController.prototype.move = function (delta) {
    if(this.isPaused || this.state == STATE_NOT_STARTED) return;
    if(this.brick.validate(this.board, this.x + delta, this.y, this.rotation)) {
	this.x += delta;
	this.brick.draw(this.board, this.x, this.y, this.rotation);
    }
};

BrickController.prototype.rotate = function (rot) {
    if(this.isPaused || this.state == STATE_NOT_STARTED) return;
    var newRotation = this.rotation + rot;

    var newOrigin = this.brick.validateWithWiggle(this.board, this.x, this.y, newRotation);
    if(newOrigin) {
	this.x = newOrigin.x;
	this.y = newOrigin.y;
	this.rotation = newRotation;
	this.brick.draw(this.board, this.x, this.y, this.rotation);
    }
};

BrickController.prototype.doFallFast = function (enable) {
    if(this.isPaused || this.state == STATE_NOT_STARTED) return;

    if(enable != this.fallFast && this.timer > 0) {
	this.fallFast = enable;
	clearTimeout(this.timer);
	this.timer = 0;
	this.startTimer();
    }
};
