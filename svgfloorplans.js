FP = {};
// Settings
FP.snaplevel	= 10;					// Snap-level 20px
FP.currentObject = false;			// The "active" object
FP.mouse		= { x: 0, y: 0 };	// Mouse coords (current)
FP.mousedowned	= { x: 0, y: 0 };	// Mouse coords (when we mousedowned)

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
	// Redraw the selection boxes
	console.log('redraw', FP.selection.data);
};
FP.selection.applyFunction = function(f, redraw){
	// Loop the elements and apply the function to them
	$.each(elements, function(k,v){
		// Apply the function
		f(v);
	});
	// Redraw?
	if(redraw){
		FP.selection.redraw();
	}
};

/***************** Utilities *****************/

FP.utils = {};
FP.utils.is_array = function(input){
	return typeof(input)=='object'&&(input instanceof Array);
}








// When you're ready
FP.init = function(e){
	// Load the BG-grid
	$('#svggrid').svg();
	var svg = $('#svggrid').svg('get');
	svg.load('./grid.svg', { addTo: false, changeSize: false });
	// Load the main SVG
	$('#svgworkspace').svg();
	var svg = $('#svgworkspace').svg('get');
	svg.load('./floorplan.svg', { addTo: false, changeSize: false, onLoad: FP.load });
};
$(document).ready(FP.init);
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
	$('#svgworkspace').on("mousedown", function(e){
		console.log('Carrying? Nevermind. Otherwise do stuff...');


		// Store the current mouse coords (using JSON to clone the values)
		FP.mousedowned = JSON.parse(JSON.stringify(FP.mouse));
		// Start drawing a line...
		var svg = $('#svggrid').svg('get');
		FP.currentObject = svg.line(FP.mouse.x, FP.mouse.y, FP.mouse.x, FP.mouse.y, { stroke: '#000000', strokeWidth: 4 });
	});
	$('#svgworkspace').on("mouseup", function(e){
		console.log('Carrying? Drop it. Otherwise do stuff...');
		// Drop the object
		FP.currentObject = false;
	});
	$('#svgworkspace').on("mousemove", FP.mouseMove);
};
FP.mouseMove = function(e){
	// Set the coords
	FP.mouse.x = e.pageX - $(this).offset().left;
	FP.mouse.y = e.pageY - $(this).offset().top;
	// Apply the snapping
	FP.mouse.x = Math.round(FP.mouse.x / FP.snaplevel) * FP.snaplevel;
	FP.mouse.y = Math.round(FP.mouse.y / FP.snaplevel) * FP.snaplevel;
	// Just log them for now
	var svg = $('#svggrid').svg('get');
	$('text', svg.root()).text(JSON.stringify(FP.mouse));
	// Do we have an object?
	if(FP.currentObject){
		$(FP.currentObject).attr('x2', FP.mouse.x);
		$(FP.currentObject).attr('y2', FP.mouse.y);
	}
};