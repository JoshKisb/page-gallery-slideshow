var clickedEl = null;
var filteredImages = [];
var currentImg = 0;
var slideInterval;

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

    function showNext() {
        if (filteredImages.length == (currentImg + 1) )
            return false;

        currentImg++;
        $('#imagevi-img-box #imgvi-display')
            .css("background-image", 'url('+filteredImages[currentImg].src+')');

    }

    function showPrev() {
        if (currentImg == 0 )
            return false;

        currentImg--;
        $('#imagevi-img-box #imgvi-display')
            .css("background-image", 'url('+filteredImages[currentImg].src+')');

    }

    $('a.menu-btn').on('click', function(){
        if (sidenav.hasClass("open")) {
            closeNav();
        }else {
            openNav();
        }
    });

    $('#imgvi-next').on('click', function() {
        showNext();
    });

    $('#imgvi-prev').on('click', function() {
        showPrev();
    });

    $('#imgvi-play').on('click', function() {

        $(this).hide();
        $('#imgvi-pause').show();
        

        slideInterval = setInterval(function() {
            if (showNext() == false) {
                currentImg = -1;
                showNext();
            }
        }, 5000);
    });

    $('#imgvi-pause').on('click', function() { 

        $(this).hide();
        $('#imgvi-play').show();

        clearInterval(slideInterval);

    });
}



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
   if (request.todo == "showGalleryPage") {

    // add slides page to body
    $.get(chrome.extension.getURL('/slidespage.html'), function(data) {
		
        var $origBody = $("body");
        $origBody.css('overflow', 'hidden');

        var $slidespage = $($.parseHTML(data));
	    $slidespage.appendTo($origBody);

        loadSlidepageJS();
        
	    $slidespage.find('#imagevi-img-box #imgvi-display')
            .css("background-image", 'url('+clickedEl.src+')');

        //get similar img divs
        var allImgages = $origBody.find("img");
        var $sidebarImageDiv = $slidespage.find(".imgvi-sidebar-images");

        filteredImages = allImgages;

        filteredImages.each(function(index) {
            var sidebarImg = $('<img />', { 
                src: $(this).attr("src"), 
                alt: $(this).attr("alt")
            });
            $sidebarImageDiv.append(sidebarImg);

            if (clickedEl == filteredImages[index]) currentImg = index;
        });

        //get larger/full size images
	});

    
    
   }
})

