// Loads scripts in the order they are needed
// This is an ugly hack but javascript sucks so I'm keeping it for now

// addModule("scripts/util.js");
// addModule("scripts/graphics.js")
// addModule("scripts/geom.js");
// addModule("scripts/object.js");
// addModule("scripts/world.js");
// addModule("scripts/character.js");
// addModule("scripts/game.js");

require([
	"scripts/util.js",
	"scripts/graphics.js",
	"scripts/geom.js",
	"scripts/object.js",
	"scripts/world.js",
	"scripts/character.js",
	"scripts/game.js",
]);