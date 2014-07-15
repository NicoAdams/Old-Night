// Stores the character's data
var characterWidth = 10, characterHeight = 20;

var character = {
	obj: makeRect(-425,
				  200,
				  characterWidth,
				  characterHeight,
				  0,
				  color(255,255,255)),
	w: characterWidth,
	h: characterHeight,
	vel: [0,0],
	angle: 0,
	keystack: [],
	onGround: true, 
	softenTimer: 0, // For softening gravity during jump
	com: function() {return this.obj.com()},
	x: function() {return this.obj.com()[0]},
	y: function() {return this.obj.com()[1]},
	move: function(v) {return this.obj.move(v)},
	init: function() {
		ch = this;
		document.onkeydown = function(keyinfo) {
			ch.keystack = removeObj(ch.keystack, "keyCode", keyinfo.keyCode);
			ch.keystack = ch.keystack.concat(keyinfo);
		}
		document.onkeyup = function(keyinfo) {
			ch.keystack = removeObj(ch.keystack, "keyCode", keyinfo.keyCode);
		}
	},
	rotate: function(angle, about) {
		// Rotates about center of mass
		if(!about) {about = this.com();}
		this.angle += angle;
		this.obj.rotate(angle, about);
	},
	unitHorz: function() {return rotate([1,0], this.angle);},
	unitVert: function() {return rotate([0,1], this.angle);},
	applyVel: function(rt) {
		// Applies velocity over ratio time rt
		this.move(mul(this.vel, rt))
	},
	limitSpeeds: function() {
		var sideSpeedLimit = 7;
		var ySpeedLimit = 20;
		
		this.vel = vlimit(this.vel, this.unitHorz(), sideSpeedLimit);
		this.vel = vlimit(this.vel, [0,1], ySpeedLimit);
	},
	restoreRotation: function() {
		this.rotate(-this.angle);
	},
	handleCollisions: function(pVectors) {
		// Handles collisions
		// Removes perp vel, repositions and grounds character
		
		this.onGround = false;
//		this.restoreRotation();
		var groundingVectors = [];
		for (var i=0; i<pVectors.length; i++) {
			var pVector = pVectors[i];
			
			// Repositions and removes perp vel
			this.move(pVector);
			this.vel = vproject(this.vel, rotate(pVector, Math.PI/2));
			
			// Stores grounding vectors for processing last
			if(this.detectGround(pVector)) {
				groundingVectors = groundingVectors.concat([pVector]);
			}
		}
		
		// Handles grounding
		for(var i=0; i<groundingVectors.length; i++) {
			this.onGround = true;
			
			var pVector = groundingVectors[i]
			var currAngle = vangle(pVector);
			
			// Determines the point about which to rotate
			var rotPt = projectMinMax(this.obj.points, pVector)[0];
			var groundingAngle = currAngle - Math.PI/2;
			this.rotate(groundingAngle-this.angle, rotPt);
			
			// // Checks to see if now intersecting with more than projecting surface
			// var newPVectors = world.detectCollision(this.obj);
			// for(var j=0; j<newPVectors; j++) {
			// 	if(!vparallel(newPVectors[j], pVector)) {
			// 		// It's probably not same surface
			// 		// Though this could be susceptible to bugs...
			// 		this.rotate(-groundingAngle, rotPt);
			// 		break;
			// 	}
			// }
		}
		
		// If not on a surface, sets upright
		if(!this.onGround) {this.restoreRotation();}
	},
	detectGround: function(pVector) {
		// Returns true if pVector is a grounding vector
		
		// Critical angle
		var criticalAngle = Math.PI/4;
		
		// Detects if within critical angle
		var currAngle = vangle(pVector);
		if(vlen(pVector) &&
			(currAngle >= criticalAngle) &&
			(currAngle <= Math.PI - criticalAngle)) {
			
			return true;
		}
		return false;
	},
	jump: function(rt) {
		// Handles jump aspects, including takeoff & softening
		
		// Useful values
		var jumpSpeed = 7,
			softener = .7 * world.gravity * rt,
			softenTimerMax = 15;
		
		if(this.onGround) {
			var jumpVel = mul(this.unitVert(), jumpSpeed);
			this.vel = add(this.vel, jumpVel);
			this.softenTimer = softenTimerMax;
		
		} else {
			if(this.softenTimer > 0) {
				this.softenTimer -= rt;
				var softenVel = mul(this.unitVert(), softener);
				
				this.vel = add(this.vel, softenVel);
			} else {
				this.softenTimer = 0;
			}
		}
	},
	moveSideways: function(rt, direction) {
		// Handles side-to-side motion
		// direction: Left = -1, Right = 1, Decel = 0
		
		// Useful constants
		var sideAccel = world.gravity,
			sideDecel = world.gravity / 2;
		
		// Filter input
		if(direction != 1 && direction != 0 && direction != -1) {
			direction = 0;
		}
		
		var currSideSpeed = dot(this.vel, this.unitHorz());	
		
		// Accelerates
		if(direction) {
			// Calculates and limits the current side speed
			var newSideSpeed = currSideSpeed + sideAccel * direction * rt;
			
			// Removes current horz velocity and adds new velocity
			this.vel = vproject(this.vel, this.unitVert());
			this.vel = add(this.vel, mul(this.unitHorz(), newSideSpeed));
			
		// Decelerates
		} else if(this.onGround) {
			// Calculates decel speed
			var decelSpeed = -sign(currSideSpeed) * sideDecel * rt;
			
			// Applies the decel, stopping completely if needed
			
			if(Math.abs(currSideSpeed) < Math.abs(decelSpeed)) {
				this.vel = vproject(this.vel, this.unitVert());
			} else {
				this.vel = add(this.vel, mul(this.unitHorz(), decelSpeed));
			}
		}
	},
	update: function(dt) {
		// Updates over dt time ticks
		
		var st = 30; // Standard time (what I originally chose as a time tick)
		var rt = dt/st; // Ratio time
		
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
		this.vel = add(this.vel, mul([0,1], -1 * world.gravity * rt));
		
		// Speed limits
		this.limitSpeeds();
		
		// Moves the character
		this.applyVel(rt);
		
		// Interaction
		this.handleCollisions(world.detectCollision(this.obj));
		
	},
	draw: function() {
		this.obj.draw();
		vdraw(this.com(), mul(this.vel, 10), color(255,0,0));
	}
}

character.init();
world.addCharacter(character);

