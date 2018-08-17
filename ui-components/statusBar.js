// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the statusBar box, a single-height box that spans the entire window

// This needs to be a class because on construction blessed tries to attach this to a parent screen
class StatusBar {

    /** Creates an instance of StatusBar. This is the main text entry box
     * @param {*} parent Blessed screen parent to attach the element to
     * @param {*} fileName The filename to set the statusBar's filename indicator to
     * @memberof StatusBar
     */
    constructor(parent, fileName) {
        this.parent = parent;
        this.fileName = fileName;

        // Create the statusBar UI element as a blessed box element type
        this.statusBar = blessed.text({
            // Place the bottom of this element at the bottom of the screen, but up by one
            bottom: 'bottom' - 1,
            // Always 100% of the screen width since it's a status bar
            width: '100%',
            // Single height, since it's just a status bar
            height: 1,
            // Allow for color tags (blessed UI mechanic)
            tags: true,
            // Pad the text for the menubar by 1 on each left/right
            padding: {
                left: 1,
                right: 1
            },
            style: {
                fg: 'black',
                bg: 'light-grey',
            },
            // Placeholder content (may not even be needed)
            content: `${this.fileName}t\t\t\t< Press Ctrl + W to quit >\t\t\t Line 0 | Col 0`
        });
    }
}

// Export the blessed component
module.exports = StatusBar;