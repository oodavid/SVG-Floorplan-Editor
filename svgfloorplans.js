FP = {};
// Settings
FP.snaplevel = 10;		// Snap-level
FP.mouse = {
	button: false,			// Is the mouse button down?
	fine: { x: 0, y: 0 },	// The EXACT mouse coordinates
	snap: { x: 0, y: 0 },	// The mouse coordinates, with snapping
	drop: { x: 0, y: 0 },	// The EXACT mouse coordinates when we last mousedowned OR mouseupped
	drag: { x: 0, y: 0 },	// The distance from the drop coordinates, with snapping
};
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
	// Position of the source element
	var offset = $('#svg_source').offset();
	// Calculate the relative coordinates
	var x = e.pageX - offset.left;
	var y = e.pageY - offset.top;
	// Store the fine coords
	FP.mouse.fine.x = x;
	FP.mouse.fine.y = y;
	// Snap and store the coords
	FP.mouse.snap.x = Math.round(x / FP.snaplevel) * FP.snaplevel;
	FP.mouse.snap.y = Math.round(y / FP.snaplevel) * FP.snaplevel;
	// Re-calculate the drag distances
	var dragx = x - FP.mouse.drop.x;
	var dragy = y - FP.mouse.drop.y;
	// Snap and store them
	FP.mouse.drag.x = Math.round(dragx / FP.snaplevel) * FP.snaplevel;
	FP.mouse.drag.y = Math.round(dragy / FP.snaplevel) * FP.snaplevel;
	// Update the statusbar
	FP.interface.updateStatus();
	// Do stuff
	console.log('delegate>mouseMove');
};
FP.delegates.mouseDown = function(e){
	// Set the flag
	FP.mouse.button = true;
	// Store the drop coords
	FP.mouse.drop.x = FP.mouse.fine.x;
	FP.mouse.drop.y = FP.mouse.fine.y;
	FP.mouse.drag.x = 0;
	FP.mouse.drag.y = 0;
	// Update the status
	FP.interface.updateStatus();
	// Take a look at the target...
	// Bubble up till we find: path, text, image, use...?
	console.log('mousedown', e.target);
};
FP.delegates.mouseUp = function(e){
	// Set the flag
	FP.mouse.button = false;
	// Store the drop coords
	FP.mouse.drop.x = FP.mouse.fine.x;
	FP.mouse.drop.y = FP.mouse.fine.y;
	FP.mouse.drag.x = 0;
	FP.mouse.drag.y = 0;
	// Update the status
	FP.interface.updateStatus();
	// Now what?
	console.log('mouseup - if it\'s quick, call it a click?');
};

/***************** Interface *****************/

FP.interface = {};
FP.interface.updateStatus = function(){
	$('#snap').html(FP.mouse.snap.x + ',' + FP.mouse.snap.y);
	$('#drag').html(FP.mouse.drag.x + ',' + FP.mouse.drag.y);
	$('#button').html(FP.mouse.button ? '&#x26AB;' : '&#x26AA;');
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
	// Empty the rects
	g.find('rect, g, circle').remove();
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

/***************** Transforms ****************/

FP.transforms = {};
FP.transforms.setDefinition = function(el, definition, def){
	// Rebuild the attribute here
	var newAttr = {};
	// Populate that ^ with the current attribute definitions
	el = $(el);
	var transform = el.attr('transform');
	if(transform){
		var regex = /(translate|scale|rotate)\(([^\)]*)\)/g;
		while(m = regex.exec(transform)){
			newAttr[m[1]] = m[2];
		}
	}
	// Add the new attribute part 
	switch(definition){
		case "translate":
		case "scale":
			newAttr[definition] = def.x + ',' + def.y;
			break;
		case "rotate":
			newAttr[definition] = def.deg;
			break;
	}
	// Rebuild into a string, the order must ALWAYS be: translate(x,y) rotate(deg) scale(x,y)
	var attrStr = '';
	$.each(['translate', 'rotate', 'scale'], function(k, v){
		if(newAttr[v]){
			attrStr += v + '(' + newAttr[v] + ') ';
		}
	});
	attrStr = $.trim(attrStr);
	// Apply the new attribute
	el.attr('transform', attrStr);
};
FP.transforms.getDefinition = function(el, definition){
	el = $(el);
	// Grab the transform attribute
	var transform = el.attr('transform');
	// Which definition?
	switch(definition){
		case "translate":
		case "scale":
			// Defaults for translate AND scale
			var values = (definition == 'translate') ? { x: 0, y: 0 } : { x: 1, y: 1 };
			// Pull out the actual value
			if(transform){
				// Match it
				var regex = new RegExp(definition + "\\((-?\\d*),(-?\\d*)\\)", "i");
				var translate = transform.match(regex);
				if(translate){
					// Update
					values.x = parseFloat(translate[1], 10);
					values.y = parseFloat(translate[2], 10);
				}
			}
			return values;
		case "rotate":
			// Defaults:
			var values = { deg: 0 };
			if(transform){
				// Match it
				var regex = /rotate\((-?\d*)\)/i;
				var rotate = transform.match(regex);
				if(rotate){
					// Update
					values.deg = parseFloat(rotate[1], 10);
				}
			}
			return values;
	}
};

