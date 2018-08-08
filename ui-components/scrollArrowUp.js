// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the textArea textbox, where the actual text being edited will be displayed

// This needs to be a class because on construction blessed tries to attach this to a parent screen

// TODO: At some point, the scrollbar(s) should always show no matter the content length
class ScrollArrowUp {

    /** Creates an instance of ScrollArrowUp. This is used to have a up arrow for the scrollbar appear on screen
     * @param {*} parent Blessed screen parent to attach the element to
     * @memberof ScrollArrowUp
     */
    constructor(parent) {
        this.parent = parent;

        // Create the menu strip box
        this.scrollArrowUp = blessed.box({
            parent: parent,
            // The top of this element should be the screen width plus 1
            top: 1,
            left: parent.screen.width - 1,

            width: 1,
            height: 1,
            content: '↑'
        })
    }
}

// Export the blessed component
module.exports = ScrollArrowUp;