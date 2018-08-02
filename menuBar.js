// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the menuBar box, a single-height box that spans the entire window

// This needs to be a class because on construction blessed tries to attach this to a parent screen
class MenuBar {
    constructor(parent) {
        this.parent = parent;

        // Create the menu strip box
        this.menuBar = blessed.box({
            // The top should be the top of the screen
            top: 'top',
            // Always 100% of the screen width since it's a menu strip
            width: '100%',
            // Single height, since it's just a menu strip
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
            // Formatted for the sake of clarity (red on the alt + key activator for the menu)
            content: `{red-fg}F{/red-fg}ile {red-fg}E{/red-fg}dit {red-fg}V{/red-fg}iew {red-fg}F{/red-fg}ind {red-fg}O{/red-fg}ptions`
        });
    }
}

// Export the blessed component
module.exports = MenuBar;