/***************** ?????????? ****************/

console.warn('not sure where this stuff lives yet - selection makes sense?');
FP.move = function(el, dx, dy){
	// Get the transform > translate definition
	var def = FP.transforms.getDefinition(el, 'translate');
	// Update them
	def.x += dx;
	def.y += dy;
	// Set the transform > translate value
	FP.transforms.setDefinition(el, 'translate', def);
};
FP.flip = function(el, dir){
	// Get the transform > scale definition
	var def = FP.transforms.getDefinition(el, 'scale');
	// Update them
	if(dir == "x-axis"){
		def.x *= -1;
	} else {
		def.y *= -1;
	}
	// Set the transform > scale value
	FP.transforms.setDefinition(el, 'scale', def);
};
FP.rotate = function(el, ddeg){
	// Get the transform > rotate definition
	var def = FP.transforms.getDefinition(el, 'rotate');
	// Update them
	def.deg += ddeg;
	// Set the transform > rotate value
	FP.transforms.setDefinition(el, 'rotate', def);
};









FP.tests = {};
FP.tests.selectRandomElement = function(){
	// Test - Make a random selection
	var svg = $('#svg_source').svg('get');
	var all_items = $('#sketch image, #sketch path, #sketch use, #sketch text', svg.root());
	// Add a random one to the selection
	FP.selection.add(all_items[Math.floor(Math.random()*all_items.length)]);
};
FP.tests.selectionMove = function(dx, dy){
	// Loop the selection and move them
	$.each(FP.selection.data, function(k,v){
		FP.move(v, dx, dy);
	});
	// Redraw the selection
	FP.selection.redraw();
};
FP.tests.selectionFlip = function(dir){
	// Loop the selection and move them
	$.each(FP.selection.data, function(k,v){
		FP.flip(v, dir);
	});
	// Redraw the selection
	FP.selection.redraw();
};
FP.tests.selectionRotate = function(deg){
	// Loop the selection and move them
	$.each(FP.selection.data, function(k,v){
		FP.rotate(v, deg);
	});
	// Redraw the selection
	FP.selection.redraw();
};
FP.tests.addItem = function(id){
	// Add the item to the stage...
};
FP.tests.deleteRandomItem = function(){
	// Pick out a random item and delete it
	// Take care of selections
};










/*
FP.getBounds = function(el){
	$el = $(el);
	// Our properties object - x, y, left, right, top, bottom, width, height
	var props = {};
	// Grab the centre-point (x and y)
	switch(el.nodeName){
		case "image":
		case "text":
			// Pretty simple
			props.x = parseFloat($el.attr('x'), 10);
			props.y = parseFloat($el.attr('y'), 10);
			break;
		case "path":
		case "use":
			// Look at the transform > translate definition
			var tmp = FP.getTransform($el, 'translate');
			props.x = tmp.x;
			props.y = tmp.y;
			break;
	}
	// And the bounds
	if(el.nodeName == "path"){
		// 
	}
	// Left, Right, Top, Bottom, Width, Height
	var bounds = v.getBoundingClientRect();
};
*/


















/***************** Utilities *****************/

FP.utils = {};
FP.utils.is_array = function(input){
	// Returns true if the input is an array
	return typeof(input)=='object' && (input.length != undefined);
};
FP.utils.path_to_array = function(path){
	// Splits an SVG path into an array of points
	// FUNCTIONALITY FROM THE OLD MOVE THINGIES - SHOWS HOW TO PARSE THE DATA :-)
	// Path data attribute
	var d = el.attr('d');
	// Data is defined by a letter, followed by non-letters - break it into parts
	var regex = /[a-z][^a-z]*/ig;
	var segments = d.match(regex);
	// Reset the data
	var d = '';
	// To pull out the numerical parts of M and L
	var regex = /(M|L)[\s]*(\-?\d*)[\s\,]*(\-?\d*)/;
	// Loop the segments and adjust them...
	$.each(segments, function(k,v){
		// First letter...
		switch(v[0]){
			case 'M':
			case 'L':
				// Update the coords
				m=regex.exec(v);
				var x = parseFloat(m[2], 10) + dx;
				var y = parseFloat(m[3], 10) + dy;
				// Add it
				d += m[1] + x + "," + y;
				break;
			default:
				// Keep it as-is
				d += v;
		}
	});
	// Apply the new attribute
	el.attr('d', d);
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