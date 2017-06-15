import c from "./coord.js";

// This holds the snap.svg paper and does the conversion between grid
// coordinates and pixel paper coordinates
function Board(paper, cellPxSize, haveGravity, gravitySpeed) {
    // the snap paper to draw on
    this.paper = paper;
    // size of the cell
    this.cellPxSize = cellPxSize;
    // number of horizontal cells
    let bbox = paper.attr();
    this.width = Math.floor(bbox.width / cellPxSize);
    // number of cells stacked
    this.height = Math.floor(bbox.height / cellPxSize);
    // if no floating stones allowed
    this.haveGravity = haveGravity;
    this.gravitySpeed = gravitySpeed;
    this.islandIdCounter = 0;
    // set background:
    let r = paper.rect(0,0, this.cellPxSize*this.width, this.cellPxSize*this.height);
    r.attr({ fill: "#000000" });

    this.grid = new Array(this.height);
    for(let y = 0; y < this.grid.length; ++y) {
	let line = new Array(this.width);
	line.fill(null);
	this.grid[y] = line;
    } 
}

Board.prototype.isvalidxy = function (x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
};

const wallCell = {
    owner: null,
    element: null,
    connect: 0,
    grounded: true,
    islandId: 0,
};

Board.prototype.getStone = function(x,y) {
    if(y >= this.height) {
	return null; // open at the top
    } else if(!this.isvalidxy(x,y)) {
	// is taken, return dummy element
	return wallCell;
    } else {
	return this.grid[y][x];
    }
};

// to ease the iteration
// zero is up and must stay like this.
const adjacentDirections = [ c.make(0,1), c.make(1, 0), c.make(0, -1), c.make(-1, 0) ];

// setStone(x, y, null) : remove stone at (x,y). Any connections with
// surrounding stones is removed.
//
// setStone(x, y, brick, element): add stone and connect to the adjacent stones
// the owner is the brick the stone is from. This is useful for the
// gravity aware stones.
// I expect the stone was already drawn
Board.prototype.setStone = function(x, y, owner, element)
{
    if(this.isvalidxy(x,y)) {
	let cell = !owner? null : {
	    owner: owner,
	    element: element,
	    // we use connect to do an initial connect of the stones
	    // of a brick. Needed for gravity support
	    connect: 0,
	    // this is a to implement gravity support
	    grounded: false,
	    // when doing gravity
	    islandId: 0
	};
	let oldCell = this.grid[y][x];
	this.grid[y][x] = cell;
	if(oldCell && oldCell.element) {
	    oldCell.element.remove();
	}
	for(let i = 0; i < adjacentDirections.length; ++i) {
	    let c = adjacentDirections[i];
	    let other = this.getStone(x + c.x, y + c.y);
	    if(other) {
		let opposite = (i+2) % 4;
		if(cell) {
		    if(other.owner === owner) {
			other.connect |= 1 << opposite;
			cell.connect |= 1 << i;
		    }
		} else {
		    other.connect &= ~(1 << opposite);
		}
	    }
	}
    }
};

Board.prototype.clearGrid = function () {
    for(let y = 0; y < this.height; ++y) {
	for(let x = 0; x < this.width; ++x) {
	    this.setStone(x, y, null);
	}
    }
};

// calculates the lower-left corner of a cell
Board.prototype.getStonePxX = function (x) {
    return x * this.cellPxSize;
};

// calculates the lower.left corner of a cell
Board.prototype.getStonePxY = function (y) {
    return (this.height - 1 - y) * this.cellPxSize;
};

// rotate the lines downward starting from y0 + 1. y0 will move on top 
Board.prototype.rotateLines = function(y0) {
    let grid = this.grid;
    let line0 = grid[y0];
    for(let y = y0; y < grid.length; ++y) {
	const line = grid[y] = (y+1 == grid.length? line0 : grid[y+1]);
	const pxy = this.getStonePxY(y);
	for(let x = 0; x < line.length; ++x) {
	    let c = line[x];
	    if(c && c.element) {
		c.element.animate({ y: pxy }, this.gravitySpeed);
	    }
	}
    }
};

// fold lines without gravity
// returns the number of lines removed
Board.prototype.simpleFoldLines = function () {
    let linesRemoved = 0;
    let y = 0;
    while(y < this.height) {
	let line = this.grid[y];
	if(line.every(function(el) { return el !== null; })) {
	    ++linesRemoved;
	    for(let i = 0; i < this.width; ++i) {
		this.setStone(i, y, null); 
	    }
	    this.rotateLines(y);
	} else {
	    ++y;
	}
    }

    return linesRemoved;
};

