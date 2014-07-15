
// The character definition
var characterDef = {
	startX: -425,
	startY: 200,
	width: 10,
	height: 20,
	sideAccel: world.gravity,
	sideDecel: world.gravity / 2,
	ySpeedLimit: 20,
	sideSpeedLimit: 7,
	criticalAngle: Math.PI/4,
	jumpSpeed: 7,
	softener: .7 * world.gravity,
	softenTimerMax: 15,
}

var character = {
	obj: {},
	def: {},
	w: 0,
	h: 0,
	vel: [0,0],
	angle: 0,
	keystack: [],
	onGround: true, 
	softenTimer: 0, // For softening gravity during jump
	init: function(def) {
		
		console.log(def);
		
		// Stores the vals for various functions to use
		this.def = def;
		
		// Creates the character's physics object
		this.obj = makeRect(def.startX,
							def.startY,
							def.width,
							def.height,
							0,
							color(255,255,255));
		
		// Sets up key input
		ch = this;
		document.onkeydown = function(keyinfo) {
			ch.keystack = removeObj(ch.keystack, "keyCode", keyinfo.keyCode);
			ch.keystack = ch.keystack.concat(keyinfo);
		}
		document.onkeyup = function(keyinfo) {
			ch.keystack = removeObj(ch.keystack, "keyCode", keyinfo.keyCode);
		}
	},
	com: function() {return this.obj.com()},
	x: function() {return this.obj.com()[0]},
	y: function() {return this.obj.com()[1]},
	move: function(v) {return this.obj.move(v)},
	rotate: function(angle, about) {
		// Rotates about center of mass
		if(!about) {about = this.com();}
		this.angle += angle;
		this.obj.rotate(angle, about);
	},
	unitHorz: function() {return geom.rotate([1,0], this.angle);},
	unitVert: function() {return geom.rotate([0,1], this.angle);},
	applyVel: function(rt) {
		// Applies velocity over ratio time rt
		this.move(geom.mul(this.vel, rt))
	},
	limitSpeeds: function() {
		this.vel = geom.vlimit(this.vel, this.unitHorz(), this.def.sideSpeedLimit);
		this.vel = geom.vlimit(this.vel, [0,1], this.def.ySpeedLimit);
	},
	restoreRotation: function() {
		this.rotate(-this.angle);
	},
	handleCollisions: function(pVectors) {
		// Handles collisions
		// Removes perp vel, repositions and grounds character
		
		this.onGround = false;
		var groundingVectors = [];
		for (var i=0; i<pVectors.length; i++) {
			var pVector = pVectors[i];
			
			// Repositions and removes perp vel
			this.move(pVector);
			this.vel = geom.vproject(this.vel, geom.rotate(pVector, Math.PI/2));
			
			// Stores grounding vectors for processing last
			if(this.detectGround(pVector)) {
				groundingVectors = groundingVectors.concat([pVector]);
			}
		}
		
		// Handles grounding
		for(var i=0; i<groundingVectors.length; i++) {
			this.onGround = true;
			
			var pVector = groundingVectors[i]
			var currAngle = geom.vangle(pVector);
			
			// Determines the point about which to rotate
			var rotPt = geom.projectMinMax(this.obj.points, pVector)[0];
			var groundingAngle = currAngle - Math.PI/2;
			this.rotate(groundingAngle-this.angle, rotPt);
			
			// // Checks to see if now intersecting with more than projecting surface
			// var newPVectors = world.detectCollision(this.obj);
			// for(var j=0; j<newPVectors; j++) {
			// 	if(!geom.vparallel(newPVectors[j], pVector)) {
			// 		// It's probably not same surface
			// 		// Though this could be susceptible to bugs...
			// 		this.rotate(-groundingAngle, rotPt);
			// 		break;
			// 	}
			// }
		}
		
		// If not on a surface, sets upright
		if(!this.onGround) {this.restoreRotation()}
	},
	detectGround: function(pVector) {
		// Returns true if pVector is a grounding vector		
		var currAngle = geom.vangle(pVector);
		if((geom.vlen(pVector) > 0) &&
			(currAngle >= this.def.criticalAngle) &&
			(currAngle <= Math.PI - this.def.criticalAngle)) {
			
			return true;
		}
		return false;
	},
	jump: function(rt) {
		// Handles jump aspects, including takeoff & softening
		
		if(this.onGround) {
			var jumpVel = geom.mul(this.unitVert(), this.def.jumpSpeed);
			this.vel = geom.add(this.vel, jumpVel);
			this.softenTimer = this.def.softenTimerMax;
		
		} else {
			if(this.softenTimer > 0) {
				this.softenTimer -= rt;
				var softenVel = geom.mul(this.unitVert(), this.def.softener * rt);
				this.vel = geom.add(this.vel, softenVel);
			} else {
				this.softenTimer = 0;
			}
		}
	},
	moveSideways: function(rt, direction) {
		// Handles side-to-side motion
		// direction: Left = -1, Right = 1, Decel = 0
		
		// Filter input
		if(direction != 1 && direction != 0 && direction != -1) {
			direction = 0;
		}
		
		var currSideSpeed = geom.dot(this.vel, this.unitHorz());	
		
		// Accelerates
		if(direction) {
			// Calculates and limits the current side speed
			var newSideSpeed = currSideSpeed + this.def.sideAccel * direction * rt;
			
			// Removes current horz velocity and adds new velocity
			this.vel = geom.vproject(this.vel, this.unitVert());
			this.vel = geom.add(this.vel, geom.mul(this.unitHorz(), newSideSpeed));
			
		// Decelerates
		} else if(this.onGround) {
			// Calculates decel speed
			var decelSpeed = -sign(currSideSpeed) * this.def.sideDecel * rt;
			
			// Applies the decel, stopping completely if needed
			
			if(Math.abs(currSideSpeed) < Math.abs(decelSpeed)) {
				this.vel = geom.vproject(this.vel, this.unitVert());
			} else {
				this.vel = geom.add(this.vel, geom.mul(this.unitHorz(), decelSpeed));
			}
		}
	},
	update: function(rt) {
		// Updates over dt time ticks
		
		// Key input variables
		var direction = 0;
		var up = false; 
		
		// Key input
		for(var i=0; i<this.keystack.length; i++) {
			key = this.keystack[i].keyIdentifier;
			keycode = this.keystack[i].keyCode;
			
			if(key == "Right") {
				direction = 1;
			} else if(key == "Left") {
				direction = -1;
			} else if(key == "Up") {
				up = true;
			}
		}
		
		// Motion
		
		// TODO: Implement a real physics engine with objects that move
		// When this happens, I'd still like to keep the main character a special case
		
		// Desired:
		// - General
		//   > Put hard limits on character's x and y velocities
		// - Collisions
		//   > Collisions should adjust position
		//   > They should also remove all velocity perp. to surface
		//   > On critically angled surface, starts to decelerate
		// - On the ground
		//   > Left and right arrows change "side velocity"
		//   > Side vel angle adjusts to surface angle
		// - On jump
		//   > Set speed to flat #, perpendicular to surface
		//   > If "up" is held, sofen fall for fixed time count
		//   > Reset count if "up" released (but NOT on collision)
		//   > Set character orientation to vertical
		
		// Order:
		// 1) Update speeds
		//   - Handle jump / softening
		//   - Update side vel
		//   - Add gravity
		// 2) Move & rotate character
		// 3) Detect/resolve collisions
		//   - Get projection vectors
		//   - Move & rotate character
		//   - Remove perp. velocities
		//   - Determine if on surface
		
		// Useful constants
		yLimit = 20;
		
		// Jumping
		if(up) {this.jump(rt)}
		
		// Sideways motion
		this.moveSideways(rt, direction);
		
		// Adds gravity
		this.vel = geom.add(this.vel, geom.mul([0,1], -1 * world.gravity * rt));
		
		// Speed limits
		this.limitSpeeds();
		
		// Moves the character
		this.applyVel(rt);
		
		// Interaction
		this.handleCollisions(world.detectCollision(this.obj));
		
	},
	draw: function() {
		this.obj.draw();
		vdraw(this.com(), geom.mul(this.vel, 10), color(255,0,0));
	}
}

character.init(characterDef);
