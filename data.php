<?php
	/**
	 * Lucion NexGen - Floorplan Data
	 *
	 *		An example file that will be refactored into outputting live data...
	 *
	 * @author		David King
	 * @owner		Lucion Environmental Ltd
	 * @copyright	Copyright (c) 2011 +
	 */

	// Dummy data
	$data = array(
		"floorplans"	=> array(
			array(
				"id"		=> 1,
				"title"		=> "Blue Building > Ground Floor",
				"width"		=> 800,
				"height"	=> 600,
				"images"	=> NULL,
				"floors"	=> '<path class="floor-01" transform="translate(20,30)" d="M0,0 L180,0 L180,140 L120,140 L120,40 L0,40 M200,200 L80,200 L80,320" />',
				"walls"		=> '<!-- Windows -->
								<line class="window" x1="120" y1="70" x2="80" y2="70" />
								<!-- Inner Walls -->
								<line class="inner" x1="140" y1="70" x2="180" y2="70" />
								<!-- Outer Walls -->
								<line class="outer" x1="20" y1="30" x2="200" y2="30" />
								<line class="outer" x1="200" y1="30" x2="200" y2="170" />
								<line class="outer" x1="200" y1="170" x2="180" y2="170" />
								<line class="outer" x1="160" y1="170" x2="140" y2="170" />
								<line class="outer" x1="140" y1="170" x2="140" y2="70" />
								<line class="outer" x1="140" y1="70" x2="120" y2="70" />
								<line class="outer" x1="80" y1="70" x2="20" y2="70" />',
				"items"		=> '<use xlink:href="#door-01" transform="translate(250,250)" />
								<use xlink:href="#door-01" transform="translate(200,240)" />
								<use xlink:href="#door-02" transform="translate(300,220)" />
								<use xlink:href="#door-02" transform="translate(160,170) rotate(90)" />',
				"cameras"	=> '<!-- WHERE DO THESE GO? Cameras are made up of 2 parts, MOVE the group, but ROTATE the arrow like so... -->
								<g transform="translate(240,340)">
									<use xlink:href="#camera" />
									<use xlink:href="#camera-arrow" transform="rotate(45)" />
								</g>'
			)
		),
		"locations"	=> array(
			array(
				"id"				=> 1,
				"building_name"		=> "Blue Building",
				"level"				=> 0,
				"location_name"		=> "001 / Bathroom",
				"floorplan"			=> 1,
				"risk_level"		=> "R2",
				"path"				=> "M0,0 L180,0 L180,140 L120,140 L120,40 L0,40 Z",
				"transform"			=> "translate(320,30)",
				"label_transform"	=> "translate(5,20)",
			)
		)
	);

	// And ouptut
	header('Vary: Accept');
	if (isset($_SERVER['HTTP_ACCEPT']) && (strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
		header('Content-type: application/json');
	} else {
		header('Content-type: text/plain');
	}
	echo json_encode($data);

		/*
		images
			<image transform="translate(20,300)" class="image" width="400px" height="400px" xlink:href="./trace.gif"></image>
		floors - things like external areas
			
		locations (automatic)

		walls
			
		items
			<use xlink:href="#item001" transform="translate(160,160) rotate(90) scale(1,-1)" />
		arrows
			<path transform="translate(500,200)" d="M0,0 l-200,0 l-100,-100" stroke-width="2" stroke-dasharray="4 4" fill="none" style="marker-start:url(#arrowhead001); marker-end:url(#arrowhead001)" />
		labels
			<text transform="translate(540,200)">Some label</text>
		*/