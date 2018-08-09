// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the textArea textbox, where the actual text being edited will be displayed

// This needs to be a class because on construction blessed tries to attach this to a parent screen

// TODO: At some point, the scrollbar(s) should always show no matter the content length
class TextArea {

    /** Creates an instance of TextArea. This is the main text entry box
     * @param {*} parent Blessed screen parent to attach the element to
     * @param {*} fileLabel The filename to set the textAreas's label to
     * @memberof TextArea
     */
    constructor(parent, fileLabel) {
        this.parent = parent;

        // Create the textArea UI element as a blessed box element type
        this.textArea = blessed.box({
            parent: parent,
            // The top of this element should be the screen width plus 1
            top: 1,
            // Mark the element as keyable to the screen passes down any keypresses to the box
            keyable: true,
            label: fileLabel,
            // Left-align the text
            align: 'left',
            // Keep the width of this element to 100% of the screen
            width: '100%+1',
            // Height should be the entire screen minus 1 because of the statusBar (not doing this hide part of the text entry window)
            height: '100%-1',
            // Don't capture SGR blessed escape codes, that could cause issues
            tags: false,
            // This style matches the DOS edit theme
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
            // Scrollbar styles, using extended characters here
            scrollbar: {
                ch: '█',
                track: {
                    bg: 'black',
                    ch: '░'
                },
            },
            // Limit files to 16,000 lines (ambitious at best)
            baseLimit: 16000,
            // This fixes any issues with the box not scrolling on scroll method calls
            alwaysScroll: true,
        });
    }
}

// Export the blessed component
module.exports = TextArea;