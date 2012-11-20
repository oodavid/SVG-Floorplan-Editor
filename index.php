<!DOCTYPE HTML>
<html lang="en-US">
<head>
	<meta charset="UTF-8">
	<title>jQuery SVG Floorplan creator</title>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	<script type="text/javascript" src="http://keith-wood.name/js/jquery.svg.js"></script>
	<script type="text/javascript" src="http://keith-wood.name/js/jquery.svgdom.js"></script>
	<script type="text/javascript" src="./editor.js"></script>
	<link rel="stylesheet" href="editor.css" type="text/css"/>
</head>
<body>

	<!-- The Toolbox -->
	<div id="toolbox">
		<!-- Tools -->
		<h4>Tools</h4>
		<button class="pointer selected" title="Select Mode [ESC]">&nbsp;</button>
		<button class="walls" data-class="outer"   title="Outer Wall">&nbsp;</button>
		<button class="walls" data-class="inner"   title="Inner Wall">&nbsp;</button>
		<button class="walls" data-class="window"  title="Window">&nbsp;</button>
		<button class="items-door-01" title="Door (drag to stage)">&nbsp;</button>
		<div class="clear"></div>
		<!-- Locations -->
		<h4>Locations</h4>
		<ul>
			<li class="location" data-id="1">Location 1</li>
			<li class="location" data-id="2">Location 2</li>
			<li class="location" data-id="3">Location 3</li>
			<li class="location" data-id="4">Location 4</li>
			<li class="location" data-id="5">Location 5</li>
		</ul>
		<!-- Layers -->
		<h4>Layers</h4>
		<ul>
			<li class="layer active" data-layer="items">Items &amp; Assets</li>
			<li class="layer active" data-layer="walls">Walls &amp; Windows</li>
			<li class="layer active" data-layer="locations">Locations</li>
			<li class="layer active" data-layer="floors">Floors</li>
			<li class="layer active" data-layer="images">Images</li>
		</ul>
		<!-- Selection Options -->
		<h4>Selection Options</h4>
		<button class="selection-rotate-clockwise"		title="Rotate Clockwise">&nbsp;</button>
		<button class="selection-rotate-anticlockwise"	title="Rotate Anticlockwise">&nbsp;</button>
		<button class="selection-flip-horizontal"		title="Flip Horizontally">&nbsp;</button>
		<button class="selection-flip-vertical"			title="Flip Vertically">&nbsp;</button>
		<button class="save"							title="Save Floorplans">&nbsp;</button>
		<button class="toggle-grid active"				title="Toggle Grid">&nbsp;</button>
		<button class="selection-delete"				title="Delete Selection [DEL]">&nbsp;</button>
		<a class="button help" title="Help &amp; Info" href="/todo.html" target="_blank">&nbsp;</a>
		<div class="clear"></div>
	</div>
	<!-- Stage -->
	<div id="stage">
		<div id="inner">
			<div id="svg_bg"></div>
			<div id="svg_source"></div>
		</div>
	</div>
	<!-- Status -->
	<div id="status">
		<span id="version"	title="version">SVGFPE v0.2</span>
		<span id="fine"		title="mouse coords (fine)">?,?</span>
		<span id="snap"		title="mouse coords (with snapping)">?,?</span>
		<span id="button"	title="button status">&#x26AA;</span>
		<span id="drag"		title="mouse drag distance (with snapping)">?,?</span>
	</div>

</body>
</html>