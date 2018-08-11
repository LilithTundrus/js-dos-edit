// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the open dialog window, where the user can select a file to open

// Hierarchy is:
// Dialog box
// Filename text entry box
// Directory select/traversal
// File select
// OK/cancel button

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
            width: '70%',
            // Left-align the text
            align: 'left',
            height: this.parent.height / 2 + 5,
            style: {
                fg: 'black',
                bg: 'light-grey',
                border: {
                    // This matches the DOS edit theme
                    fg: 'black',
                    bg: 'light-grey',
                },
                label: {
                    bg: 'black',
                    fg: 'light-grey'
                }
            },
            valign: 'middle',
            shadow: true,
        });

        this.openDialog.setLabel('Open...');

        let okButton = blessed.button({
            // The parent of the button should be the generated introBox
            parent: this.openDialog,
            // Using extended characters here
            content: '  OK  ',
            // Allow the button to shrink when needed
            shrink: true,
            // Center the button
            left: 'left+5',
            style: {
                fg: 'black',
                // Cyan
                bg: '#33F0FF',
            },
            // Button should only be a height of 1
            height: 1,
            // Place the Buttons near the bottom of the box
            top: Math.round(this.openDialog.height - 4),
        })

        // On focus the OK butto/current element should change color

        this.openDialog.key(['C-o'], () => {
            this.nextFocusElement.focus();
            this.parent.render();
        });

        this.openDialog.key(['escape'], () => {
            this.nextFocusElement.focus();
            this.openDialog.toggle();
            this.parent.render();
        });

        // On the tab key, focus should be toggled between the elements of the dialog box
        this.openDialog.key(['tab'], () => {

        });

    }
}

// Export the blessed component
module.exports = OpenDialog;