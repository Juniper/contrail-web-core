/* Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. */

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      // Open an index page in the new tab
      chrome.runtime.sendMessage({"message": "open_new_tab", "url": "index.html"});
    }
  }
);