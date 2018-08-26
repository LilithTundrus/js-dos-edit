// Using ES5 strict mode
'use strict';

// Node/NPM package requires
const fs = require('fs');
const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the save dialog window, where the user can select a location to save a file to

class SaveDialog {
    constructor(editor) {
        this.editor = editor;


        // Create the saveDialog box
        this.saveDialog = blessed.box({
            parent: this.editor.screen,
            top: 'center',
            left: 'center',
            width: '70%',
            // Left-align the text
            align: 'left',
            height: this.editor.screen.height / 2 + 5,
            style: {
                fg: 'black',
                bg: 'light-grey',
            },
            valign: 'middle',
            shadow: true
        });

        // Make the titlebar box (custom, better than labels because COLOR)
        let titleBar = blessed.box({
            // The parent of the titlebar should be the generated saveDialog
            parent: this.saveDialog,
            // Top of the titlebar should be 0 (-1 because autoPadding I, I think)
            top: -1,
            // The width of the titlebar should match the width of the dialog box
            width: this.saveDialog.width,
            // Titlebar should only be 1 character tall
            height: 1,
            // Remove the padding from the left offset
            left: 0,
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
            content: 'Save As...'
        });

        // List of files in the current directory for selection
        let fileList = blessed.filemanager({
            // Give the filemanager a border to be styled
            border: 'line',
            label: 'Select A Directory...',
            // The parent of the titlebar should be the generated saveDialog
            parent: this.saveDialog,
            // Top of this element will be the 1st line of the dialog box
            top: 1,
            // Use the full width but leave some padding
            width: this.saveDialog.width - 2,
            // Static height 
            height: '70%',
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
                // Style of the currently selected list item
                selected: {
                    fg: 'black',
                    bg: 'cyan'
                },
                // Style of any other listItem
                item: {
                    fg: 'black',
                    bg: 'lightgrey'
                }
            }
        });

        // Get the current directory 
        // TODO: in the future have this REMEMBER where the user was last
        fileList.refresh('./', () => {
            // Callback would go here
        });

        // Cancel button, should simply close the dialog window
        let okButton = blessed.button({
            // The parent of the button should be the generated saveDialog
            parent: this.saveDialog,
            // Using extended characters here
            content: '  OK  ',
            // Allow the button to shrink when needed
            shrink: true,
            // Center the cancel button
            left: 'center+5',
            style: {
                fg: 'black',
                bg: 'cyan',
            },
            // Button should only be a height of 1
            height: 1,
            // Place the button near the bottom of the box
            top: Math.round(this.saveDialog.height - 4)
        });

        // Cancel button, should simply close the dialog window
        let cancelButton = blessed.button({
            // The parent of the button should be the generated saveDialog
            parent: this.saveDialog,
            // Using extended characters here
            content: '  Cancel  ',
            // Allow the button to shrink when needed
            shrink: true,
            // Center the cancel button
            left: 'center',
            style: {
                fg: 'black',
                bg: 'cyan',
            },
            // Button should only be a height of 1
            height: 1,
            // Place the button near the bottom of the box
            top: Math.round(this.saveDialog.height - 4)
        });

        // Append each UI subcomponent to the saveDialog box
        this.saveDialog.append(titleBar);
        this.saveDialog.append(okButton);
        this.saveDialog.append(cancelButton);

        this.saveDialog.on('focus', () => {
            // Clear buttons of any potential focus indication
            okButton.setContent('  OK  ');
            cancelButton.setContent('  Cancel  ');
            this.editor.screen.render();
            // Focus the first element that makes the most sense (the file select)
            fileList.focus();
            this.editor.statusBar.setContent(`ENTER = Select A Directory\tTAB = Change target\t`);
        });
    }
}

module.exports = SaveDialog;