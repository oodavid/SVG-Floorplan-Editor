== SVG Floorplan Editor ==

SVGFPE is the editor that allows users of NexGen's to create dynamic floorplans that link directly into the Site data for:

	* Static Reports (current style)
	* Interactive Site-Level reports

Peter Collingridge has some spot-on javascript interactions, I need to rip these off!

	http://www.petercollingridge.co.uk/svg-tutorial/

I can highlight the current element with something like this:

	document.getElementsByTagName('path')[0].getBoundingClientRect();

	OR

	$('path')[0].getBoundingClientRect();

This appears to have a lot of the basics covered

	http://www.chittram.com/editor.jsp

Worth remembering:

	MUST

		Locations (made up of complex paths)
		Walls (made up of single lines - that's how they are used to doing it)

	SHOULD

		Doors, Stairs etc

	COULD

		?

Mouse Logic (brainfart)

	Clicking background
		Deselect
		Drag-Select
		Select
		Add Point
			Updates sketch item
	Clicking sketch (items etc)
		Select (Adds points)
		Drag / Move
	Clicking Editor (points etc)
		Move Point
			Updates sketch item