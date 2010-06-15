/*
 emojiSniffer.js
 1.0

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
if (window !== window.top)
    return;

var emojiSniffer = {
    "init":function(event) {
        safari.self.addEventListener("message", emojiSniffer.delegate, false);
        emojiSniffer.sniff();
    },
    "sniff":function(event) {
        emojiSniffer.storage = [];
    
        var textNodes = document.evaluate("//text()", document.body, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        var itemIndex = textNodes.snapshotLength;
        var textNode;

        while (textNode = textNodes.snapshotItem(--itemIndex)) {
            var nodeData = textNode.data;
            var nodeIndex = nodeData.length;
            var charCode;
            while (charCode = nodeData.charCodeAt(--nodeIndex)) {
                if (charCode > 57344 && charCode < 59000) {
                    // TODO                    
                    emojiSniffer.storage.push({"charCode":charCode, "indexAt":nodeIndex, "node":textNode});
                    safari.self.tab.dispatchMessage("foundEmoji", emojiSniffer.storage.length);
                    safari.self.tab.dispatchMessage("convertToImage", charCode);
                }
            }            
        }
    },
    "delegate":function(event) {
        switch(event.name) {
        case "replacedEmoji":
            var charCode = event.message.charCode;
            var imgSrc = event.message.imgSrc;
            // TODO            
            var result = emojiSniffer.storage.map(function(item) {
                if (item.charCode == charCode) {
                    var nodeBackup = item.node;
                    item.node.data = nodeBackup.data.substr(0, item.indexAt);
                
                    var newimg = document.createElement('img');
				    newimg.setAttribute('src',imgSrc);
				    emojiSniffer.insertAfter(newimg, item.node);
				    emojiSniffer.insertAfter(document.createTextNode(""), newimg);
				    
				    item.node += nodeBackup.data.substring(item.indexAt);
                }
            });   
            break;
        }
    },
    "storage":[],
    "insertAfter": function(newNode, existingNode) {
        if (existingNode.nextSibling) {
            existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
        } else {
            existingNode.parentNode.appendChild(newNode);
        }
    }
}

// We want the script to run the sniffer at the very last moment
window.addEventListener("load", emojiSniffer.init, false);
