
// Game world
var world = {
	gravity: .6,
	objects: [],
	character: null,
	standardTimeTick: 30, // Arbitrary speed constant
	addCharacter: function(character) {
		// Adds the character
		this.character = character;
	},
	addObject: function(obj) {
		// Adds an object to the world
		this.objects = this.objects.concat(obj);
	},
	detectCollision: function(obj) {
		// Returns the projection vector to return the object to safety
		var pvectors = [];
		for(var i=0; i<this.objects.length; i++) {
			var currObj = this.objects[i];
			var overlap = geom.intersection(obj.points, currObj.points);
			if(geom.vlen(overlap)) {
				pvectors = pvectors.concat([overlap]);
			}
		}
		return pvectors;
	},
	update: function(dt) {
		var rt = dt / this.standardTimeTick; // "Ratio time"
		character.update(rt);
	},
	draw: function() {
		for(var i=0; i<this.objects.length; i++) {
			this.objects[i].draw();
		}
		this.character.draw();
	},

}
