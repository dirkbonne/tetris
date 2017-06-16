import c from "./coord.js";
import bluestone from "./images/bluestone.jpg";
import cyanstone from "./images/cyanstone.jpg";
import greenstone from "./images/greenstone.jpg";
import magentastone from "./images/magentastone.jpg";
import orangestone from "./images/orangestone.jpg";
import redstone from "./images/redstone.jpg";
import yellowstone from "./images/yellowstone.jpg";

class Figure {
    constructor() {
        this.rotations = [];
    }

    getRotation (rot) {
        return this.rotations[rot % this.rotations.length ];
    }

    // the originPositions allows to place the brick at multiple locations
    // to allow for some wiggling to fit into the board.
    addRotations (stoneList, originPositions, n) {
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
    }

    setImageSrc (imageSrc) {
        this.imageSrc = imageSrc;
        return this;
    }

    makeMirror () {
        let m = new Figure();
        let r = this.rotations[0];
        let w = r.w;
        m.addRotations(r.stoneList.map(p => c.make(w - 1 - p.x, p.y)), 
		       r.originPositions, this.rotations.length);
        
        return m;
    }
}

let wiggle3x2 = [c.make(-1,0), c.make(0,0)];
let nowiggle = [c.make(0,0)];
let wiggle4x1 = [c.make(-1,0), c.make(-2,0), c.make(0,0), c.make(-3,0)];

// xxx
//   x
let rightHookFigure = new Figure()
    .setImageSrc(bluestone)
    .addRotations([c.make(0,1), c.make(1,1), c.make(2,1), c.make(2,0)],
		  wiggle3x2, 4);

//  xx
// xx
let rightStepFigure = new Figure()
    .setImageSrc(greenstone)
    .addRotations([c.make(0,0), c.make(1,0), c.make(1,1), c.make(2,1)],
		  wiggle3x2, 2);

// xxx
//  x
let tFigure = new Figure()
    .setImageSrc(magentastone)
    .addRotations([c.make(0,1), c.make(1,1), c.make(2,1), c.make(1,0)],
		  wiggle3x2, 4);

// xx
// xx
let squareFigure = new Figure()
    .setImageSrc(yellowstone)
    .addRotations([c.make(0,0), c.make(1,0), c.make(0,1), c.make(1,1)],
		  nowiggle, 1);

// xxxx
let stickFigure = new Figure()
    .setImageSrc(cyanstone)
    .addRotations([c.make(0,0), c.make(1,0), c.make(2,0), c.make(3,0)],
		 wiggle4x1, 2);


class Figures {
    constructor() {
        this.figures = [ rightHookFigure,
		         rightHookFigure.makeMirror().setImageSrc(orangestone),
		         rightStepFigure,
		         rightStepFigure.makeMirror().setImageSrc(redstone),
		         squareFigure,
		         stickFigure,
		         tFigure
		       ];
    }

    randomFigure () {
        return this.figures[Math.floor(Math.random()*this.figures.length)];
    }
}

export default new Figures();










