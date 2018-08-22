// Using ES5 strict mode
'use strict';

// This is the main entry point for the JS-DOS editor

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

// Require the class created for the introduction box blessed component that appears first on start
const IntroBox = require('./ui-components/intro-box');
// Require the functions to handle each keypress
const keyHandlers = require('./lib/keyHandlers');
// Require the set of keys to listen for on keypress event for keys to ignore that custom handlers listen for
const customKeys = require('./lib/handledKeysSet');
// Require the custom modular blessed components
const MainWindow = require('./ui-components/mainWindow');
const TextArea = require('./ui-components/textArea');
const MenuBar = require('./ui-components/menuBar');
const StatusBar = require('./ui-components/statusBar');
const OpenDialog = require('./ui-components/openDialog');
const ScrollArrowUp = require('./ui-components/scrollArrowUp');
const ScrollArrowDown = require('./ui-components/scrollArrowDown');
const FileMenu = require('./ui-components/fileMenu');

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

// TODO: Figure out why this doesn't work
program.on('resize', () => {
    program.cursorPos(3, 2);
    screen.render();
});

// Create instances of the UI elements, passing the screen as the parent
let textArea = new TextArea(screen, 'UNTITLED').textArea;
let mainWindow = new MainWindow(screen).mainWindow;
let menuBar = new MenuBar(screen).menuBar;
let statusBar = new StatusBar(screen).statusBar;
let introBox = new IntroBox(screen, textArea, statusBar).introBox;
let openDialog = new OpenDialog(screen, textArea, statusBar).openDialog;
let scrollArrowUp = new ScrollArrowUp(screen).scrollArrowUp;
let scrollArrowDown = new ScrollArrowDown(screen).scrollArrowDown;
let fileMenu = new FileMenu(screen, textArea, statusBar, menuBar).fileMenu;

// Testing 'knowing' what the file is like before being inserted into the editor
let file;

// This is the main function that gets exported for 'exposing' this code to be called from the CLI
function startEditor(filePath) {
    // This function trusts its input since it's only ever called by index.js

    // If the filePath is not the default
    if (filePath !== 'Untitled') {
        // Try to read the file's contents
        // TODO: This should support multiple encodings of text!
        // TODO: Also verify the file can be read
        // TODO: Figure out how to handle large files (fs read stream maybe?)
        // TODO: Have this save to the file in the passed path
        // TODO: If the data is changed and the editor is about to be exited, have a save dialog popup
        // TODO: this function should not have to do this, index.js should
        // TODO: Only get the end of the filePath for the editor's label
        // let encodingType = fileHelpers.getFileEncodingType(filePath);
        let contents = fs.readFileSync(filePath, 'UTF-8');
        file = contents.split('\n');
        textArea.setContent(contents, false, true);
    }
    // Else, just launch a blank editor and set the edit mode to not have a file saved yet

    // Set the title of the terminal window (if any) -- this will eventually take cli arguments for reading a file to be edited
    screen.title = `EDIT - ${filePath}`;
    textArea.setLabel(`${filePath}`);

    // Append the needed UI elements to the screen (in visual order)
    screen.append(mainWindow);
    screen.append(menuBar);
    screen.append(textArea);
    screen.append(statusBar);
    // Make sure the intro box is shown in the front
    screen.append(introBox);
    screen.append(openDialog);
    screen.append(fileMenu);

    // Scrolling arrows, these don't do much just yet except appear on the screen for the scrollbar
    screen.append(scrollArrowUp);
    screen.append(scrollArrowDown);

    // Hide any dialogs/menus just to be sure
    openDialog.hide();
    fileMenu.hide();

    // Reset the cursor after appending all of the UI elements
    program.resetCursor();
}

textArea.on('focus', () => {
    // TODO: When a file is opened, start at the top of the first line, but at the end of that line
    // Get the top and bottom + left/right of the screen to reset the cursor
    // Pull the cursor all the way to the top left no matter where it is
    program.getCursor((err, data) => {
        program.cursorUp(screen.height);
        program.cursorBackward(screen.width);
        // Put the cursor at line 1 column one of the editing window
        program.cursorForward(1);
        program.cursorDown(2);
        screen.render();
    });

    // Reset the content of the statusBar (the numbers are placeholders)
    // TODO: make the numbers + filePath no longer be placeholders
    statusBar.setContent(`Unsaved Document\t\t\t< Ctrl+W=Quit  F1=Help >\t\t\t Line 1 | Col 1`);
    screen.render();
    // Destroy the introBox completely (it's not needed more than once)
    introBox = null;
});

textArea.key('left', () => {
    // This callback returns an err and data object, the data object has the x/y position of the cursor
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom left keyHandler, passing the needed objects for blessed operations
        return keyHandlers.leftArrowHandler(data, program, screen, textArea);
    });
});

textArea.key('right', () => {
    // This callback returns an err and data object, the data object has the x/y position of the cursor
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom right keyHandler, passing the needed objects for blessed operations
        return keyHandlers.rightArrowHandler(data, program, screen, textArea);
    });
});