// given a cell find all the cells  connected to it (inclusive the cell at x,y)
Board.prototype.calculateIslands = function()
{
    const grid = this.grid;
    
    function gather(x,y, id, coords) {
	const cell = grid[y][x];
	cell.islandId = id;
	coords.push(c.make(x, y));
	const connect = cell.connect;
	for(let i = 0; i < adjacentDirections.length; ++i) {
	    if(connect & (1 << i)) {
		let adj = adjacentDirections[i];
		const x2 = x + adj.x;
		const y2 = y + adj.y;
		const cell2 = grid[y2][x2];
		if(cell2.islandId !== id) {
		    gather(x2, y2, id, coords);
		}
	    }
	}
    }
    
    let islands = [];
    let idLowerbound = this.islandIdCounter;
    
    const width = this.width;
    const height = this.height;
    
    for(let y = 0; y < height; ++y) {
	const line = grid[y];
	for(let x = 0; x < width; ++x) {
	    const cell = line[x];
	    // only cells that are not grounded and not part of islands yet
	    if(cell && !cell.grounded && cell.islandId <= idLowerbound) {
		let island = {
		    id: ++this.islandIdCounter,
		    coords: []
		};
		islands.push(island);
		gather(x , y, island.id, island.coords);
	    }
	}
    }

    return islands;
};

// drop a gathered island, the island becomes grounded when one its
// stones lie on a grounded stone (note that a stone could also lie on
// another island)
//
// return true if the island dropped.
//
// We are a little lazy in the implementation here, we only drop one stone....
Board.prototype.dropIsland = function (island)
{
    if(island.coords.every(coord => {
	var y2 = coord.y - 1;
	if(this.isvalidxy(coord.x, y2)) {
	    let cell2 = this.grid[y2][coord.x];
	    // either drop in an empty cell or we drop onto a stone of an island which
	    // will drop too.
	    return cell2 === null || cell2.islandId == island.id;
	} else {
	    return false;
	}
    })) {
	// remove the cells from the grid:
	const tmpCells = island.coords.map(coord => {
	    const c = this.grid[coord.y][coord.x];
	    this.grid[coord.y][coord.x] = null;
	    return c;
	});
	
	for(let i = 0; i < island.coords.length; ++i) {
	    const coord = island.coords[i];
	    const cell =  tmpCells[i];
	    --coord.y;
	    this.grid[coord.y][coord.x] = cell;
	    if(cell.element) {
		cell.element.animate({ y: this.getStonePxY(coord.y) }, this.gravitySpeed);
	    }
	}

	return true;
    } 
    return false;
};

Board.prototype.gravityMark = function (x, y, c) {
    c.grounded = true;
    // check connected elements:
    const connect = c.connect;
    for(let i = 0; i < adjacentDirections.length; ++i) {
	// up is implied, otherwise we follow right, down and left 
	if(i === 0 || (connect & (1 << i))) {
	    let c = adjacentDirections[i];
	    let x2 = x + c.x;
	    let y2 = y + c.y;
	    if(this.isvalidxy(x2, y2)) {
		let c2 = this.grid[y2][x2];
		if(c2 && !c2.grounded)
		    this.gravityMark(x2, y2, c2);
	    }
	}
    }
};

// is really a a simple mark and sweep algorithm where the
// root objects are the stones on the ground
Board.prototype.gravityMarkAndDrop = function () {
    // clear the marks
    this.grid.forEach(line => line.forEach(c => {
	if(c) c.grounded = false;
    }));
    // mark from the ground up
    let bottomLine = this.grid[0];
    for(let x = 0; x < this.width; ++x) {
	if(bottomLine[x] && !bottomLine[x].grounded) {
	    this.gravityMark(x, 0, bottomLine[x]);
	}
    }

    // "sweep" phase
    //
    // we know which stones are floating, and these we can drop down. The
    // floating stones form "islands" of interconnected stones and these
    // must drop together.
    //
    // This algorithm keeps it simple by first getting all the islands and
    // then repeatedly dropping them until no movement happens anymore.
    const islands = this.calculateIslands();
    let dropped = false;
    let anyDrops = false;
    do {
	dropped = false;
	for(let island of islands) {
	    if(this.dropIsland(island)) {
		dropped = true;
		anyDrops = true;
	    }
	}
    } while(dropped);
    
    return anyDrops;
};

// checks for full lines and drops the stones.
//
// return number of lines removed
Board.prototype.foldStones = function() {
    let previousLinesRemoved;
    let linesRemoved = 0;
    do {
	previousLinesRemoved = linesRemoved;
	linesRemoved += this.simpleFoldLines();
    } while(previousLinesRemoved !== linesRemoved &&
	    this.haveGravity &&
	    this.gravityMarkAndDrop());
    
    return linesRemoved;
};

module.exports = Board;










