// Stores data about the character and gameplay

// BUG: Can fall through surfaces with long enough dt's
// BUG: Can slip through corner cracks
// Solution: Multisampling

// BUG: Gets stuck at object corners
// Not sure why this happens

/* TODO
 * - Multisampled collision detection/resolution system
 * - Refactor code into modules intelligently
 */

// Sets the zoom
viewport.zoom = 1.5;

// Some triangles
world.addObject(makePoly([[-250,1], [-250,50], [-100,1]], color(0,200,100)));
world.addObject(makePoly([[-400,50], [-350,50], [-400,200]], color(0,200,100)));
world.addObject(makePoly([[-350,0], [-350,50], [-250,50], [-250,0]], color(0,200,100)));
world.addObject(makePoly([[-400,0], [-400,200], [-600,0]], color(0,200,100)));
world.addObject(makeRect(-380, 125, 70, 5, -Math.PI/4, color(0,200,100)));

// The ground
world.addObject(makePoly([[-1000,0],
						  [-1000,-50],
						  [1000,-50],
						  [1000,0]], color(200,200,200)));

// Updating code

// Keeps time
var makeTimer = function() {
	var timer = {
		getTime: function() {
			return (new Date).getTime();
		},
		last: 0,
		dt: function() {
			var newTime = this.getTime();
			var change = newTime - this.last;
			this.last = newTime;
			return change;
		},
		init: function() {
			this.last = this.getTime();
			return this;
		}	
	}; return timer.init();
}
var timer = makeTimer();

// Updates the viewport
var updateViewport = function() {
	var com = world.character.com();
	viewport.centerX = com[0];
	viewport.zoom = Math.min(Math.max(Math.pow(1.001, viewport.centerX), .7), 3)
}
updateViewport();

var maxDt = 80;
var tickfunction = function() {
	viewport.clear();
	world.update(Math.min(timer.dt(), maxDt));
	updateViewport();
	world.draw();
}

setInterval(tickfunction, 0);
