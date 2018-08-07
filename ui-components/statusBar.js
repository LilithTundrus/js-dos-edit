// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the statusBar box, a single-height box that spans the entire window

// This needs to be a class because on construction blessed tries to attach this to a parent screen
class StatusBar {
    constructor(parent) {
        this.parent = parent;

        // Create the menu strip box
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
            // Placeholder content (mayb not even be needed)
            content: `Unsaved Document\t\t\t< Press Ctrl + W to quit >\t\t\t Line 0 | Col 0`
        });
    }
}

// Export the blessed component
module.exports = StatusBar;