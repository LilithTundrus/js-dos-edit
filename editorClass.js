// Using ES5 strict mode
'use strict';

// Node/NPM package requires
const fs = require('fs');
const blessed = require('neo-blessed');

// This is the main editor class that puts all of the pieces together

class Editor {
    constructor(program, screen, currentFilePath) {
        // Initialize everything that's needed to get the editor working
        this.program = program;
        this.screen = screen;
        this.currentFilePath = currentFilePath;


    }

    start(fileName, filePath, windowTitle) {
        // This function trusts its input 
        if (this.currentFilePath !== 'Untitled') {

        }
        // Else, just launch a blank editor and set the edit mode to not have a file saved yet

    }
}