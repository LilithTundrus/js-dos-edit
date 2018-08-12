// Using ES5 strict mode
'use strict';

// Node/NPM package requires
const fs = require('fs');
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
        this.statusBar = statusBar;

        // Create the openDialog box
        this.openDialog = blessed.box({
            parent: this.parent,
            border: 'none',
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
                    bg: 'cyan',
                    fg: 'grey'
                }
            },
            valign: 'middle',
            shadow: true,
        });

        // Make the titlebar box (custom, better than labels because COLOR)
        let titleBar = blessed.box({
            // The parent of the titlebar should be the generated openDialog
            parent: this.openDialog,
            // Top of the titlebar should be 0 (-1 because autoPadding I, I think)
            top: -1,
            // The width of the titlebar should match the width of the dialog box
            width: this.openDialog.width,
            // Titlebar should only be 1 character tall
            height: 1,
            // Remove the padding from the left offset
            left: -1,
            // Sanity check
            padding: 0,
            // Center align the text
            align: 'center',
            // Cyan title bar with black text
            style: {
                fg: 'black',
                bg: 'cyan',
            },
            // Set the content of the titlebar
            content: 'Open....'
        });

        // List of files in the current directory for selection
        let fileList = blessed.filemanager({
            // Give the filemanager a border to be styled
            border: 'line',
            // The parent of the titlebar should be the generated openDialog
            parent: this.openDialog,
            // Top of this element will be the 1st line of the dialog box
            top: 1,
            // Use the full width but leave some padding
            width: this.openDialog.width - 2,
            // Static height 
            height: 9,
            // Use the default keys for the belssed filemanager
            keys: true,
            // Use scrollbars for the list
            scrollbar: {
                ch: '█',
                track: {
                    fg: 'lightgrey',
                    bg: 'black',
                    ch: '░'
                },
            },
            style: {
                border: {
                    fg: 'black',
                    bg: 'lightgrey'
                },
                selected: {
                    fg: 'black',
                    bg: 'cyan'
                },
                item: {
                    fg: 'black',
                    bg: 'lightgrey'
                }
            }
        });

        // Get the current directory 
        // TODO: in the future have this REMEMBER where the user was last
        fileList.refresh('./', () => {
            // callback would go here
        });

        // Okay button to handle confirmation of the file being opened
        let okButton = blessed.button({
            // The parent of the button should be the generated openDialog
            parent: this.openDialog,
            // Using extended characters here
            content: '  OK  ',
            // Allow the button to shrink when needed
            shrink: true,
            // Center the button
            left: Math.round(this.openDialog.width / 2 - 14),
            style: {
                fg: 'black',
                bg: 'cyan',
            },
            // Button should only be a height of 1
            height: 1,
            // Place the button near the bottom of the box
            top: Math.round(this.openDialog.height - 4),
        });

        // Cancel button, should simply close the dialog window
        let cancelButton = blessed.button({
            // The parent of the button should be the generated openDialog
            parent: this.openDialog,
            // Using extended characters here
            content: '  Cancel  ',
            // Allow the button to shrink when needed
            shrink: true,
            // Left of this button shouldn't overlap with the ok button
            left: Math.round(this.openDialog.width / 2),

            style: {
                fg: 'black',
                bg: 'cyan',
            },
            // Button should only be a height of 1
            height: 1,
            // Place the button near the bottom of the box
            top: Math.round(this.openDialog.height - 4),
        });

        // Append each UI subcomponent to the openDialog box
        this.openDialog.append(titleBar);
        this.openDialog.append(okButton);
        this.openDialog.append(cancelButton);

        // Handle anything that needs to happen on focus of the okButton
        okButton.on('focus', () => {
            okButton.setContent('► OK ◄');
            cancelButton.setContent('  Cancel  ');
            parent.render();
        });

        // Handle anything that needs to happen on focus of the cancelButton
        cancelButton.on('focus', () => {
            cancelButton.setContent('► Cancel ◄');
            okButton.setContent('  OK  ');
            parent.render();
        });

        // TODO: this is kind of janky and could lead to problems later
        // Handle anything that needs to happen on focus of the openDialog
        this.openDialog.on('focus', () => {
            // Clear buttons of any potential focus indication
            cancelButton.setContent('  Cancel  ');
            okButton.setContent('  OK  ');
            parent.render();
            // Focus the first element that makes the most sense (the file select probably)
            fileList.focus();
        });

        // Handle anything that needs to happen on focus of the fileList
        fileList.on('focus', () => {
            // Clear buttons of any potential focus indication
            cancelButton.setContent('  Cancel  ');
            okButton.setContent('  OK  ');
            parent.render();

            fileList.pick('./', (err, file) => {
                let contents = fs.readFileSync(file, 'UTF-8');
                nextFocusElement.setContent(contents, false, true);
                parent.render();
            })
        });

        this.openDialog.key(['C-o'], () => {
            this.nextFocusElement.focus();
            this.parent.render();
        });

        this.openDialog.key(['escape'], () => {
            this.nextFocusElement.focus();
            this.openDialog.toggle();
            this.parent.render();
        });

        fileList.key(['escape'], () => {
            this.nextFocusElement.focus();
            this.openDialog.toggle();
            this.parent.render();
        });

        fileList.key(['C-o'], () => {
            this.nextFocusElement.focus();
            this.parent.render();
        });

        // On the tab key, focus should be toggled between the elements of the dialog box
        this.openDialog.key(['tab'], () => {
            okButton.focus();
        });

        fileList.key(['tab'], () => {
            okButton.focus();
        });

        // On the tab key, focus should be toggled between the elements of the dialog box
        okButton.key(['tab'], () => {
            cancelButton.focus();
        });

        // okButton.key(['enter'], () => {

        // });

        cancelButton.key(['tab'], () => {
            fileList.focus();
        });
    }
}

// Export the blessed component
module.exports = OpenDialog;