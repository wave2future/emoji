/*
 emojiSniffer.js
 emoji.safariextension 1.0

 The MIT License
 
 Copyright (c) 2010 Ching-Lan 'digdog' Huang and digdog software.
 http://digdog.tumblr.com
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */
 
// The script will be loaded for all subresources and subframes, we only allow it to run on the main frame.
if (window != window.top)
    return;

var emojiSniffer = {
    "init": function() {
        safari.self.addEventListener("message", emojiSniffer.delegate, false);
        emojiSniffer.sniff();
    },
    "sniff": function() {
        safari.self.tab.dispatchMessage("resetBadgeCount", null);
        emojiSniffer.storage = {};

        var textNodes = document.evaluate("//text()", document.body, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        var itemIndex = textNodes.snapshotLength;
        var textNode;

        while (textNode = textNodes.snapshotItem(--itemIndex)) {
            var nodeData = textNode.data;
            var nodeIndex = nodeData.length;
            var charCode;
            while (charCode = nodeData.charCodeAt(--nodeIndex)) {
                if (charCode > 57344 && charCode < 59000) {
                    var keyName = charCode.toString(16).toUpperCase();
                    if (!emojiSniffer.storage[keyName]) {
                        emojiSniffer.storage[keyName] = [];
                    }
                    emojiSniffer.storage[keyName].push({"node":textNode, "atIndex":nodeIndex});
                    safari.self.tab.dispatchMessage("increaseBadgeCount", null);
                    // Read global.html for more detail about the event messsage format below.
                    safari.self.tab.dispatchMessage("convertToImage", {"false":keyName});
                }
            }            
        }
    },
    "convert": function() {
        for (var keyName in emojiSniffer.storage) {
            // Read global.html for more detail about the event messsage format below.
            safari.self.tab.dispatchMessage("convertToImage", {"true":keyName});
        }
    },
    "delegate": function(event) {
        switch(event.name) {
        case "renderEmoji":
            var keyName = event.message.charCode;
            var imgSrc = event.message.imgSrc;
            var result = emojiSniffer.storage[keyName].map(function(item) {
                var originalNode = item.node;
                item.node.data = originalNode.data.substr(0, item.atIndex);
                
                var emojiImage = document.createElement("img");
				emojiImage.setAttribute("src",imgSrc);
				emojiImage.setAttribute("type", "image/png");
				emojiSniffer.insertAfter(emojiImage, item.node);
				emojiSniffer.insertAfter(document.createTextNode(""), emojiImage);
				
				item.node += originalNode.data.substring(item.atIndex);
            });   
            break;
        case "sniff":
            emojiSniffer.sniff();
            break;
        }
    },
    "insertAfter": function(newNode, existingNode) {
        if (existingNode.nextSibling) {
            existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
        } else {
            existingNode.parentNode.appendChild(newNode);
        }
    },
    "storage":{}
}

emojiSniffer.init();
