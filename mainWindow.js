// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the main box, this should mostly be void of style/borders and just act as the primary container

// This needs to be a class because on construction blessed tries to attach this to a parent screen
class MainWindow {
    constructor(parent) {
        this.parent = parent;

        this.mainWindow = blessed.box({
            parent: this.parent,
            top: 'center',
            left: 'center',
            width: '100%',
            height: '100%',
            style: {
                fg: 'white',
                bg: 'black',
            }
        });
    }
}

// Export the blessed component
module.exports = MainWindow;