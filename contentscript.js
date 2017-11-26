var clickedEl = null;

document.addEventListener("contextmenu", function(event){
    
    clickedEl = event.target;

}, true);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
   if (request.todo == "showGalleryPage") {

    // add slides page to body
    $.get(chrome.extension.getURL('/slidespage.html'), function(data) {
		
        var csslink = chrome.extension.getURL("styles.css");
	    var $slidespage = $($.parseHTML(data));
	    
	    $slidespage.prepend($.parseHTML('<link rel="stylesheet" href="'+ csslink +'" type="text/css" />'))
	    	.appendTo('body');

	    $slidespage.find('#imagevi-img-box img').attr("src", clickedEl.src);
	});

    //get similar img divs
    //load slidespage with thumbs
    //get larger/full size images
    
   }
})

