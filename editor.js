FP = {
	svg:		false,
	tool:		'pointer',
	tooldata:	{},
};
FP.init = function(e){
	// Prepare and load the template
	$('#svg_source').svg().svg('get').load('./template.svg', { addTo: false, changeSize: false, onLoad: FP.load });
};
$(document).ready(FP.init);
FP.load = function(svg){
	// Store a reference to the SVG element
	FP.svg = svg;
	// Start the mouse and statusbar
	FP.mouse.init();
	FP.statusbar.init();
};

/******************* Mouse *******************/

FP.mouse = {
	down:		false,		// Is the mouse button down?
	dragging:	false,		// Are we dragging (ie, the drag coords have changed and the button is pressed)
	target:		false,		// The element that we mousedowned on (passed to click and drag events)
	layer:		false,		// The context of that element (bg, sketch or ui)
	snapping:	10,			// The grid that the mouse snaps to
	x: 0, y: 0,				// The EXACT mouse coordinates
	snap: { x: 0, y: 0 },	// The mouse coordinates, with snapping
	drop: { x: 0, y: 0 },	// The EXACT coordinates when we last mousedowned OR mouseupped (to calculate drag distances)
	drag: { x: 0, y: 0 },	// The distance from the drop coordinates, with snapping
};
FP.mouse.init = function(e){
	// Mouse Down (on the source)
	$(document).on("mousedown",	FP.mouse.down);	
	$(document).on("mouseup",	FP.mouse.up);
	$(document).on("mousemove",	FP.mouse.move);
};
FP.mouse.down = function(e){
	// Left-Button only
	if(e.which != 1) { return; }
	// What's the click target? NB: The SVG DOM can return an SVGElementInstance "shadow trees" - we can find the actual <use> element with correspondingUseElement, hence the logical ||
	var target = $(e.target.correspondingUseElement || e.target);
	// Store the target
	FP.mouse.setTarget(target);
	// NEVER HAVE EVENTS HERE - we don't know if this mouseDown represents a click or a start of a drag etc. See FP.mouse.up instead.
};
FP.mouse.up = function(e){
	// Left-Button only
	if(e.which != 1) { return; }
	// Are we clicking or dragging?
	if(FP.mouse.dragging){
		FP.mouse.delegate(e, 'dragStop');
	} else {
		FP.mouse.delegate(e, 'click');
	}
	// Set the target to none - do this at the END so we can still access the mouse properties
	FP.mouse.setTarget(false);
};
FP.mouse.setTarget = function(target){
	// An extra flag to say that we're not (yet) dragging
	FP.mouse.dragging = false;
	// Store the drop coords
	FP.mouse.drop.x = FP.mouse.snap.x;
	FP.mouse.drop.y = FP.mouse.snap.y;
	FP.mouse.drag.x = 0;
	FP.mouse.drag.y = 0;
	// Do we have a target?
	if(target){
		// Store the mouse-state and target
		FP.mouse.down	= true;
		FP.mouse.target	= target;
		// Figure out the layer - either: a direct children of #sketch, "toolbox" or the BG (default)
		FP.mouse.layer	= target.closest('#sketch > *, #toolbox').attr('id') || 'bg';
	} else {
		// Reset everything
		FP.mouse.down	= false;
		FP.mouse.target	= false;
		FP.mouse.layer	= false;
	}
};
FP.mouse.move = function(e){
	// Store the old mouse positions (so we can check for changes)
	var oldDragX = FP.mouse.drag.x;
	var oldDragY = FP.mouse.drag.y;
	// Recalculate the mouse coordinates
	var offset = $('#svg_source').offset();
	// Calculate the EXACT mouse coordinates (relative to the SVG)
	FP.mouse.x = Math.round(e.pageX - offset.left);
	FP.mouse.y = Math.round(e.pageY - offset.top);
	// Snap and store the coords
	FP.mouse.snap.x = Math.round(FP.mouse.x / FP.mouse.snapping) * FP.mouse.snapping;
	FP.mouse.snap.y = Math.round(FP.mouse.y / FP.mouse.snapping) * FP.mouse.snapping;
	// Re-calculate the drag distances
	var dragx = FP.mouse.x - FP.mouse.drop.x;
	var dragy = FP.mouse.y - FP.mouse.drop.y;
	// Snap and store them
	FP.mouse.drag.x = Math.round(dragx / FP.mouse.snapping) * FP.mouse.snapping;
	FP.mouse.drag.y = Math.round(dragy / FP.mouse.snapping) * FP.mouse.snapping;
	// We only need to do stuff when the mouse.drag changes
	if(FP.mouse.drag.x == oldDragX && FP.mouse.drag.y == oldDragY){
		return;
	}
	// DragStart? - button down + not already dragging
	if(FP.mouse.down && !FP.mouse.dragging){
		// Save the flag
		FP.mouse.dragging = true;
		// Event here
		FP.mouse.delegate(e, 'dragStart');
	}
	// Are we dragging or just moving?
	if(FP.mouse.dragging){
		FP.mouse.delegate(e, 'drag');
	} else {
		FP.mouse.delegate(e, 'mouseMove');
	}
};
FP.mouse.delegate = function(e, eventName){
	/**
	 * I am purposefully writing this function in a sloppy manner so that I can get the damn thing working
	 *  with a view to tidying it up later...
	 */
	// console.log('delegate > ' + eventName, FP.mouse.target, FP.mouse.layer);

	//
	// SELECT POINTER
	//
		// ACTIVATE
		if(FP.mouse.layer == 'toolbox' && eventName == 'click' && FP.mouse.target.hasClass('pointer')){
			FP.tool = 'pointer';
			FP.tooldata = {};
			return;
		}
	//
	// WALLS
	//
		// ACTIVATE
		if(FP.mouse.layer == 'toolbox' && eventName == 'click' && FP.mouse.target.hasClass('walls')){
			FP.tool = 'walls';
			FP.tooldata = {
				'klass':	FP.mouse.target.attr('data-class'),
				'line':		false
			};
			return;
		}
		// START / MOVE
		if(FP.tool == 'walls' && FP.mouse.layer != 'toolbox' && $.inArray(eventName, ['drag', 'drag']) != -1){
			// Do we need to create the line?
			if(!FP.tooldata.line){
				// Reference the walls layer
				var g = FP.svg.getElementById('walls');
				// Create the line
				FP.tooldata.line = FP.svg.line(g, FP.mouse.drop.x, FP.mouse.drop.y, FP.mouse.snap.x, FP.mouse.snap.y, { 'class': FP.tooldata.klass });
			} else {
				// Update the line
				FP.svg.change(FP.tooldata.line, { x2: FP.mouse.snap.x, y2: FP.mouse.snap.y });
			}
			return;
		}
		// STOP
		if(FP.tool == 'walls' && FP.mouse.layer != 'toolbox' && eventName == 'dragStop'){
			// Clear the reference
			FP.tooldata.line = false;
			return;
		}
	//
	// ITEMS - DOORS, STAIRS etc.
	//
		// START
		if(FP.tool == 'pointer' && FP.mouse.layer == 'toolbox' && eventName == 'dragStart' && FP.mouse.target.hasClass('items-door-01')){
			FP.tool = 'add-item';
			FP.tooldata = { 'id': 'door-01' };
			return;
		}
		// STOP
		if(FP.tool == 'add-item' && eventName == 'dragStop'){
			// To the stage only
			if($(e.target).closest('svg').length){
				// Reference the items layer
				var g = FP.svg.getElementById('items');
				// Add the element, set the coords
				var el = FP.svg.use(g, '#' + FP.tooldata.id);
				FP.transform.set($(el), 'translate', { x: FP.mouse.snap.x, y: FP.mouse.snap.y });
				// Select it
				FP.dry.tweakSelection(e, $(el));
			}
			FP.tool		= 'pointer';
			FP.tooldata	= {};
			return;
		}
	//
	// TITLES - EDIT
	//
		// Clicking the title? Edit it!
		if(FP.tool == 'pointer' && FP.mouse.layer == 'title' && eventName == 'click'){
			// Read the title, prompt the user for a new one then set it
			var tmp = FP.mouse.target.text();
			var title = prompt('Enter a New title...', tmp);
			FP.mouse.target.text(title);
			return;
		}
	//
	// SELECTION MODIFICATION
	//
		// Clicking the toolbox?
		if(FP.tool == 'pointer' && FP.mouse.layer == 'toolbox' && eventName == 'click'){
			// Clicking of layers...
			if(FP.mouse.target.hasClass('layer')){
				// Toggle the layer
				var layer = FP.mouse.target.attr('data-layer');
				if(FP.mouse.target.hasClass('active')){
					$(FP.svg.getElementById(layer)).hide();
					FP.mouse.target.removeClass('active');
				} else {
					$(FP.svg.getElementById(layer)).show();
					FP.mouse.target.addClass('active');
				}
				return;
			}
			// Clicking of buttons...
			if(FP.mouse.target[0].nodeName.toLowerCase() == 'button'){
				switch(FP.mouse.target.attr('class')){
					case 'selection-rotate-clockwise':
					case 'selection-rotate-anticlockwise':
						// Direction?
						var deg = FP.mouse.target.attr('class') == 'selection-rotate-clockwise' ? 45 : -45;
						// Rotate all selected items - ignore lines...
						$('#svg_source .selected:not(line)').each(function(k, v){
							// Each "flip" operation inverts rotation, we need to adjust for that...
							var scale	= FP.transform.get($(this), 'scale');
							var newdeg	= FP.transform.get($(this), 'rotate');
							newdeg += (scale.x + scale.y) == 0 ? -deg : deg;
							FP.transform.set($(this), 'rotate', newdeg);
						});
						break;
					case 'selection-flip-horizontal':
					case 'selection-flip-vertical':
						// Which axis?
						var axis = FP.mouse.target.attr('class') == 'selection-flip-horizontal' ? 'x' : 'y';
						// Flip all selected items - ignore lines...
						$('#svg_source .selected:not(line)').each(function(k, v){
							var scale = FP.transform.get($(this), 'scale');
							scale[axis] *= -1;
							FP.transform.set($(this), 'scale', scale);
						});
						break;
					case 'selection-delete':
						// Confirm...
						if(confirm('Are you sure you want to delete the selected items?')){
							// Flip all selected items - ignore lines...
							$('#svg_source .selected').remove();
						}
						break;
					case 'toggle-grid':
					case 'toggle-grid active':
					case 'active toggle-grid':
						// Toggle the background grid
						if(FP.mouse.target.hasClass('active')){
							FP.mouse.target.removeClass('active');
							$(FP.svg.getElementById('bg')).hide();
						} else {
							FP.mouse.target.addClass('active');
							$(FP.svg.getElementById('bg')).show();
						}
						break;
				}
			}
			return;
		}
	//
	// SELECTION - DESELECT
	//
		// Clicking the BG?
		if(FP.tool == 'pointer' && FP.mouse.layer == 'bg' && eventName == 'click'){
			// If we're not holding CTRL, then deselect
			if(!e.ctrlKey){
				FP.dry.clearSelection();
			}
			return;
		}
	//
	// SELECTION - ADD, REMOVE, DRAG
	//
		// For the remaining events we only want "active" layers
		if(FP.tool == 'pointer' && $.inArray(FP.mouse.layer, ['floors', 'locations', 'walls', 'items']) != -1){
			// Switch the event
			switch(eventName){
				case 'click':
					// Toggle Selection
					FP.dry.tweakSelection(e, FP.mouse.target);
					break;
				case 'dragStart':
					// If the target ISN'T already selected...
					if(!FP.mouse.target.hasClass('selected')){
						// Toggle Selection
						FP.dry.tweakSelection(e, FP.mouse.target);
					}
					// Store all the translate values as data...
					$('#svg_source .selected').each(function(k, v){
						var translate = FP.transform.get($(this), 'translate');
						$(this).data('translate', translate);
					});
					break;
				case 'drag':
					// Set the translate values based on the original coords + the mouse drag distance
					$('#svg_source .selected').each(function(k, v){
						var original = $(this).data('translate');
						var newx = original.x + FP.mouse.drag.x;
						var newy = original.y + FP.mouse.drag.y;
						FP.transform.set($(this), 'translate', { x: newx, y: newy });
					});
					break;
				case 'dragStop':
				case 'mouseMove':
				default:
					// Debug
					console.log('delegate > ' + eventName, FP.mouse.target, FP.mouse.layer);
					break;
			}
		}
};

