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
// OK/cancel buttons

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

        // PlaceHolder
        this.openDialog.setLabel('Open...');

        // Okay button to handle confirmation of the file being opened
        let okButton = blessed.button({
            // The parent of the button should be the generated introBox
            parent: this.openDialog,
            // Using extended characters here
            content: '  OK  ',
            // Allow the button to shrink when needed
            shrink: true,
            // Center the button
            left: Math.round(this.openDialog.width / 2 - 14),
            style: {
                fg: 'black',
                // Cyan
                bg: '#33F0FF',
            },
            // Button should only be a height of 1
            height: 1,
            // Place the button near the bottom of the box
            top: Math.round(this.openDialog.height - 4),
        });

        // Cancel button, should simply close the dialog window
        let cancelButton = blessed.button({
            // The parent of the button should be the generated introBox
            parent: this.openDialog,
            // Using extended characters here
            content: '  Cancel  ',
            // Allow the button to shrink when needed
            shrink: true,
            // Left of this button shouldn't overlap with the ok button
            left: Math.round(this.openDialog.width / 2),

            style: {
                fg: 'black',
                // Cyan
                bg: '#33F0FF',
            },
            // Button should only be a height of 1
            height: 1,
            // Place the button near the bottom of the box
            top: Math.round(this.openDialog.height - 4),
        });

        this.openDialog.append(okButton);
        this.openDialog.append(cancelButton);

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