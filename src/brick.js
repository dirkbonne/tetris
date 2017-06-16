import c from "./coord.js";

class Brick {
    constructor(figure) {
        this.figure = figure;
        this.imageSrc = figure.imageSrc;
        this.stones = [];
    }

    // given the new rotation and the position of the brick, return the new Coord of the
    // brick so it does not collide with stones in the board.
    // This function returns null if no valid origin was found
    validateWithWiggle (board, ox, oy, rot) {
        let origins = this.figure.getRotation(rot).originPositions;
        for(let i = 0; i < origins.length; ++i) {
	    let newox = ox + origins[i].x;
	    let newoy = oy + origins[i].y;
	    if(this.validate(board, newox, newoy, rot)) {
	        return c.make(newox, newoy);
	    }
        }
        return null;
    }

    rotatedWidth (rot) {
        return this.figure.getRotation(rot).w;
    }

    rotatedHeight (rot) {
        return this.figure.getRotation(rot).h;
    }

    validate (board, ox, oy, rot) {
        let stones = this.figure.getRotation(rot).stoneList;
        for(let j = 0; j < stones.length; ++j) {
	    if(null !== board.getStone(ox + stones[j].x, oy + stones[j].y))
	        return false;
        }
        return true;
    }

    draw (board, x, y, rot) {
        let form = this.figure.getRotation(rot).stoneList;
        let paper = board.paper;
        for(let i = 0; i < form.length; ++i) {
	    let c = form[i];
	    let pxx = board.getStonePxX(x + c.x);
	    let pxy = board.getStonePxY(y + c.y);
	    if(this.stones.length <= i) {
	        this.stones.push(paper.image(this.imageSrc, pxx, pxy,
					     board.cellPxSize,
					     board.cellPxSize));
	    } else {
	        let stone = this.stones[i];
	        stone.attr({ x: pxx, y: pxy });
	        if(stone.paper != paper) paper.append(stone);
	    }
        }
    }

    // put the stones on the board at the postion
    cementStones (board, x, y, rot) {
        // make sure it is drawn at the postion
        this.draw(board, x, y, rot);
        let form = this.figure.getRotation(rot).stoneList;
        for(let i = 0; i < form.length; ++i) {
	    let c = form[i];
	    board.setStone(x + c.x, y + c.y, this, this.stones[i]);
        }
        this.stones = [];
    }

    removeFromPaper() {
        for(let i = 0; i < this.stones.length; ++i) {
	    this.stones[i].remove();
        }
    }
}

export default Brick;
