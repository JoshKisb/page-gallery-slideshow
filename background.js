function getClickHandler() {
  return function(info, tab) {

  	chrome.contextMenus.removeAll(function(){});
    chrome.tabs.sendMessage(tab.id,{todo: "showGalleryPage"}, function(response) {});
    
  };
};

function createExtContextMenu() {
	chrome.contextMenus.create({
	  "title" : "View in Image Gallery Slideshow",
	  "type" : "normal",
	  "contexts" : ["image"],
	  "onclick" : getClickHandler()
	});
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {

	if (msg.todo == 'reEnableContextMenu') 
		createExtContextMenu();	   

});

createExtContextMenu();



