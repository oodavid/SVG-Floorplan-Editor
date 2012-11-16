FP = {};
// Settings
FP.tool = 'pointer';	// The active tool
// When you're ready
FP.init = function(e){
	// Prepare the SVG elements
	$('#svg_bg, #svg_source').svg();
	// Load the BG
	// $('#svg_bg').svg('get').load('./bg.svg', { addTo: false, changeSize: false });
	// Load the source
	$('#svg_source').svg('get').load('./template.svg', { addTo: false, changeSize: false, onLoad: FP.load });
};
$(document).ready(FP.init);
FP.load = function(){
	// Start the mouse
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
		FP.mouse.delegate(e, 'dragEnd');
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
		// Figure out the layer - all direct children of #sketch are layers
		FP.mouse.layer	= target.closest('#sketch > *').attr('id');
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
	// The Cursor follows the mouse at all times
	$('#cursor').attr('transform', 'translate(' + FP.mouse.x + ',' + FP.mouse.y + ')');
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
	// Clicking the title? Edit it!
	if (FP.mouse.layer == 'title' && eventName == 'click'){
		// Read the title, prompt the user for a new one then set it
		var tmp = FP.mouse.target.text();
		var title = prompt('Enter a New title...', tmp);
		FP.mouse.target.text(title);
		return;
	}
	// For now we are only looking at "active" layers
	if($.inArray(FP.mouse.layer, ['floors', 'locations', 'walls', 'items']) == -1){
		// Debug
		console.log('delegate > ' + eventName, FP.mouse.target, FP.mouse.layer);
		return;
	}
	// Switch the event
	switch(eventName){
		case 'click':
			// Toggle Selection
			FP.dry.tweakSelection(e);
			break;
		case 'dragStart':
			// If the target ISN'T already selected...
			if(!FP.mouse.target.hasClass('selected')){
				// Toggle Selection
				FP.dry.tweakSelection(e);
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
		case 'dragEnd':
		case 'mouseMove':
		default:
			// Debug
			console.log('delegate > ' + eventName, FP.mouse.target, FP.mouse.layer);
			break;
	}
};

/***************** DRY *****************/

// I'm just dumping my "dont repeat yourself" functions here until I figure out how to best arrange them...
FP.dry = {};
FP.dry.clearSelection = function(){
	// Simples
	$('#svg_source .selected').removeClass('selected');
};
FP.dry.tweakSelection = function(e){
	// Not holding the CTRL key? Clear the selection
	if(!e.ctrlKey){
		FP.dry.clearSelection();
	}	
	// TOGGLE the target (if we just cleared, this always equates to addClass() )
	FP.mouse.target.toggleClass('selected');
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
			newAttr[property] = value.deg;
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