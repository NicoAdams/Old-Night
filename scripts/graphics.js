
// Creates global canvas and context
canvas = document.getElementById("canvas")
c = canvas.getContext("2d")

// Contains viewport info and methods
viewport = {
	centerX: 0,
	centerY: 0,
	zoom: 1, // Pixels / in-game units
	init: function() {
		// Sets up the canvas
		viewport.resizeCanvas();

		// Handles browser resize
		window.onresize = function() {
			viewport.resizeCanvas();
		}	
	},
	clear: function() {
		// Clears the screen
		// I have no idea why this works. It's a pretty great hack though
		canvas.width = canvas.width;
	},
	screenWidth: function() {
		// Returns the screen width
		return window.innerWidth
	},
	screenHeight: function() {
		// Returns the screen height
		return window.innerHeight
	},
	left: function() {
		// Returns the game coord of the left screen edge
		return this.centerX - (this.screenWidth() / 2) / this.zoom
	},
	right: function() {
		// Returns the game coord of the right screen edge
		return this.centerX + (this.screenWidth() / 2) / this.zoom
	},
	bottom: function() {
		// Returns the game coord of the bottom screen edge
		return -this.centerY - (this.screenHeight() / 2) / this.zoom
	},
	top: function() {
		// Returns the game coord of the top screen edge
		return -this.centerY + (this.screenHeight() / 2) / this.zoom
	},
	toScreen: function(coords) { 
		// Converts game coords to pixels
		var x = coords[0]
		var y = coords[1]
		var xval = (x - this.left()) * this.zoom
		var yval = (-y - this.bottom()) * this.zoom
		return [xval, yval]
	},
	toGame: function(coords) {
		// Converts pixels to game coords
		var x = coords[0]
		var y = coords[1]
		var xval = x / this.zoom + this.left()
		var yval = - (y / this.zoom + this.bottom())
		return [xval, yval]
	},
	resizeCanvas: function() {
		// Initializes the canvas
		canvas.width = this.screenWidth()
		canvas.height = this.screenHeight()
	}
}