/***************** DRY *****************/

// I'm just dumping my "dont repeat yourself" functions here until I figure out how to best arrange them...
FP.dry = {};
FP.dry.clearSelection = function(){
	// Simples
	$('#svg_source .selected').removeClass('selected');
};
FP.dry.tweakSelection = function(e, el){
	// Not holding the CTRL key? Clear the selection
	if(!e.ctrlKey){
		FP.dry.clearSelection();
	}	
	// TOGGLE the element (if we just cleared, this always equates to addClass() )
	el.toggleClass('selected');
};

/***************** Transform *****************/

// A helper to manage SVG transform attributes (they can have multiple definitions in one and the order is important)

FP.transform = {};
FP.transform.set = function(el, property, value){
	// Rebuild the attribute here
	var newAttr = {};
	// Populate that ^ with the current attribute definitions
	var transform = el.attr('transform');
	if(transform){
		var regex = /(translate|scale|rotate)\(([^\)]*)\)/g;
		while(m = regex.exec(transform)){
			newAttr[m[1]] = m[2];
		}
	}
	// Add the new attribute part 
	switch(property){
		case "translate":
		case "scale":
			newAttr[property] = value.x + ',' + value.y;
			break;
		case "rotate":
			newAttr[property] = value;
			break;
	}
	// Rebuild into a string, the order must ALWAYS be: translate(x,y) scale(x,y) rotate(deg)
	var attrStr = '';
	$.each(['translate', 'scale', 'rotate'], function(k, v){
		if(newAttr[v]){
			attrStr += v + '(' + newAttr[v] + ') ';
		}
	});
	attrStr = $.trim(attrStr);
	// Apply the new attribute
	el.attr('transform', attrStr);
};
FP.transform.get = function(el, property){
	// Grab the transform attribute
	var transform = el.attr('transform');
	// Which property?
	switch(property){
		case "translate":
		case "scale":
			// Defaults for translate AND scale
			var values = (property == 'translate') ? { x: 0, y: 0 } : { x: 1, y: 1 };
			// Pull out the actual value
			if(transform){
				// Match it
				var regex = new RegExp(property + "\\((-?\\d*),(-?\\d*)\\)", "i");
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
			var value = 0;
			if(transform){
				// Match it
				var regex = /rotate\((-?\d*)\)/i;
				var rotate = transform.match(regex);
				if(rotate){
					// Update
					value = parseFloat(rotate[1], 10);
				}
			}
			return value;
	}
};

/***************** Statusbar *****************/

FP.statusbar = {};
FP.statusbar.init = function(){
	// A whole load of events trigger an update of the statusbar
	$(document).on("mousedown mousemove mouseup keydown keyup keypress", FP.statusbar.update);
};
FP.statusbar.update = function(){
	// Mostly just mouse bits
	$('#status #fine').html(FP.mouse.x + ',' + FP.mouse.y);
	$('#status #snap').html(FP.mouse.snap.x + ',' + FP.mouse.snap.y);
	$('#status #drag').html(FP.mouse.drag.x + ',' + FP.mouse.drag.y);
	$('#status #button').html(FP.mouse.down ? '&#x26AB;' : '&#x26AA;');
};