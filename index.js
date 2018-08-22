'use strict';
// Main entry point for the editor, checks for command line arguments and 
// starts up the editor in a state where a file is already being edited

// Node/NPM package requires
const fs = require('fs');

// Main editor file import
const editor = require('./editor');

// If there was a file argument
if (process.argv[2]) {
    // Try and read the file as a path


    // TODO: Verify the contents here before passing to the editor
    if (fs.existsSync(`${__dirname}/${process.argv[2]}`)) {
        // console.log(`${__dirname}/${process.argv[2]}`);
        return editor.startEditor(`${__dirname}/${process.argv[2]}`);
    }
    // If nothing is found, start the editor in an error state OR just print an error message

} else {
    editor.startEditor('Untitled');
}