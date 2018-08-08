// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the open dialog window, where the user can select a file to open

// This needs to be a class because on construction blessed tries to attach this to a parent screen
class OpenDialog {
    constructor(parent, nextFocusElement, statusBar) {
        this.parent = parent;
        this.nextFocusElement = nextFocusElement;

        this.openDialog = blessed.box({
            parent: this.parent,
            border: 'line',
            top: 'center',
            left: 'center',
            width: '50%',
            // Left-align the text
            align: 'left',
            height: 9,
            style: {
                fg: 'black',
                bg: 'light-grey',
                border: {
                    // This matches the DOS edit theme
                    fg: 'black',
                    bg: 'light-grey'
                },
            },
            valign: 'middle',
            label: 'AAAAAA',
            shadow: true,
            content: 'Test',
        });

        this.openDialog.key(['C-o'], () => {
            this.nextFocusElement.focus();
            this.parent.render();
        });
    }
}

// Export the blessed component
module.exports = OpenDialog;