import Snap from "snapsvg";
import Game from "./game.js";
import $ from "jquery";

export default function setup() {
    var game = new Game(Snap("#preview"),
			Snap("#main"),
			40,
			true,
			100,
			500,
			30);
    
    $(document)
	.keydown(function (evdata) {
	    switch(evdata.keyCode) {
	    case 37: // left
	    case 65: // left
		game.tryLeft();
		break;
	    case 39: // right
	    case 68: // right
		game.tryRight();
		break;
	    case 38: // up
	    case 87: // up
		game.tryRotate();
		break;
	    case 40: // down
	    case 83: // down
		game.dropFast();
		break;
	    case 32: // space
		game.togglePause();
	    break;
	}
	})
	.keyup(function (evdata) {
	    switch(evdata.keyCode) {
	    case 40: // down
		game.dropNormal();
		break;
	    }
    });

    game.startGame();
}

