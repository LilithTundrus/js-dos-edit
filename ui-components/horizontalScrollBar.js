// Using ES5 strict mode
'use strict';

// Node/NPM package requires
const fs = require('fs');
const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the horizontal scrollbar for the edtior, this will update when the current line goes beyond
// the standard 80-ish column length


class HorizontalScrollBar {

    /** Creates an instance of HorizontalScrollBar. This is the main text entry box
     * @param {*} parent Blessed parent parent to attach the element to
     * @memberof HorizontalScrollBar
     */
    constructor(parent) {
        this.parent = parent;

        this.horizontalScrollBar = blessed.box({
            parent: this.parent,

            // Component relative position options

            // Place the scrollbar at the BOTTOM of the screen + 1 to be above the status bar
            bottom: 'bottom' - 4,

            // Component size options
            // Scrollbar should occupy 100% of the screen horizontally
            width: '100%',
            height: 1,

            style: {
                fg: 'black',
                bg: 'light-grey',
            },
            content: 'aaaaaaaaaaa'
        })
    }

}

// Export the blessed component
module.exports = HorizontalScrollBar;