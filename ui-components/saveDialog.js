// Using ES5 strict mode
'use strict';

// Node/NPM package requires
const fs = require('fs');
const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the save dialog window, where the user can select a location to save a file to

// TODO: Clean this up and get it working

class SaveDialog {
    constructor(editor) {
        this.editor = editor;

        // Create the saveDialog box
        this.saveDialog = blessed.box({
            parent: this.editor.screen,
            top: 'center',
            left: 'center',
            width: '80%',
            // Left-align the text
            align: 'left',
            height: this.editor.screen.height / 2 + 7,
            style: {
                fg: 'black',
                bg: 'light-grey',
            },
            shadow: true,
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

        // TODO: this may need to be a custom thing (ugh)
        // Create the filename select textarea
        let fileNameTextEntry = blessed.textbox({
            // The parent of the titlebar should be the generated saveDialog
            parent: this.saveDialog,
            // Give the filemanager a border to be styled
            border: 'line',
            top: 1,
            left: 3,
            height: 3,
            keys: false,
            width: this.saveDialog.width - 6,
            style: {
                bg: 'lightgrey',
                fg: 'black',
                border: {
                    bg: 'lightgrey',
                    fg: 'black'
                },
                label: {
                    bg: 'lightgrey',
                    fg: 'black'
                }
            },
            label: 'File Name'
        });

        // List of files in the current directory for selection
        let fileList = blessed.filemanager({
            // Give the filemanager a border to be styled
            border: 'line',
            // The parent of the titlebar should be the generated saveDialog
            parent: this.saveDialog,
            // Top of this element will be the 1st line of the dialog box
            top: 5,
            left: 1,
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
            top: Math.round(this.saveDialog.height - 2)
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
            top: Math.round(this.saveDialog.height - 2)
        });

        // Append each UI subcomponent to the saveDialog box
        this.saveDialog.append(titleBar);
        this.saveDialog.append(fileNameTextEntry);
        this.saveDialog.append(fileList);
        this.saveDialog.append(okButton);
        this.saveDialog.append(cancelButton);

        // TODO: if the editor has a filename/directory already, default to that
        this.saveDialog.on('focus', () => {
            // Clear buttons of any potential focus indication
            okButton.setContent('  OK  ');
            cancelButton.setContent('  Cancel  ');
            // Make sure the button reset is rendered
            this.editor.screen.render();
            // Set the status bar to something relevant
            this.editor.statusBar.setContent(`Enter a name to save the file as...\tTAB = Change target\t`);
            // Read the input for the file name text entry (also focuses the element)

            // TODO: this may need to be something custom that we do
            fileNameTextEntry.readInput((err, data) => {
                // fileNameTextEntry.setValue(data);
                // Focus the next element
                // fileList.focus();
                // this.editor.screen.render();
            });
            // Move the cursor back where it belongs (no idea why it can stray off)
            this.editor.program.cursorPos(fileNameTextEntry.atop, fileNameTextEntry.aleft);
            // Make sure the cursor move renders
            this.editor.screen.render();
        });

        fileNameTextEntry.on('cancel', () => {
            this.saveDialog.hide();
            this.editor.textArea.focus();
            this.editor.screen.render();
        });

        fileNameTextEntry.on('submit', (err, data) => {
            fileNameTextEntry.setValue(data);
            // Focus the next element

            // No idea why it's this complicated, but this is how to focus the next element
            this.saveDialog.hide();
            fileList.focus();
            this.saveDialog.show();
            this.editor.screen.render();
        });

        fileNameTextEntry.on('tab', () => {
            fileList.focus();
        });

        fileList.on('focus', () => {

            // Change the color of the other elements to not indicate focus
            
            fileList.pick('./', (err, file) => {
                if (file) {
                    // Just get the directory
                } else {
                    this.saveDialog.hide();
                    this.editor.textArea.focus();
                    this.editor.screen.render();
                }
            });
        });
    }

    // TODO: Add listeners for each of these
}

module.exports = SaveDialog;