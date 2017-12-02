var clickedEl = null;
var filteredImages = [];
var currentImg = 0;
var selectedImg = 0;
var slideInterval;
var allImages = [];


document.addEventListener("contextmenu", function(event){
    
    clickedEl = event.target;

}, true);


function AppendfitsFilter(imgFilter, img) {
    var $sidebarImageDiv = $(".imgvi-sidebar-images");
    var fitsFilter = false;


    if (imgFilter == "all")
        fitsFilter = true;
    else if (imgFilter == "type") {
        fitsFilter = (img.attr('data-mimetype') == allImages[selectedImg].attr('data-mimetype'));
    }

    if (fitsFilter) {
        filteredImages.push(img);
        $sidebarImageDiv.append(img);
    }

    
}

function loadSlidepageJS() {

    $("#imagevi-img-box img")
    .css("background-image", 'url('+chrome.extension.getURL('/loading.gif')+')');

    var sidenav = $("#imgvi-sidebar");
    var container = $("#imgvi-container")
    var $sidebarImageDiv = $(".imgvi-sidebar-images");


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
        console.log(filteredImages[currentImg])
        $('#imagevi-img-box #imgvi-display')
            .css("background-image", 'url('+filteredImages[currentImg][0].src+')');

    }

    function showPrev() {
        if (currentImg == 0 )
            return false;

        currentImg--;
        $('#imagevi-img-box #imgvi-display')
            .css("background-image", 'url('+filteredImages[currentImg][0].src+')');

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

    $('#imgvi-filter').on('change', function(){

        filteredImages = [];
        $sidebarImageDiv.empty();
        var imgFilter = $(this).val();

        $.each(allImages, function(index, el){
            AppendfitsFilter(imgFilter, el)
        });
        
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

  
        var allImg = $origBody.find("img");
        allImages = Array(allImg.length).fill(null);
        var currFilter = $('#imgvi-filter').val();

        allImg.each(function(index) {

            var imgsrc = $(this).attr("src");
            var imgAlt = $(this).attr("alt");

            if (clickedEl == allImg[index]) 
                selectedImg = index;

            fetch(imgsrc).then(function(response){
                return response.blob();
            }).then(function(myBlob) {
        
                var sidebarImg = $('<img />', { 
                    src: imgsrc, 
                    alt: imgAlt,
                    "data-mimetype": myBlob.type,
                });

                allImages[index] = sidebarImg;
                AppendfitsFilter(currFilter, sidebarImg);
            });

        });

        

        //get larger/full size images
	});

    
    
   }
})

