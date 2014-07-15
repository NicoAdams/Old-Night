
var world = {
	gravity: .6,
	objects: [],
	character: null,
	addCharacter: function(character) {
		// Adds the character
		this.character = character;
		this.character.init();
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
			var overlap = intersection(obj.points, currObj.points);
			if(vlen(overlap)) {
				pvectors = pvectors.concat([overlap]);
			}
		}
		return pvectors;
	},
	update: function(dt) {
		// TODO Actually include dt in this calculation
		character.update(dt);
	},
	draw: function() {
		for(var i=0; i<this.objects.length; i++) {
			this.objects[i].draw();
		}
		this.character.draw();
	},

}
