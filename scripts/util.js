// General setup and utility functions

canvas = document.getElementById("canvas")
c = canvas.getContext("2d")

// Returns the sign of num
var sign = function(num) {
	if(num>0) {return 1;}
	if(num<0) {return -1;}
	return 0;
}

// Returns the min of an array
var min = function(array) {
	if(!array.length) {return 0;} 
	var minel = Infinity;
	for(var i=0; i<array.length; i++) {
		if(array[i] < minel) {minel = array[i]}
	}
	return minel;
}

// Returns the max of an array
var max = function(array) {
	if(!array.length) {return 0;} 
	var maxel = -Infinity;
	for(var i=0; i<array.length; i++) {
		if(array[i] > maxel) {maxel = array[i]}
	}
	return maxel;
}

// Sums an array
var sum = function(array) {
	return array.reduce(function(a,b) {return a+b});
}

// Util method for arrays
// Removes the first instance of element from the array
var remove = function(array, element) {
	for(var i=0; i<array.length; i++) {
		if(array[i] == element) {
			array.splice(i,1)
			return array
		}
	}
	return array
}

// Removes an object from an array based on a key-value match
var removeObj = function(array, key, value) {
	for(var i=0; i<array.length; i++) {
		if(array[i][key] == value) {
			array.splice(i,1)
			return array
		}
	}
	return array
}

// Util method for arrays
// Checks whether the array contains element e
var contains = function(array, element) {
	return array.filter(function(e) {return e==element}).length > 0
}

// Creates a color object
var color = function(r,g,b) {
	return {
		r: r, 
		g: g,
		b: b,
		str: function() {
			return "rgb("+r+","+g+","+b+")";
		}
	}
}

// Contains viewport info and methods
viewport = {
	centerX: 0,
	centerY: 0,
	zoom: 1, // Pixels / in-game units
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

// Sets up the canvas
viewport.resizeCanvas();

// Handles browser resize
window.onresize = function() {
	viewport.resizeCanvas();
}
