<?php
	// Write the HTML to a temporary file
	$datafile	= tempnam("./data", "FOO");
	$handle		= fopen($datafile, "w");
	fwrite($handle, $_POST['html']);
	fclose($handle);
	// Build some parameters for print
	$input		= escapeshellarg($datafile);
	$base		= '--baseurl=' . escapeshellarg($_POST['base']);
	$output1	= escapeshellarg($datafile . '1.pdf');
	$output2	= escapeshellarg($datafile . '2.pdf');
	// Print the document
	passthru("prince {$input} {$base} -o {$output1}");
	// Trim off the first page
	passthru("pdftk {$output1} cat 2-end output {$output2}");
	// Return the ID
	echo json_encode(array('result' => 'evince ' . $output2));