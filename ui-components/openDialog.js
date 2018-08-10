// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the open dialog window, where the user can select a file to open

// This needs to be a class because on construction blessed tries to attach this to a parent screen
class OpenDialog {

    /** Creates an instance of OpenDialog. This is the dialog box that allows files to be opened
     * @param {*} parent Blessed screen parent to attach the element to
     * @memberof OpenDialog
     */
    constructor(parent, nextFocusElement, statusBar) {
        this.parent = parent;
        this.nextFocusElement = nextFocusElement;

        // Create the openDialog box
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
                    bg: 'light-grey',
                },
                label: {
                    fg: 'black',
                    bg: 'light-grey'
                }
            },
            valign: 'middle',
            shadow: true,
            content: 'Test',
        });

        this.openDialog.setLabel('Open...');

        this.openDialog.key(['C-o'], () => {
            this.nextFocusElement.focus();
            this.parent.render();
        });

        this.openDialog.key(['escape'], () => {
            this.nextFocusElement.focus();
            this.openDialog.toggle();
            this.parent.render();
        });
    }
}

// Export the blessed component
module.exports = OpenDialog;