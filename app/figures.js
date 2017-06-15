import c from "./coord.js";

let Figure = function() {
    this.rotations = [];
};

Figure.prototype.getRotation = function (rot) {
    return this.rotations[rot % this.rotations.length ];
};

// the originPositions allows to place the brick at multiple locations
// to allow for some wiggling to fit into the board.
Figure.prototype.addRotations = function(stoneList, originPositions, n) {
    let bound = c.boundingBox(stoneList);
    let w = bound.x + bound.w;
    let h = bound.y + bound.h;

    this.rotations.push({ stoneList, originPositions, w, h});
    // calculate the other rotations:
    for(let i = 1; i < n; ++i) {
	[w, h] = [h, w];
	stoneList = stoneList.map(cd => c.make(cd.y, h - 1 - cd.x)); // jshint ignore:line
	originPositions = originPositions.map(cd => c.make(-cd.x, cd.y)); // jshint ignore:line
	this.rotations.push({ stoneList, originPositions, w, h});
    }
    
    return this;
};

Figure.prototype.setImageSrc = function (imageSrc) {
    this.imageSrc = imageSrc;
    return this;
};

Figure.prototype.makeMirror = function () {
    let m = new Figure();
    let r = this.rotations[0];
    let w = r.w;
    m.addRotations(r.stoneList.map(p => c.make(w - 1 - p.x, p.y)), 
		   r.originPositions, this.rotations.length);

    return m;
};

let wiggle3x2 = [c.make(-1,0), c.make(0,0)];
let nowiggle = [c.make(0,0)];
let wiggle4x1 = [c.make(-1,0), c.make(-2,0), c.make(0,0), c.make(-3,0)];

// xxx
//   x
let rightHookFigure = new Figure()
    .setImageSrc("images/bluestone.jpg")
    .addRotations([c.make(0,1), c.make(1,1), c.make(2,1), c.make(2,0)],
		  wiggle3x2, 4);

//  xx
// xx
let rightStepFigure = new Figure()
    .setImageSrc("images/greenstone.jpg")
    .addRotations([c.make(0,0), c.make(1,0), c.make(1,1), c.make(2,1)],
		  wiggle3x2, 2);

// xxx
//  x
let tFigure = new Figure()
    .setImageSrc("images/magentastone.jpg")
    .addRotations([c.make(0,1), c.make(1,1), c.make(2,1), c.make(1,0)],
		  wiggle3x2, 4);

// xx
// xx
let squareFigure = new Figure()
    .setImageSrc("images/yellowstone.jpg")
    .addRotations([c.make(0,0), c.make(1,0), c.make(0,1), c.make(1,1)],
		  nowiggle, 1);

// xxxx
let stickFigure = new Figure()
    .setImageSrc("images/cyanstone.jpg")
    .addRotations([c.make(0,0), c.make(1,0), c.make(2,0), c.make(3,0)],
		 wiggle4x1, 2);


let Figures = function() {
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










