FP = {};
// Settings
FP.snaplevel	= 10;				// Snap-level 20px
FP.currentObject = false;			// The "active" object
FP.mouse		= { x: 0, y: 0 };	// Mouse coords (current)
FP.mousedowned	= { x: 0, y: 0 };	// Mouse coords (when we mousedowned)


FP.tool = 'pointer'; // The active tool


// When you're ready
FP.init = function(e){
	// Prepare the SVG elements
	$('#svg_bg, #svg_source').svg();
	// Load the BG
	$('#svg_bg').svg('get').load('./bg.svg', { addTo: false, changeSize: false });
	// Load the source
	$('#svg_source').svg('get').load('./floorplan.svg', { addTo: false, changeSize: false, onLoad: FP.load });
};
$(document).ready(FP.init);
FP.load = function(){
	// Start the delegates
	FP.delegates.init();
	// Test - SELECT A FLOOR AND DOOR
	var svg = $('#svg_source').svg('get');
	var items = $('#floors .floor, #items use', svg.root());
	FP.selection.add(items);
};
 
/***************** Delegates *****************/

FP.delegates = {};
FP.delegates.init = function(e){
	// KeyPresses
	$(document).on("keydown", FP.delegates.keyDown);
	// Mouse Movement (anywhere)
	$(document).on("mousemove", FP.delegates.mouseMove);
	// Mouse Down (on the source)
	$('#svg_source').on("mousedown", FP.delegates.mouseDown);
	// Mouse Up (anywhere)
	$(document).on("mouseup", FP.delegates.mouseUp);
};
FP.delegates.keys = {
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down',
	46: 'delete',
	13: 'enter',
	27:	'esc'
};
FP.delegates.keyDown = function(e){
	// Match the keycode...
	var key = FP.delegates.keys[e.keyCode];
	if(key){
		console.log(key);
		return false;
	}
};
FP.delegates.mouseMove = function(e){
	// Do stuff
	console.log('mousemove');
};
FP.delegates.mouseDown = function(e){
	// Take a look at the target...
	console.log(e.target);
	// Bubble up till we find: line, text, image, polygon, use
	console.log('mousedown');
};
FP.delegates.mouseUp = function(e){
	console.log('mouseup');
};

/***************** Selection *****************/

FP.selection = {};
FP.selection.data = []; // A list of elements in the selection
FP.selection.clear = function(){
	// Remove everything
	FP.selection.data = [];
	// Redraw
	FP.selection.redraw();
};
FP.selection.add = function(elements){
	// Delegate
	FP.selection.add_remove_toggle(elements, 'add');
};
FP.selection.remove = function(elements){
	// Delegate
	FP.selection.add_remove_toggle(elements, 'remove');
};
FP.selection.toggle = function(elements){
	// Delegate
	FP.selection.add_remove_toggle(elements, 'toggle');
};
FP.selection.add_remove_toggle = function(elements, mode){
	// Convert single elements into an array
	if(!FP.utils.is_array(elements)){
		elements = [ elements ];
	}
	// Loop the elements
	$.each(elements, function(k,v){
		// Is it in the array?
		var index = $.inArray(v, FP.selection.data);
		// Toggle?
		if(mode == 'toggle'){
			mode = (index == -1) ? 'add' : 'remove';
		}
		// Add or remove?
		if(mode == 'add' && index == -1){
			FP.selection.data.push(v);
		} else if(mode == 'remove' && index != -1){
			FP.selection.data.splice(index, 1);
		}
	});
	// Redraw
	FP.selection.redraw();
};
FP.selection.redraw = function(){
	// Reference the SVG, editor group and SVG bounds
	var svg			= $('#svg_source').svg('get');
	var svgbounds	= $('#svg_source')[0].getBoundingClientRect();
	var g			= $('#editor', svg.root());
	// Empty the selection?
	g.empty();
	// Redraw the selection
	$.each(FP.selection.data, function(k,v){
		var bounds = v.getBoundingClientRect();
		var x = bounds.left	- svgbounds.left	- 4;
		var y = bounds.top	- svgbounds.top		- 4;
		var w = bounds.width + 8;
		var h = bounds.height + 8;
		var r = svg.rect(g, x, y, w, h);
		// Link the selection to the object
		$(r).data('original_object', v);
	});
};
FP.selection.applyFunction = function(f, redraw){
	// Loop the elements and apply the function to them
	$.each(FP.selection.data, function(k,v){
		// Apply the function
		f(v);
	});
	// Redraw?
	if(redraw){
		FP.selection.redraw();
	}
};

/******************* Tools *******************/

FP.tools = {};
FP.tools.select = function(tool){
	// Selects a tool
};
FP.tools.toggle = function(){
	// Toggles a layer
};



/*
 *
 *
 *
 *
 *
 */



/***************** Utilities *****************/

FP.utils = {};
FP.utils.is_array = function(input){
	// Returns true if the input is an array
	return typeof(input)=='object' && (input.length != undefined);
};
FP.utils.path_to_array = function(path){
	// Splits an SVG path into an array of points
};









/*
// Once we've loaded
FP.load = function(svg, error){
	if(error){
		alert('There was an error loading the SVG: ' + error);
		return;
	}
	// Click events for line, text, image and polygon
	$('#sketch', svg.root()).on("mousedown", "line, text, image, polygon", function(e){
		console.log($(this));
	});
	// For some reason &lt;use&gt; tags don't work in the above selector, so we need to handle them separately
	$('#sketch use', svg.root()).on("mousedown", function(e){
		console.log($(this));
	});
	// Other mouse events are on the workspace element (much more reliable)
	$('#svg_source').on("mousedown", function(e){
		console.log('Carrying? Nevermind. Otherwise do stuff...');


		// Store the current mouse coords (using JSON to clone the values)
		FP.mousedowned = JSON.parse(JSON.stringify(FP.mouse));
		// Start drawing a line...
		var svg = $('#svg_bg').svg('get');
		FP.currentObject = svg.line(FP.mouse.x, FP.mouse.y, FP.mouse.x, FP.mouse.y, { stroke: '#000000', strokeWidth: 4 });
	});
	$('#svg_source').on("mouseup", function(e){
		console.log('Carrying? Drop it. Otherwise do stuff...');
		// Drop the object
		FP.currentObject = false;
	});
	$('#svg_source').on("mousemove", FP.mouseMove);
};
FP.mouseMove = function(e){
	// Set the coords
	FP.mouse.x = e.pageX - $(this).offset().left;
	FP.mouse.y = e.pageY - $(this).offset().top;
	// Apply the snapping
	FP.mouse.x = Math.round(FP.mouse.x / FP.snaplevel) * FP.snaplevel;
	FP.mouse.y = Math.round(FP.mouse.y / FP.snaplevel) * FP.snaplevel;
	// Just log them for now
	var svg = $('#svg_bg').svg('get');
	$('text', svg.root()).text(JSON.stringify(FP.mouse));
	// Do we have an object?
	if(FP.currentObject){
		$(FP.currentObject).attr('x2', FP.mouse.x);
		$(FP.currentObject).attr('y2', FP.mouse.y);
	}
};
*/