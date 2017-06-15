var Coord = function (x,y) {
    this.x = x;
    this.y = y;
};

// cell coordinates.
var CoordBuilder = function() {
};

CoordBuilder.prototype.make = function (x, y) {
    return new Coord(x,y);
};

// gets a list of Coord and returns the bounding box
CoordBuilder.prototype.boundingBox = function (l) {
    if(l.length > 0) {
	var x1 = Number.POSITIVE_INFINITY;
	var y1 = Number.POSITIVE_INFINITY;
	var x2 = Number.NEGATIVE_INFINITY;
	var y2 = Number.NEGATIVE_INFINITY;
	
	for(var i = 0; i < l.length; ++i) {
	    var c = l[i];
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
};

module.exports = new CoordBuilder();















