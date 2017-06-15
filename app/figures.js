var c = require("./coord.js");

var Figure = function() {
    this.rotations = [];
};

Figure.prototype.getRotation = function (rot) {
    return this.rotations[rot % this.rotations.length ];
};

// the originPostitions denote the placement of the figure relative to
// the previous rotation form. Multiple are posible to allow for some
// wiggling when there are obstructing stones in the field 
Figure.prototype.addRotation = function(stoneList, originPositions) {
    var bound = c.boundingBox(stoneList);
    this.rotations.push({
	stoneList: stoneList,
	originPositions: originPositions,
	// our figures have x and y =0
	w: (bound.x + bound.w),
	h: (bound.y + bound.h),
    });
    return this;
};

Figure.prototype.setImageSrc = function (imageSrc) {
    this.imageSrc = imageSrc;
    return this;
};

Figure.prototype.makeMirror = function () {
    var m = new Figure();
    for(var i = 0; i < this.rotations.length; ++i) {
	var r = this.rotations[i];
	var w = r.w;
	// "jshint" complains here, but this is not a performance problem
	m.addRotation(Array.from(r.stoneList,
				 function (p) { return c.make(w - p.x, p.y); }), // jshint ignore:line
		      r.originPositions);
    }
    return m;
};

var rightHookFigure = new Figure()
    .setImageSrc("images/bluestone.jpg")
// xx
// x
// x
    .addRotation([c.make(0,0), c.make(0,1), c.make(0,2), c.make(1,2)],
		 [c.make(1,0), c.make(0,0)])
// xxx
//   x
    .addRotation([c.make(0,1), c.make(1,1), c.make(2,1), c.make(2, 0)],
		 [c.make(-1,0), c.make(0,0)])
//  x
//  x
// xx
    .addRotation([c.make(1,0), c.make(1,1), c.make(1,2), c.make(0,0)],
		 [c.make(1,0), c.make(0,0)])
// x
// xxx
    .addRotation([c.make(0,0), c.make(1,0), c.make(2,0), c.make(0, 1)],
		 [c.make(-1,0), c.make(0,0)]);

var rightStepFigure = new Figure()
    .setImageSrc("images/greenstone.jpg")
//  xx
// xx
    .addRotation([c.make(0,0), c.make(1,0), c.make(1,1), c.make(2,1)],
		 [c.make(-1,0), c.make(0,0)])
// x
// xx
//  x
    .addRotation([c.make(0,2), c.make(0,1), c.make(1,1), c.make(1,0)],
		 [c.make(1,0), c.make(0,0)]);

var tFigure = new Figure()
    .setImageSrc("images/magentastone.jpg")
// xxx
//  x
    .addRotation([c.make(0,1), c.make(1,1), c.make(2,1), c.make(1,0)],
		 [c.make(-1,0), c.make(0,0)])
//  x
// xx
//  x
    .addRotation([c.make(1,0), c.make(1,1), c.make(1,2), c.make(0,1)],
		 [c.make(1,0), c.make(0,0)])
//  x
// xxx
    .addRotation([c.make(0,0), c.make(1,0), c.make(2,0), c.make(1,1)],
		 [c.make(-1,0), c.make(0,0)])
// x
// xx
// x
    .addRotation([c.make(0,0), c.make(0,1), c.make(0,2), c.make(1,1)],
		 [c.make(1,0), c.make(0,0)]);

var squareFigure = new Figure()
    .setImageSrc("images/yellowstone.jpg")
// xx
// xx
    .addRotation([c.make(0,0), c.make(1,0), c.make(0,1), c.make(1,1)],
		 [c.make(0,0)]);

var stickFigure = new Figure()
    .setImageSrc("images/cyanstone.jpg")
// xxxx
    .addRotation([c.make(0,0), c.make(1,0), c.make(2,0), c.make(3,0)],
		 [c.make(-1,0), c.make(-2,0), c.make(0,0), c.make(-3,0)])
// x
// x
// x
// x
    .addRotation([c.make(0,0), c.make(0,1), c.make(0,2), c.make(0,3)],
		 [c.make(1,0), c.make(2,0), c.make(0,0), c.make(3,0)]);


var Figures = function() {
    this.figures = [ rightHookFigure,
		     rightHookFigure.makeMirror().setImageSrc("images/orangestone.jpg"),
		     rightStepFigure,
		     rightStepFigure.makeMirror().setImageSrc("images/redstone.jpg"),
		     squareFigure,
		     stickFigure,
		     tFigure
		   ];
};

Figures.prototype.randomFigure = function () {
    return this.figures[Math.floor(Math.random()*this.figures.length)];
};

export default new Figures();










