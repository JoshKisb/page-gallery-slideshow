var menuId;

function getClickHandler() {
  return function(info, tab) {

  	//chrome.contextMenus.remove(menuId);
  	console.log("received click");
    chrome.tabs.sendMessage(tab.id,{todo: "showGalleryPage"}, function(response) {});
    
  };
};

function createExtContextMenu() {
	return chrome.contextMenus.create({
	  "title" : "View in Image Gallery Slideshow",
	  "type" : "normal",
	  "contexts" : ["image"],
	  "onclick" : getClickHandler()
	});
}


menuId = createExtContextMenu();
console.log(menuId)



