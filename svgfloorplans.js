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
	// Bubble up till we find: path, text, image, use...?
	console.log('mousedown');
};
FP.delegates.mouseUp = function(e){
	console.log('mouseup - if it\'s quick, call it a click?');
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



/*
 * Moving stuff...
 *
 * We need to deal with each of the different objects individually:
 *
 *		image, text
 *			x, y
 *		path
 *			each of the d > M and L value-pairs
 *		use
 *			
 */
console.warn('not sure where this stuff lives yet - selection makes sense?');
FP.move = function(el, dx, dy){
	el = $(el);
	switch(el[0].nodeName){
		case "image":
		case "text":
			// Just the x and y attributes
			var x = parseFloat(el.attr('x'), 10) + dx;
			var y = parseFloat(el.attr('y'), 10) + dx;
			el.attr('x', x);
			el.attr('y', y);
			break;
		case "path":
		case "use":
			// Transform attribute
			var transform = el.attr('transform');
			if(transform){
				// Pull out the translate(x,y) part
				var regex = /translate\((\-?\d*),(\-?\d*)\)/i;
				var translate = transform.match(regex);
				if(translate){
					// Update the coords
					var x = parseFloat(translate[1], 10) + dx;
					var y = parseFloat(translate[2], 10) + dy;
					translate = "translate(" + x + "," + y + ")";
					// Tweak the attribute
					transform = transform.replace(regex, translate);
				} else {
					// Add the translate part
					transform += " translate(" + dx + "," + dy + ")";
				}
			} else {
				// Set the attribute
				transform = "translate(" + dx + "," + dy + ")";
			}
			// Apply the attribute
			el.attr('transform', transform);
			break;
	}
};
FP.flip = function(el, dir){
	el = $(el);
	switch(el[0].nodeName){
		case "use":
			// Transform attribute
			var transform = el.attr('transform');
			if(transform){
				// Pull out the scale(x,y) part
				var regex = /scale\((\-?\d*),(\-?\d*)\)/i;
				var scale = transform.match(regex);
				if(scale){
					// Update the coords
					var x = parseFloat(scale[1], 10);
					var y = parseFloat(scale[2], 10);
					if(dir == "x-axis"){
						x *= -1;
					} else {
						y *= -1;
					}
					scale = "scale(" + x + "," + y + ")";
					// Tweak the attribute
					transform = transform.replace(regex, scale);
				} else {
					// Add the scale part
					if(dir == "x-axis"){
						transform += " scale(-1, 1)";
					} else {
						transform += " scale(1, -1)";
					}
				}
			} else {
				// Set the attribute
				if(dir == "x-axis"){
					transform = "scale(-1, 1)";
				} else {
					transform = "scale(1, -1)";
				}
			}
			// Apply the attribute
			el.attr('transform', transform);
			break;
	}
};
FP.rotate = function(el, ddeg){
	el = $(el);
	switch(el[0].nodeName){
		case "use":
			// Transform attribute
			var transform = el.attr('transform');
			if(transform){
				// Pull out the rotate(deg) part
				var regex = /rotate\((\-?\d*)\)/i;
				var rotate = transform.match(regex);
				if(rotate){
					// Update the coords
					var deg = parseFloat(rotate[1], 10);
					deg += ddeg;
					rotate = "rotate(" + deg + ")";
					// Tweak the attribute
					transform = transform.replace(regex, rotate);
				} else {
					// Add the rotate part
					transform += "rotate(" + ddeg + ")";
				}
			} else {
				// Set the attribute
				transform = "rotate(" + ddeg + ")";
			}
			// Apply the attribute
			el.attr('transform', transform);
			break;
	}
};

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



FP.runtest = function(){
	// Test - Select a LOAD of things (everything?)
	var svg = $('#svg_source').svg('get');
	var items = $('#images image, #floors path, #items use, #walls path, #arrows path, #labels text, #asbestos use', svg.root());
	FP.selection.add(items);
	// Loop the selection and move them
	// console.log('Does FP.selection.applyFunction have any use? Maybe modify if to take parameters to pass on...');
	$.each(FP.selection.data, function(k,v){
		// Move in a random direction
		var x = 20 * (Math.round((Math.random() * 2) - 1));
		var y = 20 * (Math.round((Math.random() * 2) - 1));
		// FP.move(v, x, y);
		// FP.flip(v, 'x-axis');
		// FP.flip(v, 'y-axis');
		FP.rotate(v, 45);
	});
	// Redraw the selection
	FP.selection.redraw();
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