# Emoji Safari Extension

Back to last [February 2009][1], I created a WebKit plugin to convert [emoji][5] characters to iPhone emoji icons. And I started my porting to Safari Extension, now it's available on [digdog.github.com/emoji][2]. 

[![Emoji Safari Extension](http://media.tumblr.com/tumblr_l42tvdwyn81qa95u5.png "Get it Now!") ][2]

### How it works?

The extension comes with two major parts:

1. emojiSniffer.js
2. global.html

emojiSniffer.js is the [injecting script][3]. It was designed to *init()* at the very last moment of the page loading, and *sniff()* the DOM tree by:

1. Using **document.evaluate()** to query **document.body** with XPath expression "**//text()**" and additional [XQuery functions][6], so I can suck out all the textNode inside the body.
2. And scan each textNode using **String.charCodeAt()** to find out emoji characters.
3. Once found the emoji character, push hex-converted emoji *charCode*, *textNode*, and *the index of emoji in textNode* into a JSON object.
4. Send an async message **safari.self.tab.dispatchMessage()** with *charCode* to global.html, ask for the image data.

global.html is the data source, it contains a giant image data url JSON table, encoded in base64 format. When global.html received the message event from emojiSniffer.js:

1. It simply maps the JSON table with event.message as key
2. And send data url back to emojiSniffer.js asynchronously through **event.target.page.dispatchMessage()** method.

At the same time, emojiSniffer.js keeps scanning the DOM tree to the end (then *emojiSniffer.sniff()* will stop), and is also waiting for global.html to callback in *emojiSniffer.delegate()*:

1. *emojiSniffer.delegate()* looks up the event name, if it's "renderEmoji", we start replacing the emoji characters.
2. Go through whole JSON object entries we pushed during *emojiSniffer.sniff()* earlier.
3. And create an **img** element node, set data url into **src** attribute.
4. Insert the img element into the text node.

And the DOM tree will update the content with emoji icons!

### How to Install?

After downloaded the extension from [http://digdog.github.com/emoji][2]:

![](http://media.tumblr.com/tumblr_l42tngO1351qa95u5.png)

Double click the "**emoji.safariextz**" file on your Mac.

![](http://media.tumblr.com/tumblr_l45bnz4NG61qa95u5.png)

And click "**Install**" button. Done, you are good to go.

### License and Download

Download the binary from [http://digdog.github.com/emoji][2].

Get the source code from [github][4]. It's released under **MIT License**.

[1]: http://digdog.tumblr.com/post/252714629/emoji-plugin-for-safari-webkit-browser
[2]: http://digdog.github.com/emoji
[3]: http://developer.apple.com/safari/library/documentation/Tools/Conceptual/SafariExtensionGuide/InjectingScripts/InjectingScripts.html#//apple_ref/doc/uid/TP40009977-CH6-SW1
[4]: http://github.com/digdog/emoji
[5]: http://en.wikipedia.org/wiki/Emoji
[6]: http://github.com/digdog/emoji/commit/987386e6db442bc40d859569b7e32d0504abd3e6