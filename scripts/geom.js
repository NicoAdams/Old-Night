// Returns true if a valid 2d vector
var validVector = function(vector) {
	if(vector.length != 2) {return false;}
	return true;
}

var veq = function(v1, v2) {
	return (v1[0] == v2[0]) && (v1[1] == v2[1]);
}

// Returns the length of the given vector
var vlen = function(vector) {
	return Math.sqrt(Math.pow(vector[0],2) + Math.pow(vector[1],2));
}

// Returns the length of the given vector
var vangle = function(vector) {
	return Math.atan2(vector[1], vector[0]);
}

// Sums 2 vectors
var add = function(v1, v2) {
	return [v1[0] + v2[0], v1[1] + v2[1]];
}

// Multiplies a vector by a scalar factor
var mul = function(v1, factor) {
	return [v1[0] * factor, v1[1] * factor];
}

// Returns v1 - v2
var diff = function(v1, v2) {
	return add(v1, mul(v2, -1));
}

// Dot product
var dot = function(v1, v2) {
	return v1[0]*v2[0] + v1[1]*v2[1];
}

// Rotates an [x,y] pair about the origin
var rotate = function(coords, angle) {
	var len = vlen(coords), currAngle = vangle(coords);
	
	// Handles the zero case
	if(!len) {return [0,0];}
	
	var newAngle = currAngle + angle;
	return mul([Math.cos(newAngle), Math.sin(newAngle)], len);
}

// Rotates an [x,y] pair about a point
var rotateAbout = function(coords, angle, about) {
	var dx = coords[0] - about[0];
	var dy = coords[1] - about[1];
	var rot = rotate([dx, dy], angle);
	return [rot[0] + about[0], rot[1] + about[1]];
}

// Returns the minimum and maximum value when points is projected along axisVector
var project = function(points, axisVector) {
	// The invalid case
	if(!validVector(axisVector) || !vlen(axisVector)) {return [0,0];}
	
	// Normalized axis vector
	var nAxisVector = [];
	nAxisVector[0] = axisVector[0] / vlen(axisVector);
	nAxisVector[1] = axisVector[1] / vlen(axisVector);
	
	var values = points.map(function(p) {return dot(p, nAxisVector)});
	return [min(values), max(values)];
}

// Returns the minimum and maximum point when projected along axisVector
var projectMinMax = function(points, axisVector) {
	// The invalid case
	if(!validVector(axisVector) || !vlen(axisVector)) {return [0,0];}
	
	// Normalized axis vector
	var nAxisVector = [];
	nAxisVector[0] = axisVector[0] / vlen(axisVector);
	nAxisVector[1] = axisVector[1] / vlen(axisVector);
	
	var values = points.map(function(p) {return dot(p, nAxisVector)});
	var mindex = 0;
	var maxdex = 0;
	for(var i=0; i<points.length; i++) {
		if(values[i] < values[mindex]) {mindex = i;}
		else if(values[i] > values[maxdex]) {maxdex = i;}
	}
	
	return [points[mindex], points[maxdex]];
}

// Returns true if rgn1 overlaps rgn2
// rgn1 and rgn2 are 1D regions specified by a min and max
var overlap = function(rgn1, rgn2) {
	if(rgn1[1] <= rgn2[0] || rgn1[0] >= rgn2[1]) {return 0;}
	
	var rgn1center = sum(rgn1)/2;
	var rgn2center = sum(rgn2)/2;
	if(rgn1center > rgn2center) {return rgn2[1] - rgn1[0];}
	else {return rgn2[0] - rgn1[1];}
}

// Returns the projection vector of the overlap between the convex polys
// defined by points1 and points2
// TODO sanitize input with function that split a concave poly into convexes 
var intersection = function(points1, points2) {
	
	// Adds all perpendicular axes
	axes = [];
	for(var i=0; i<points1.length; i++) {
		var p1 = points1[i], p2 = points1[(i+1) % points1.length];
		var pd = diff(p1, p2);
		axes = axes.concat([rotate(pd, Math.PI/2)]);
	}
	for(var i=0; i<points2.length; i++) {
		var p1 = points2[i], p2 = points2[(i+1) % points2.length];
		var pd = diff(p1, p2);
		axes = axes.concat([rotate(pd, Math.PI/2)]);
	}
	
	// Tests each axis for overlap
	pvectors = [];
	for(var i=0; i<axes.length; i++) {
		var axis = axes[i];
		if(!vlen(axis)) {continue;}
		var over = overlap(project(points1, axis), project(points2, axis));
		if(over) {
			// Adds the vector of correct length
			pvectors = pvectors.concat([mul(axis, over / vlen(axis))]);
		} else {
			// Zero projection found
			return [0,0];
		}
	}
	
	// Returns the minimum projection vector
	if(!pvectors.length) {return [0,0];}
	var minval = Infinity, mindex = 0;
	for(var i=0; i<pvectors.length; i++) {
		var len = vlen(pvectors[i]);
		if(len < minval) {
			minval = len;
			mindex = i;
		}
	}
	return pvectors[mindex]
}

// Limits the length of a vector to maxComp along axis
var vlimit = function(vector, axis, maxLen) {
	var current = vproject(vector, axis);
	var currLen = vlen(current);
	if(currLen == 0) {return vector;}
	var limited = mul(current, Math.min(currLen, maxLen) / currLen);
	return add(diff(vector, current), limited);
}

// Projects vector onto pvector
var vproject = function(vector, pvector) {
	return mul(pvector, dot(vector,pvector) / Math.pow(vlen(pvector),2));
}

// Detects whether v1 and v2 are parallel (to within .005)
var vparallel = function(v1, v2) {
	return (vangle(v1) - vangle(v2) < .005)
}

