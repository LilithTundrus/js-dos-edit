// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// This represents a 1x1 box that contains the scrollbar's up arrow

// This needs to be a class because on construction blessed tries to attach this to a parent screen

class ScrollArrowUp {

    /** Creates an instance of ScrollArrowUp. This is used to have a up arrow for the scrollbar appear on screen
     * @param {*} parent Blessed screen parent to attach the element to
     * @memberof ScrollArrowUp
     */
    constructor(parent) {
        this.parent = parent;

        // Create the scrollArrowUp UI element as a blessed box element type
        this.scrollArrowUp = blessed.box({
            parent: parent,
            // The top of this element should be the screen height plus 1
            top: 1,
            // The 'box' should show at the right of the screen -1
            left: parent.screen.width - 1,

            // Width and height of 1 since this is just a scrollbar's arrow
            width: 1,
            height: 1,
            // Unicode up arrow
            content: '↑'
        })
    }
}

// Export the blessed component
module.exports = ScrollArrowUp;