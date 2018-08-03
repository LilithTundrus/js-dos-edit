// Using ES5 strict mode
'use strict';

// This is the main entry point for the JS-DOS editor

// Node/NPM package requires
const fs = require('fs');
const blessed = require('neo-blessed');

// Require the class created for the introduction box object that appears first on start
const IntroBox = require('./intro-box');
// Require the functions to handle each keypress
const keyHandlers = require('./keyHandlers');
// Require the set of keys to listen for on keypress event for keys to ignore that custom handlers listen for
const customKeys = require('./handledKeysSet');

// Import the custom modular blessed components
const MainWindow = require('./mainWindow');
const TextArea = require('./textArea');
const MenuBar = require('./menuBar');
const StatusBar = require('./statusBar');

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

// Set the title of the terminal window (if any) -- this will eventually take cli arguments for reading a file to be edited
screen.title = 'EDIT - untitled';

// The menuBar needs to look like this (the brackets meaning the highlighted character for alt + letter): 
// [F]ile [E]dit [S}earch [V]iew [O]ptions [H]elp

// The menuBar should go FIRST, even before the main editing box

// After the menuBar will be main window
// Inside that window will be the text entry box
// This box will have the filename as the name of the title
// The cursor will remain bound to this box

// The actual text entered is stored in lines, handled one at a time so the amount
// of text being worked with at once stays low. 

// The scrollbar up/down arrow ASCII characters may just have to be static and not actually
// part of a real scrollbar (I need to look at all of the code for this project)

// At the bottom there should be a character counter and a word counter as well as line/column count:
//  Current Document status (IE did it save?)      F1=Help Ctrl-C=quit          Col: 1 Line: 1
/*
For the text entry area the cursor needs to be kept in bounds as well as what character that
the cursor is currently over. This will be likely the biggest challenge, the actual text entry.

Another thing to think of is how the keys should be polled and mapped. There is a built-in
readInput() method sort of works but also comes with its own weirdness like reading the 
cursor coordinate reporting (which is annoying)

The text entry area will be the most logically complex since things like not allowing the END
key to go to the end of the text area but to the end of the text ON that line
*/
// NOTE: the M denotes meta (alt key) for key listeners
// NOTE: Alt codes like ↑ work in blessed!
// NOTE: The version of blessed we're using is modified, the keys.js file has a regex to 
// ignore a couple extra things (mainly cursor reporting bullshit that's just, not handled by blessed.)

// TODO: Scrollbars should have up/down arrows and be all the way to the right of the screen instead of right - 1
// TODO: support files being opened from the command line
// TODO: get the text editing aspects to act like VS code (reflowing, etc.)
// TODO: figure how to handle lines being longer than the window width 
// TODO: get scolling working (also move the scrollbar to the right )
// TODO: implement a vertical scrollbard (looking at the blessed scrollbar code could yield assistance)
// TODO: add more info to the statusBar area (if we can get the cursor to stop moving when it updates)
// TODO: get scrolling working (may end up being really hard because of how text is edited)
// TODO: figure out how to properly insert tabs
// TODO: Create a folder structure for this project

/* Current working list:

Right now I think the main idea is that before working on the rest of the text editor, the 
actual text editing needs to be addressed. So I'll make sure that's perfect first

First basic editing controls, 
then scrolling,
then horizontal scrolling,
then the rest

For editing controls, the priorities are fixing backspace, getting basic entry to insert _per line_ not at the end of the file
*/

// Create instances of the UI elements, passing the screen as the parent
let textArea = new TextArea(screen, 'UNTITLED').textArea;
let mainWindow = new MainWindow(screen).mainWindow;
let menuBar = new MenuBar(screen).menuBar;
let statusBar = new StatusBar(screen).statusBar;
let introBox = new IntroBox(screen, textArea, statusBar).introBox;

// Append the needed UI elements to the screen (in visual order)
screen.append(mainWindow);
screen.append(menuBar);
// NOTE: if commands/actions aren't working right, try appending to the mainWindow like it was previously
screen.append(textArea);
screen.append(statusBar);
// Make sure the intro box is shown in the front 
screen.append(introBox);
// Reset the cursor after appending all of the UI elements
program.resetCursor();

textArea.on('focus', () => {
    //TODO: When a file is opened, start at the top of the first line, but at the end
    // screen.render();
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
    // This callback returns an err and data object, the data object has the x position of cursor we need to poll
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom left keyHandler, passing the needed objects for blessed operations
        if (data) keyHandlers.leftArrowHandler(data, program, screen, textArea);
    });
});

textArea.key('right', () => {
    // This callback returns an err and data object, the data object has the x position of cursor we need to poll
    program.getCursor(function (err, data) {
        if (err) return;
        // Use the custom right keyHandler, passing the needed objects for blessed operations
        keyHandlers.rightArrowHandler(data, program, screen, textArea);
    });
});

textArea.key('up', () => {
    // This callback returns an err and data object, the data object has the y position of cursor we need to poll
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom up keyHandler, passing the needed objects for blessed operations
        keyHandlers.upArrowHandler(data, program, screen, textArea);
    });
});

textArea.key('down', () => {
    // This callback returns an err and data object, the data object has the y position of cursor we need to poll
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom down keyHandler, passing the needed objects for blessed operations
        keyHandlers.downArrowHandler(data, program, screen, textArea);
    });
});

textArea.key('enter', () => {
    program.getCursor((err, data) => {
        keyHandlers.enterHandler(data, program, screen, textArea);
    });
});

//TODO: These two methods don't work just yet
// textArea.key('pageup', () => {
//     textArea.scroll(-1, true);
//     screen.render();
// });

// textArea.key('pagedown', () => {
//     textArea.scroll(1, true);
//     screen.render();
// });

textArea.key('backspace', () => {
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom backspace keyHandler, passing the needed objects for blessed operations
        return keyHandlers.backspaceHandler(data, program, screen, textArea);
    });
});

// TODO: have this make sure it won't breach any bounds
textArea.key('space', () => {
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
    // Return, these are keys we can handle later (undefined means it isn't a character)
    if (ch == undefined) return;
    // If the key is already handled elsewhere, return
    else if (customKeys.has(key.name)) return;
    // This shouldn't be needed but the \r code sometimes gets into here
    if (ch === '\r') return;
    // TODO: Make sure that if autoreflow is off (it is by default) that the text box horizontally scrolls accordingly
    // TODO: Eventually, this need to be able to get the cursor location and go through a series
    // of steps to determine if text can be entered or if it is to be overflowed

    // Determine where to insert the character that was entered based on the cursor position
    program.getCursor((err, data) => {
        // TODO: this should eventually exit since an error is a major issue
        if (err) return;
        return keyHandlers.mainKeyHandler(data, program, screen, textArea, ch)
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
textArea.key(['C-s'], (ch, key) => {
    // Remove the cursor from the text that for SOME REASON shows up
    fs.writeFileSync('test', textArea.content.replace('', ''));
});

textArea.key(['f4'], (ch, key) => {
    return process.exit();
});

// Render the screen
screen.render();