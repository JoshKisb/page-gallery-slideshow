var clickedEl = null;

document.addEventListener("contextmenu", function(event){
    
    clickedEl = event.target;

}, true);

function loadSlidepageJS() {

    $("#imagevi-img-box img").attr('src', chrome.extension.getURL('/loading.gif'));

    var sidenav = $("#imgvi-sidebar");
    var container = $("#imgvi-container")

    function openNav() {
        sidenav.css('width', "344px");
        container.css('marginRight', "344px");
        sidenav.addClass( "open" );
    }

    function closeNav() {
        sidenav.css('width', "0");
        container.css('marginRight', "0");
        sidenav.removeClass("open");
    }

    $('a.menu-btn').on('click', function(){
        if (sidenav.hasClass("open")) {
            closeNav();
        }else {
            openNav();
        }
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
   if (request.todo == "showGalleryPage") {

    // add slides page to body
    $.get(chrome.extension.getURL('/slidespage.html'), function(data) {
		
        var $slidespage = $($.parseHTML(data));
	    $slidespage.appendTo('body');

        loadSlidepageJS();
        
	    $slidespage.find('#imagevi-img-box img').attr("src", clickedEl.src);
	});

    //get similar img divs
    //load slidespage with thumbs
    //get larger/full size images
    
   }
})

