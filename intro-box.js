'use strict';
const blessed = require('neo-blessed');

// This module represents an introduction window for the editor, consisting
// of multiple elements

// Hierarchy:
// Box centered in the screen with centered intro text with a border + shadow
// Enter/OK button

class IntroBox {
    constructor(parent) {
        this.parent = parent
        // Create the introBox element and return it using the parent
        this.introBox = blessed.box({
            parent: this.parent,
            border: 'line',
            top: 'center',
            left: 'center',
            width: '50%',
            height: 7,
            align: 'center',
            valign: 'middle',
            style: {
                fg: 'black',
                bg: 'light-grey',
            },
            shadow: true,
            content: 'Welcome to JS DOS Edit',
        });

        // Append a button to the box
    }

    remove() {
        // Hide the box using blessed methods
    }
}

module.exports = IntroBox;