textArea.key('up', () => {
    // This callback returns an err and data object, the data object has the x/y position of the cursor
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom up keyHandler, passing the needed objects for blessed operations
        return keyHandlers.upArrowHandler(data, program, screen, textArea, scrollArrowUp);
    });
});

textArea.key('down', () => {
    // This callback returns an err and data object, the data object has the x/y position of the cursor
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom down keyHandler, passing the needed objects for blessed operations
        return keyHandlers.downArrowHandler(data, program, screen, textArea);
    });
});

textArea.key('enter', () => {
    // This callback returns an err and data object, the data object has the x/y position of the cursor
    program.getCursor((err, data) => {
        if (err) return;
        return keyHandlers.enterHandler(data, program, screen, textArea);
    });
});

textArea.key('backspace', () => {
    // This callback returns an err and data object, the data object has the x/y position of the cursor
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom backspace keyHandler, passing the needed objects for blessed operations
        return keyHandlers.backspaceHandler(data, program, screen, textArea);
    });
});

// TODO: have this make sure it won't breach any bounds
textArea.key('space', () => {
    // This callback returns an err and data object, the data object has the x/y position of the cursor
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom space keyHandler, passing the needed objects for blessed operations
        return keyHandlers.spaceHandler(data, program, screen, textArea);
    });
});

// TODO: have this make sure it won't breach any bounds
textArea.key('tab', () => {
    // This callback returns an err and data object, the data object has the x/y position of the cursor
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom space keyHandler, passing the needed objects for blessed operations
        return keyHandlers.tabHandler(data, program, screen, textArea);
    });
});

// This catches all keypresses
textArea.on('keypress', (ch, key) => {
    // Return, these are keys we can handle elsewhere (undefined means it isn't a display character)
    if (ch == undefined) return;
    // If the key is already handled elsewhere, return
    else if (customKeys.has(key.name)) return;
    // This shouldn't be needed, but the \r code sometimes gets into here
    if (ch === '\r') return;

    // Determine where to insert the character that was entered based on the cursor position
    // This callback returns an err and data object, the data object has the x/y position of the cursor
    program.getCursor((err, data) => {
        if (err) return;
        return keyHandlers.mainKeyHandler(data, program, screen, textArea, ch, file);
    });
    screen.render();
});

// Home/End keys used to get to the beginning/end of a line
// TODO: These need to handle horizontal scrolling
textArea.key('home', () => {
    // This callback returns an err and data object, the data object has the x/y position of the cursor
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom left keyHandler, passing the needed objects for blessed operations
        return keyHandlers.homeHandler(data, program, screen, textArea);
    });
});

textArea.key('end', () => {
    // This callback returns an err and data object, the data object has the x/y position of the cursor
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom left keyHandler, passing the needed objects for blessed operations
        return keyHandlers.endHandler(data, program, screen, textArea);
    });
});

// TODO: On escape, the cursor moves to the start of the current line (this needs to be fixed here)
textArea.key('escape', () => {
});

// Function for getting the Line/Column count for the editing window
// TODO: handle scrolling/text bigger than the editing window
// TODO: handle the filePath
// TODO: fix this being weird and controlling the cursor, maybe a custom cursor save if we really fucking have to
// function updateStatusBarRowsAndColumns(documentName) {
//     program.getCursor((err, data) => {
//         let currentLineTextLength = textArea.getLine(data.y - 3).length;
//         statusBar.setContent(`${documentName}\t\t\t< Press Ctrl + W to quit >\t\t\t Line ${data.x - 1} | Col ${currentLineTextLength}`);
//         program.restoreCursorA();
//         screen.render();
//     });
// }

// Quit on Control-W
// TODO: This should be aware of whether or not the editor has a file that isn't saved/etc.
textArea.key(['C-w'], () => {
    return process.exit(0);
});

// Test file writing functions
// TODO: This should be aware of whether or not the editor has a file already/etc.
textArea.key(['C-s'], () => {
    // TODO: this needs to be doing a lot more eventually
    // Remove the cursor from the text that for SOME REASON shows up
    fs.writeFileSync('test', textArea.content.replace('', ''));
    file = textArea.getText();
});

// Quit on F4
// TODO: This should be aware of whether or not the editor has a file that isn't saved/etc.
textArea.key(['f4'], () => {
    return process.exit();
});

// Show the open dialog on ctrl + o
// TODO: This should be aware of whether or not the editor has a file that isn't saved/etc.
screen.key(['C-o'], () => {
    if (openDialog.hidden) {
        openDialog.show();
        openDialog.focus();
    } else {
        openDialog.hide();
        textArea.focus();
    }
    screen.render();
});

// On Alt + f, open/close the file menu
screen.key(['M-f'], () => {
    if (fileMenu.hidden) {
        fileMenu.show();
        fileMenu.focus();
    } else {
        fileMenu.hide();
        textArea.focus();
    }
    screen.render();
});

// Render the screen
screen.render();

// Export the main module
module.exports.startEditor = startEditor;