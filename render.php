<?php
	/**
	 * Lucion NexGen - Floorplan Rendering
	 *
	 *		Renders floorplan data into the template SVG ready for use in reports.
	 *
	 *		This file mirrors the logic of render.js
	 *
	 * @author		David King
	 * @owner		Lucion Environmental Ltd
	 * @copyright	Copyright (c) 2011 +
	 */

	// Load the template
	$tmpl	= file_get_contents("http://svgfloorplans.com.local/template.svg");

	// Load the data
	$string	= file_get_contents("http://svgfloorplans.com.local/data.php");
	$data	= json_decode($string, TRUE);
	// Reference the first floorplan (for now)
	$floorplan = $data['floorplans'][0];

	// Set the size of the SVG
	$regex			= '/(<svg[^>]*)width="\d*" height="\d*"([^>]*>)/i';
	$replacement	= "\$1 width=\"{$floorplan['width']}\" height=\"{$floorplan['height']}\" \$2";
	$tmpl = preg_replace($regex, $replacement, $tmpl, 1);
		// And the canvas
		$regex			= '/(<rect id="canvas"[^>]*)width="\d*" height="\d*"([^>]*>)/i';
		$replacement	= "\$1 width=\"{$floorplan['width']}\" height=\"{$floorplan['height']}\" \$2";
		$tmpl = preg_replace($regex, $replacement, $tmpl, 1);

	// Set the title
	$regex			= array('/(<text id="title" .*>).*<\/text>/i');
	$replacement	= array('$1' . htmlentities($floorplan['title']) . '</text>');
	$tmpl = preg_replace($regex, $replacement, $tmpl, 1);

	// Images
	$regex			= array('/<g id="images"><\/g>/i');
	$replacement	= array("<g id=\"images\">{$floorplan['images']}</g>");
	$tmpl = preg_replace($regex, $replacement, $tmpl, 1);

	// Floors
	$regex			= array('/<g id="floors"><\/g>/i');
	$replacement	= array("<g id=\"floors\">{$floorplan['floors']}</g>");
	$tmpl = preg_replace($regex, $replacement, $tmpl, 1);

	// Walls
	$regex			= array('/<g id="walls"><\/g>/i');
	$replacement	= array("<g id=\"walls\">{$floorplan['walls']}</g>");
	$tmpl = preg_replace($regex, $replacement, $tmpl, 1);

	// Items
	$regex			= array('/<g id="items"><\/g>/i');
	$replacement	= array("<g id=\"items\">{$floorplan['items']}</g>");
	$tmpl = preg_replace($regex, $replacement, $tmpl, 1);

	// And finally, the locations...
	$locations = '';
	foreach($data['locations'] AS $location){
		// Does it belong on this floorplan?
		if($location['floorplan'] == $floorplan['id']){
			$label = htmlentities("{$location['building_name']} - {$location['level']} - {$location['location_name']}");
			$locations .= "<g class=\"{$location['risk_level']}\" transform=\"{$location['transform']}\">
				<path d=\"{$location['path']}\" />
				<text transform=\"{$location['label_transform']}\">{$label}</text>
			</g>";
		}
	}
	$regex			= array('/<g id="locations"><\/g>/i');
	$replacement	= array("<g id=\"locations\">{$locations}</g>");
	$tmpl = preg_replace($regex, $replacement, $tmpl, 1);

	// Now output
	echo $tmpl;