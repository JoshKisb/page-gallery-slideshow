var ImgGalSlideshow = {

    clickedEl: null,
    filteredImages: [],
    currentImg: 0,
    selectedImg: 0,
    slideInterval: null,
    allImages: [],
    fullsizeImages: [],  
    loadfull: false,

    init: function(data) {
        this.$origBody = $("body");
        this.$slidespage = $($.parseHTML(data));
        // display slideshow page
        this.$slidespage.appendTo(this.$origBody);

        
        this.cacheDom();
 

        this.$imgDisplay
        .css("background-image", 'url('+chrome.extension.getURL('/loading.gif')+')');

        $('html').css('overflow', 'hidden');
        this.$origBody.bind('touchmove', function(e) {
            e.preventDefault()
        });

        this.bindEvents();
  
        var allImg = this.$origBody.find("img");
        this.allImages = Array(allImg.length).fill(null);
        this.fullsizeImages = Array(allImg.length).fill(null);

        var currFilter = $('#imgvi-filter').val();
        var imgGal = this;   

        allImg.each(function(index) {

            let imgsrc = $(this).attr("src");
            
            let anchor = $(this).closest("a");
            let position = index;
            let url = null;

            if (anchor.length){

                url = anchor.attr('href');
            }    

            fetch(imgsrc).then(function(response){
                return response.blob();
            }).then(function(myBlob) {
        
                let sidebarImg = $('<div />', { 
                    "data-src": imgsrc,
                    "style": 'background-image: url('+ imgsrc +')',
                    "data-mimetype": myBlob.type,
                    "data-baseurl": imgsrc.substring(0, imgsrc.lastIndexOf('/')),
                    "data-width": allImg[position].width,
                    "data-height": allImg[position].height,
                    "data-position": position,
                    "data-fullsize-url": url, 
                });

    

                imgGal.allImages[position] = sidebarImg;
                if (imgGal.fitsFilter(currFilter, sidebarImg)){
                    let len = imgGal.filteredImages.push(sidebarImg);
                    imgGal.$sidebarImageDiv.append(sidebarImg);

                    if (imgGal.clickedEl == allImg[position]) {
                        imgGal.selectedImg = position;
                        imgGal.currentImg = (len - 1);
                        imgGal.displayImage();
                    }
                }
            });

        });
    },

    cacheDom: function() {
        this.$imgDisplay = $('#imagevi-img-box #imgvi-display');
        this.$imgFilter = $('#imgvi-filter');
        this.$sidenav = $("#imgvi-sidebar");
        this.$container = $("#imgvi-container")
        this.$sidebarImageDiv = $(".imgvi-sidebar-images");
    },

    bindEvents: function() {
        var imgGal = this;
        $('#imgvi-menu-btn').on('click', this.toggleNav.bind(this));

        $('#imgvi-next').on('click', this.showNext.bind(imgGal));

        $('#imgvi-prev').on('click', this.showPrev.bind(imgGal));

        $('#imgvi-play').on('click', function() {

            $(this).hide();
            $('#imgvi-pause').show();
            
            imgGal.slideInterval = setInterval(function() {
                if (imgGal.showNext() == false) {
                    imgGal.currentImg = -1;
                    imgGal.showNext();
                }
            }, 3200);
        });

        $('#imgvi-pause').on('click', function() { 

            $(this).hide();
            $('#imgvi-play').show();

            clearInterval(imgGal.slideInterval);
            imgGal.slideInterval = null;

        });

        $('#imgvi-filter').on('change', this.filterImages.bind(this));

        $('#imgvi-load-fullsize').on('change', function() {
            if(this.checked) {
                imgGal.loadFullSize();
            }else {
                imgGal.loadfull = false;
                imgGal.displayImage();
            }

        })

        $('#imgvi-close').on('click', this.exit.bind(this));

        $(document).on('keydown', this.setKeyboardShortcuts.bind(this));
    },

    exit: function() {
        this.$slidespage.fadeOut(1000, function() { 
            $(this).remove(); 
            $('html').css('overflow', 'scroll');
            $('body').unbind('touchmove');
        });

        $(document).off('keydown', this.setKeyboardShortcuts.bind(this));
    },
    
    setKeyboardShortcuts: function(event) {
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
            if (this.slideInterval) 
                $('#imgvi-pause').trigger('click');
            else
                $('#imgvi-play').trigger('click');
        }

        if (event.which == 27) {
            event.preventDefault();
            $('#imgvi-close').trigger('click');
        }
    },

    toggleNav: function() {
        if (this.$sidenav.hasClass("open")) {
            this.$sidenav.css('width', "0");
            this.$container.css('marginRight', "0");
            this.$sidenav.removeClass("open");
        }else {
            this.$sidenav.css('width', "344px");
            this.$container.css('marginRight', "344px");
            this.$sidenav.addClass("open");
        }   
    },

    fitsFilter: function(imgFilter, img) {
        
        var fitsFilter = false;

        if (imgFilter == "all")
            fitsFilter = true;

        else if (imgFilter == "type") 
            fitsFilter = (img.attr('data-mimetype') == this.allImages[this.selectedImg].attr('data-mimetype'));

        else if (imgFilter == "url") 
            fitsFilter = (img.attr('data-baseurl') == this.allImages[this.selectedImg].attr('data-baseurl'));
        
        else if (imgFilter == "disp_size") {
            fitsFilter = (img.attr('data-width') == this.allImages[this.selectedImg].attr('data-width') 
                && img.attr('data-height') == this.allImages[this.selectedImg].attr('data-height'));
        }

        return fitsFilter;  
    },

    filterImages: function(){
        let currImage = this.filteredImages[this.currentImg]; 
        this.currentImg = 0;
        this.filteredImages = [];
        this.$sidebarImageDiv.empty();
        var imgFilter = this.$imgFilter.val();

        $.each(this.allImages, function(index, el){
            if (this.fitsFilter(imgFilter, el)) {
                let len = this.filteredImages.push(el);
                this.$sidebarImageDiv.append(el);

                if (currImage == el)
                    this.currentImg = (len -1);
            }
        }.bind(this));

        this.displayImage();
        
    },

    showNext: function() {
        if (this.filteredImages.length == (this.currentImg + 1) )
            return false;

        this.currentImg++;
        this.displayImage();    
    },

    showPrev: function() {
        if (this.currentImg == 0 )
            return false;

        this.currentImg--;
        this.displayImage();
    },

    displayImage: function() {
        var fullimage = null;
        var currImage = this.filteredImages[this.currentImg];

        if (this.loadfull)
            fullimage = this.fullsizeImages[currImage.attr('data-position')]
        
        if (fullimage) {
            this.$imgDisplay
                .css("background-image", 'url('+fullimage.attr('src')+')');
        } else {
            this.$imgDisplay
                .css("background-image", 'url('+currImage.data('src')+')');
        }
    },

    loadFullSize: function() {
        
        this.loadfull = true;
        var f_images = this.filteredImages.slice(this.currentImg)
            .concat(this.filteredImages.slice(0, this.currentImg));


        for (let img in f_images) {
            let imglink = $(f_images[img]).attr('data-fullsize-url');
            let imgpos = $(f_images[img]).attr('data-position');
            
            if (! imglink ) continue;

            fetch(imglink.replace("http:", ""), {method: 'HEAD'})
                .then(function(response){
                    if (response.ok) {
                        let ctype = response.headers.get("content-type")
                        if (ctype.startsWith('image/')){
                            let fullimage = $('<img />', { 
                                src: imglink,
                            });
                            
                            this.fullsizeImages[imgpos] = fullimage;

                            if (imgpos == this.filteredImages[this.currentImg].attr('data-position')){
                                this.displayImage();
                            } 
                                
                        }

                    }
                }.bind(this))

        }
    }


} 



document.addEventListener("contextmenu", function(event){
    
    ImgGalSlideshow.clickedEl = event.target;

}, true);



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
   if (request.todo == "showGalleryPage") {    

    $.get(chrome.extension.getURL('/slidespage.html'), function(data) {

        ImgGalSlideshow.init(data);

	});

    
    
   }
})

