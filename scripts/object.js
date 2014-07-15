// Code for creating/handling objects

// Creates a poly object
var makePoly = function(points, col) {
	return {
		points: points,
		col: col,
		com: function() {
			var totals = [0,0];
			for(var i=0; i<this.points.length; i++) {
				var pt = this.points[i];
				totals[0] += pt[0];
				totals[1] += pt[1];
			}
			totals[0] /= this.points.length;
			totals[1] /= this.points.length;
			return totals;
		},
		move: function(change) {
			for(var i=0; i<points.length; i++) {
				points[i][0] += change[0];
				points[i][1] += change[1];
			}
		},
		rotate: function(angle, about) {
			for(var i=0; i<points.length; i++) {
				points[i] = geom.rotateAbout(points[i], angle, about);
			}
		},
		draw: function() {
			if(this.points.length) {
				c.beginPath();
				var pt = viewport.toScreen(this.points[0]);
				
				c.moveTo(pt[0], pt[1]);
				for(var i=1; i<this.points.length; i++) {
					var pt = viewport.toScreen(this.points[i]);
					c.lineTo(pt[0], pt[1]);
				}
				c.setFillColor(this.col.str());
				c.fill();
			}
		}
	}
}

// Creates a rectangle object
var makeRect = function(x, y, w, h, theta, col) {
	var points = [];
	var wx = w * Math.cos(theta), wy = w * Math.sin(theta);
	var hx = h * -Math.sin(theta), hy = h * Math.cos(theta);
	
	return makePoly([[x, y], [x+wx, y+wy], [x+wx+hx, y+wy+hy], [x+hx, y+hy]], col);
}

// Draws a vector
var vdraw = function(center, vector, color) {
	var r = makeRect(center[0], center[1], geom.vlen(vector), 3, geom.vangle(vector), color);
	r.draw();
}
