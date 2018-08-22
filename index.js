// Using ES5 strict mode
'use strict';

// This is the main entry point for the editor, checks for command line arguments and 
// starts up the editor in a state where a file is already being edited

// NOTE: the M denotes meta (alt key) for key listeners
// NOTE: Alt codes like ↑ work in blessed!
// NOTE: The version of blessed we're using is modified, the keys.js file has a regex to 
// ignore a couple extra things (mainly cursor reporting bullshit that's just, not handled by blessed.)
// NOTE: blessed is weird, if you make a change and it doesn't happen, try rendering in between each of
// the steps, they may not occur otherwise

// TODO: Add more info to the statusBar area (if we can get the cursor to stop moving when it updates)
// TODO: Document keyhandlers better
// TODO: Fix this bug:
// TypeError: this._clines.rtof is not a function
// TODO: Get custom horizontal scrolling working
// TODO: Add half-width shadows for buttons
// TODO: Get the scroll arrows to 'blink' on arrow key events (works but annoyingly moves the cursor around to make the change)
// TODO: Better figure out DOS edit's behaviour to better match it
// TODO: Handle resizing a bit better at some point
// TODO: Get saving/opening documents working as well as checking if the currently edited document is saved or not
// TODO: Redo how cursor reflowing on the up/down arrow works (more like vim/vscode)
// TODO: This will require a lot of polish that's going to take a lot of time to work through
// TODO: Standardize blessed component geneeration order of options for components!
// TODO: FIX THER ORGANIZATION OF THIS PROJECT AAAAA

/* Current working list:

Right now I think the main idea is that before working on the rest of the text editor, the 
actual text editing needs to be addressed. So I'll make sure that's perfect first

First basic editing controls, - DONE (sort of) -- have bugs to iron out
then scrolling (and scrollbars), - DONE (mostly) -- still a bit of weirdness that needs to be worked through
then opening/reading files, - WORKING ON -- need the logic to check on the status of files + saving to user-defined files
then menus,
then horizontal scrolling,
error handling,
user-facing error handling
then the rest
*/

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