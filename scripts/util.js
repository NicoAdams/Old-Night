// General setup and utility functions

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

