// Using ES5 strict mode
'use strict';

// This is the main entry point for the JS-DOS editor

// NOTE: the M denotes meta (alt key) for key listeners
// NOTE: Alt codes like ↑ work in blessed!
// NOTE: The version of blessed we're using is modified, the keys.js file has a regex to 
// ignore a couple extra things (mainly cursor reporting bullshit that's just, not handled by blessed.)
// NOTE: blessed is weird, if you make a change and it doesn't happen, try rendering in between each of
// the steps, they may not occur otherwise

// TODO: Scrollbars should have up/down arrows and be all the way to the right of the screen instead of right - 1
// TODO: support files being opened from the command line
// TODO: figure how to handle lines being longer than the window width 
// TODO: get scolling working (also move the scrollbar to the right)
// TODO: implement a horizontal scrollbar (looking at the blessed scrollbar code could yield assistance)
// TODO: add more info to the statusBar area (if we can get the cursor to stop moving when it updates)
// TODO: get scrolling working (may end up being really hard because of how text is edited)
// TODO: figure out how to properly insert tabs
// TODO: Create a folder structure for this project
// TODO: documents keyhandlers better
// TODO: fix this bug:
// TypeError: this._clines.rtof is not a function
// TODO: handle that when the textArea is in a scrolling state, text entry gets messed up 
// (it likely has to do with how we're not accounting for the scrolling index with the relative cursor
// position)
// TODO: get scrolling/custom scrolling working
// TODO: Modify blessed's borders to support a 'window' at the top (no border line being drawn)
// TODO: Add half-width shadows for buttons

/* Current working list:

Right now I think the main idea is that before working on the rest of the text editor, the 
actual text editing needs to be addressed. So I'll make sure that's perfect first

First basic editing controls, - DONE (sort of)
then scrolling (and scrollbars), - WORKING ON
then horizontal scrolling,
menus,
error handling,
user-facing error handling
then the rest

For editing controls, the priorities are fixing backspace, getting basic entry to insert _per line_ not at the end of the file
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

let program = blessed.program();
// Create a screen object to work with blessed
let screen = blessed.screen({
    smartCSR: true,
    autoPadding: true,
    program: program,
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
})

// Set the title of the terminal window (if any) -- this will eventually take cli arguments for reading a file to be edited
screen.title = 'EDIT - untitled';

// Create instances of the UI elements, passing the screen as the parent
let textArea = new TextArea(screen, 'UNTITLED').textArea;
let mainWindow = new MainWindow(screen).mainWindow;
let menuBar = new MenuBar(screen).menuBar;
let statusBar = new StatusBar(screen).statusBar;
let introBox = new IntroBox(screen, textArea, statusBar).introBox;
let openDialog = new OpenDialog(screen, textArea, statusBar).openDialog;
let scrollArrowUp = new ScrollArrowUp(screen).scrollArrowUp;

// Append the needed UI elements to the screen (in visual order)
screen.append(mainWindow);
screen.append(menuBar);
screen.append(textArea);
screen.append(statusBar);
// Make sure the intro box is shown in the front 
screen.append(introBox);
screen.append(openDialog);

// Scrolling arrows, these don't do much just yet except appear on the screen for the scrollbar
screen.append(scrollArrowUp);
openDialog.hide();


// Reset the cursor after appending all of the UI elements
program.resetCursor();

textArea.on('focus', () => {
    //TODO: When a file is opened, start at the top of the first line, but at the end
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
    // TODO: make the numbers + filename no longer be placeholders
    statusBar.setContent(`Unsaved Document\t\t\t< Ctrl+W=Quit  F1=Help >\t\t\t Line 1 | Col 1`);
    screen.render();
    // Destroy the introBox completely
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

textArea.key('tab', () => {
    // TODO: have this make sure it won't breach any bounds
    // TODO: Figure out how to get this to use actual tabs
    // cursorForwardTab doesn't actually seem to insert a \t correctly, so it's done by advancing the cursor
    // by a tab width of 4 spaces
    textArea.setText(textArea.content + '    ');
    program.cursorForward(4);
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
        return keyHandlers.mainKeyHandler(data, program, screen, textArea, ch);
    });
    screen.render();
});

// Function for getting the Line/Column count for the editing window
// TODO: handle scrolling/text bigger than the editing window
// TODO: handle the filename
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
textArea.key(['C-w'], () => {
    return process.exit(0);
});

// Test file writing functions
textArea.key(['C-s'], () => {

    // Remove the cursor from the text that for SOME REASON shows up
    fs.writeFileSync('test', textArea.content.replace('', ''));
});

textArea.key(['f4'], () => {
    return process.exit();
});

screen.key(['C-o'], () => {
    openDialog.toggle();
    openDialog.focus();
    screen.render();
});

// Render the screen
screen.render();