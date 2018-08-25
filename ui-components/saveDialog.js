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

        // // Create the saveDialog box
        // this.saveDialog = blessed.box({
        //     parent: this.parent,
        //     // border: 'none',
        //     top: 'center',
        //     left: 'center',
        //     width: '70%',
        //     // Left-align the text
        //     align: 'left',
        //     height: this.parent.height / 2 + 5,
        //     style: {
        //         fg: 'black',
        //         bg: 'light-grey',
        //     },
        //     valign: 'middle',
        //     shadow: true
        // });

        this.savePrompt = blessed.prompt({
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
    }
}

module.exports = SaveDialog;