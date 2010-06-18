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

var emojiSniffer = {
    "init": function() {
        safari.self.addEventListener("message", emojiSniffer.delegate, false);
        
        // FIXME: Somehow the document.body doesn't exist at this moment (for some websites)...
        if (document.body) {
            document.body.addEventListener("DOMNodeInserted", function(e){
                if (e.target.nodeType == 3 && emojiSniffer.storageSize() == 0) {
                    emojiSniffer.sniff(); // Sniff() again when textNode inserted into document.body
                } 
            }, false);
        }
        
        this.sniff();
    },
    "sniff": function() {
        var previousReplacedEmojiImageElements = document.evaluate("//img[@alt='com.github.digdog.emoji']", document.body, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        var badgeCount = previousReplacedEmojiImageElements.snapshotLength;
        
        var textNodes = document.evaluate("//text()[string-length(translate(normalize-space(),' &#9;&#xA;&#xD;','')) > 0]", document.body, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);        
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
                    safari.self.tab.dispatchMessage("convertToImage", keyName);
                    badgeCount++;
                }
            }            
        }        
        safari.self.tab.dispatchMessage("updateBadgeCount", badgeCount);
    },
    "delegate": function(event) {
        switch(event.name) {
        case "renderEmoji":
            var keyName = event.message.charCode;
            var imgSrc = event.message.imgSrc;
            
            emojiSniffer.storage[keyName].forEach(function(item, idx, context) {
                var originalNode = item.node;
                if (originalNode.data) {
                    item.node.data = originalNode.data.substr(0, item.atIndex);
                    
                    var emojiImage = document.createElement("img");
				    emojiImage.setAttribute("src",imgSrc);
				    emojiImage.setAttribute("type", "image/png");
				    emojiImage.setAttribute("alt", "com.github.digdog.emoji");
				    emojiSniffer.insertAfter(emojiImage, item.node);
				    emojiSniffer.insertAfter(document.createTextNode(""), emojiImage);
				    
				    item.node += originalNode.data.substring(item.atIndex);
                }
                context.splice(idx, 1);
            });
            
            if (emojiSniffer.storage[keyName].length == 0) {
                delete emojiSniffer.storage[keyName];
            };
            
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
    "storageSize": function() {
        var count = 0;
        for(var prop in emojiSniffer.storage) {
            count++;
        }
        return count;
    },
    "storage":{}
}

emojiSniffer.init();
