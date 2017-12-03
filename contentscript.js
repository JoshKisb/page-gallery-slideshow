var clickedEl = null;
var filteredImages = [];
var currentImg = 0;
var selectedImg = 0;
var slideInterval = null;
var allImages = [];
var $slidespage;


document.addEventListener("contextmenu", function(event){
    
    clickedEl = event.target;

}, true);


function fitsFilter(imgFilter, img) {
    
    var fitsFilter = false;

    if (imgFilter == "all")
        fitsFilter = true;

    else if (imgFilter == "type") 
        fitsFilter = (img.attr('data-mimetype') == allImages[selectedImg].attr('data-mimetype'));

    else if (imgFilter == "url") 
        fitsFilter = (img.attr('data-baseurl') == allImages[selectedImg].attr('data-baseurl'));
    
    else if (imgFilter == "disp_size") {
        fitsFilter = (img.attr('data-width') == allImages[selectedImg].attr('data-width') 
            && img.attr('data-height') == allImages[selectedImg].attr('data-height'));
    }

    return fitsFilter;  
}

function setKeyboardShortcuts(event) {
    console.log("Key ", event.which, " pressed")
    if (event.which == 39) {
        event.preventDefault();
        $('#imgvi-next').trigger('click');
    }

    if (event.which == 37) {
        event.preventDefault();
        $('#imgvi-prev').trigger('click');
    }

    if (event.which == 32) {
        event.preventDefault();
        if (slideInterval) 
            $('#imgvi-pause').trigger('click');
        else
            $('#imgvi-play').trigger('click');
    }

    if (event.which == 27) {
        event.preventDefault();
        $('#imgvi-close').trigger('click');
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
        }, 4000);
    });

    $('#imgvi-pause').on('click', function() { 

        $(this).hide();
        $('#imgvi-play').show();

        clearInterval(slideInterval);
        slideInterval = null;

    });

    $('#imgvi-filter').on('change', function(){

        filteredImages = [];
        $sidebarImageDiv.empty();
        var imgFilter = $(this).val();

        $.each(allImages, function(index, el){
            if (fitsFilter(imgFilter, el)) {
                filteredImages.push(el);
                $sidebarImageDiv.append(el);
            }
        });
        
    });

    $('#imgvi-close').on('click', function(){
        $slidespage.fadeOut(1500, function() { 
            $(this).remove(); 

            $('html').css('overflow', 'scroll');
            $('body').unbind('touchmove');
            $(document).off('keydown', setKeyboardShortcuts);

            chrome.runtime.sendMessage(
                {todo: 'reEnableContextMenu'}, 
                function(response){}
            );

        });
    });

    $(document).on('keydown', setKeyboardShortcuts);
}



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
   if (request.todo == "showGalleryPage") {

    

    // add slides page to body
    $.get(chrome.extension.getURL('/slidespage.html'), function(data) {
		
        var $origBody = $("body");
        $('html').css('overflow', 'hidden');
        $origBody.bind('touchmove', function(e) {
            e.preventDefault()
        });

        
        $slidespage = $($.parseHTML(data));
	    $slidespage.appendTo($origBody);

        loadSlidepageJS();
        
	    $slidespage.find('#imagevi-img-box #imgvi-display')
            .css("background-image", 'url('+clickedEl.src+')');

  
        var allImg = $origBody.find("img");
        allImages = Array(allImg.length).fill(null);
        var currFilter = $('#imgvi-filter').val();
        var $sidebarImageDiv = $(".imgvi-sidebar-images");

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
                    "data-baseurl": imgsrc.substring(0, imgsrc.lastIndexOf('/')),
                    "data-width": allImg[index].width,
                    "data-height": allImg[index].height,
                });

                allImages[index] = sidebarImg;
                if (fitsFilter(currFilter, sidebarImg)){
                    filteredImages.push(sidebarImg);
                    $sidebarImageDiv.append(sidebarImg);
                }
            });

        });

        

        //get larger/full size images
	});

    
    
   }
})

