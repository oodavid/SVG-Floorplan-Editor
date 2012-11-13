printce = {};
printce.init = function(e){
	// Create a print link
	var a = $('<a href="#" id="princt_link" />').attr('href', '#').html('looks good, print it').click(printce.print);
	a.css({ position: 'fixed', top: 0, right: 0, background: '#000000', color: '#FFFFFF', padding: '5px' });
	$('body').prepend(a);
	// Do we have a ToC to populate?
	if($('#toc').length){
		printce.generateToC();
	}
};
printce.generateToC = function(){
	// Create the <ul>
	$('#toc').append($('<ul />'));
	// Any heading with an ID
	var els = $('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
	// Loopem
	$.each(els, function(k,v){
		// Dissect the heading
		var html	= $(this).html();
		var id		= $(this).attr('id');
		var depth	= v.nodeName.toLowerCase();
		// Create the <li>
		var li = $('<li />').addClass('toc_' + depth);
		// Add the link
		li.append($('<a />').html(html).attr('href', '#' + id));
		// Add it
		$('#toc ul').append(li);
	});
};
printce.print = function(){
	// Some HTML tidying here...
	// 
	// Clone the document
	var dupe = $('html').clone();
	// Remove the princt link
	dupe.find('#princt_link').remove();
	// Prepend a pagebreak to the body
	var br = $('<div />').css('page-break-after', 'always');
	$('body', dupe).prepend(br);
	// Remove extraneous gubbins from the head
	$('head', dupe).find(':not(style, title)').remove();
	// Pull out the HTML
	var html = dupe.html();
	// Add <!DOCTYPE> and <HTML> tags
	html = '<!DOCTYPE HTML><html lang="en-US">' + html + '</html>';
	// We need the page URL to use as a base
	var base = location.href;
	// Send it to the printers
	$.ajax({
		type:		'POST',
		url:		'/printce/printce.php',
		dataType:	'json',
		data:		{
			base: base,
			html: html
		},
		success:	printce.success,
		error:		printce.error
	});
	// No linkage!
	return false;
};
printce.success = function(data){
	console.log(data.result);
};
printce.error = function(){
	console.log('boo!');
}
// When yer ready
$(document).ready(printce.init);