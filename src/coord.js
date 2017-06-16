class Coord {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

// cell coordinates.
class CoordBuilder {
    constructor() {
    }

    make (x, y) {
        return new Coord(x,y);
    }

    // gets a list of Coord and returns the bounding box
    boundingBox (l) {
        if(l.length > 0) {
	    let x1 = Number.POSITIVE_INFINITY;
	    let y1 = Number.POSITIVE_INFINITY;
	    let x2 = Number.NEGATIVE_INFINITY;
	    let y2 = Number.NEGATIVE_INFINITY;
	    
	    for(let i = 0; i < l.length; ++i) {
	        const c = l[i];
	        if(c.x < x1) x1 = c.x;
	        if(c.x > x2) x2 = c.x;
	        if(c.y < y1) y1 = c.y;
	        if(c.y > y2) y2 = c.y;
	    }
	    return {
	        x: x1, y: y1, w: (1+x2-x1), h: (1+y2-y1)
	    };
        } else {
	    return {
	        x: 0, y: 0, w: 0, h: 0
	    };
        }
    }
}

export default new CoordBuilder();
















