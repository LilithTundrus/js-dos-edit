'use strict';
// Main entry point for the editor, checks for command line arguments and 
// starts up the editor in a state where a file is already being edited

// Node/NPM package requires
const fs = require('fs');
const blessed = require('neo-blessed');

// Create the blessed program object to associate with the blessed screen
let program = blessed.program();
// Create a screen object to work with blessed
let screen = blessed.screen({
    smartCSR: true,
    // Autopad screen elements unless no padding it explicitly required
    autoPadding: true,
    program: program,
    // Used, but often doesn't work
    cursor: {
        artificial: true,
        shape: 'line',
        blink: false
    },
});

// Main editor file import
const Editor = require('./editorClass');

// If there was a file argument
if (process.argv[2]) {
    // Try and read the file as a path

    // TODO: Verify the contents here before passing to the editor
    if (fs.existsSync(`${__dirname}/${process.argv[2]}`)) {
        let editor = new Editor(program, screen, `${__dirname}/${process.argv[2]}`)

        return editor.start(null, `${__dirname}/${process.argv[2]}`, null);
    }
    // If nothing is found, start the editor in an error state OR just print an error message

} else {
    editor.startEditor('Untitled');
}