// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the textArea textbox, where the actual text being edited will be displayed

// This needs to be a class because on construction blessed tries to attach this to a parent screen
class TextArea {
    constructor(parent, fileLabel) {
        this.parent = parent;

        // Create the menu strip box
        this.textArea = blessed.box({
            // The top of this element should be the screen width plus 1
            top: 1,
            keyable: true,
            // keys: true,
            label: fileLabel,
            // Left-align the text
            align: 'left',
            // Keep the width of this element to 100% of the screen
            width: '100%',
            // Height should be the entire screen minus 1 because of the statusBar (not doing this hide part of the text entry window)
            height: '100%-1',
            // Don't capture SGR blessed escape codes, that could cause issues
            tags: false,
            style: {
                fg: 'bold',
                bg: 'blue',
                border: {
                    fg: 'light-grey',
                },
                label: {
                    fg: 'black',
                    bg: 'light-grey'
                }
            },
            border: {
                type: 'line'
            },
            scrollable: true,
            // Scrollbar styles, likely a placeholder for the future
            scrollbar: {
                ch: '█',
                track: {
                    bg: 'black',
                    ch: '░'
                },
            },
            // Limit files to 16,000 lines (ambitious at best)
            baseLimit: 16000,
            alwaysScroll: true,
        });
    }
}

// Export the blessed component
module.exports = TextArea;