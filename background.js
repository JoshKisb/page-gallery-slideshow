function getClickHandler() {
  return function(info, tab) {

    chrome.tabs.sendMessage(tab.id,{todo: "showGalleryPage"}, function(response) {});
    
  };
};

/**
 * Create a context menu which will only show up for images.
 */
chrome.contextMenus.create({
  "title" : "View in Image Gallery Slideshow",
  "type" : "normal",
  "contexts" : ["image"],
  "onclick" : getClickHandler()
});



