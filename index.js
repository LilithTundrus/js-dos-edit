// Using ES5 strict mode
'use strict';

// Main entry point for the JS-DOS editor
// Eventually this will just return an instantiated editor class or something like that

const fs = require('fs');
const blessed = require('neo-blessed');
let program = blessed.program();

// Require the class created for the introduction box object that appears first on start
const IntroBox = require('./intro-box');
// Require the functions to handle each keypress
const keyHandlers = require('./keyHandlers');
// Require the set of keys to listen for on keypress event for keys to ignore that custom handlers listen for
const customKeys = require('./handledKeysSet');

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

// Set the title of the terminal window (if any)
screen.title = 'EDIT - untitled';

// Our menubar needs to look like this (the brackets meaning the highlighted character for alt + letter): 
// [F]ile [E]dit [S}earch [V]iew [O]ptions [H]elp

// The menubar should go FIRST, even before the main editing box

// After the menubar we'll want our main window
// Inside that window will be the text entry box
// This box will have the filename as the name of the title
// We'll want to keep the cursor bound to this box

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
// NOTE: Alt codes like ↑ work in blessed!
// NOTE: The version of blessed we're using is modified, the keys.js file has a regex to 
// ignore a couple extra things (mainly cursor reporting bullshit that's just, not handled by blessed.)

// TODO: Document everything done here -- this library has no documentation internally
// TODO: Scrollbars should have up/down arrows and be all the way to the right of the screen instead of right - 1
// TODO: support files being opened from the command line'
// TODO: get basic editing capability working (without weird bugs/issues)
// TODO: refactor existing code
// TODO: get the text editing aspects to act like VS code (reflowing, etc.)
// TODO: figure how to handle lines being longer than the window width 
// TODO: get scolling working (also move the scrollbar to the right )
// TODO: implement a vertical scrollbard (looking at the blessed scrollbar code could yield assistance)
// TODO: add more info to the statusbar area (if we can get the cursor to stop moving when it updates)
// TODO: get scrolling working (may end up being really hard because of how text is edited)

// Create the main box, this should mostly be void of style/borders and just act as the primary container
let mainWindow = blessed.box({
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%',
    style: {
        fg: 'white',
        bg: 'black',
    }
});

// Create the file menu box
let menubar = blessed.box({
    // The top should be the top of the screen
    top: 'top',
    left: 'center',
    // Always 100% of the screen width since it's a file menu
    width: '100%',
    height: 1,
    tags: true,
    // Pad the text for the menubar by 1 on each left/right
    padding: {
        left: 1,
        right: 1
    },
    style: {
        fg: 'black',
        bg: 'light-grey',
    },
    // Formatted for the sake of clarity
    content: `{red-fg}F{/red-fg}ile {red-fg}E{/red-fg}dit {red-fg}V{/red-fg}iew {red-fg}F{/red-fg}ind {red-fg}O{/red-fg}ptions`
});

let statusBar = blessed.text({
    // the bottom of the screen, but up by one
    bottom: 'bottom' - 1,
    left: 'center',
    width: '100%',
    height: 1,
    tags: true,
    padding: {
        left: 1,
        right: 1
    },
    style: {
        fg: 'black',
        bg: 'light-grey',
    },
    content: `Unsaved Document\t\t\t< Press Ctrl + W to quit >\t\t\t Line 0 | Col 0`
});

// This will likely become a regular box at some point that we end up customizing for editor needs
let textArea = blessed.text({
    top: 1,
    keyable: true,
    label: 'UNTITLED1',
    align: 'left',
    width: '100%',
    height: '100%-1',
    // Don't capture SGR Blessed escape codes, that could cause issues
    tags: false,
    style: {
        fg: 'bold',
        bg: 'blue',
        border: {
            fg: 'light-grey',
        },
        label: {
            fg: 'black',
            bg: 'light-grey'
        }
    },
    border: {
        type: 'line'
    },
    scrollable: true,
    scrollbar: {
        ch: '█',
        track: {
            bg: 'black',
            ch: '░'
        },
    },
});

// Create an instance of an IntroBox and passing the screen as the parent
let introBox = new IntroBox(screen, textArea, statusBar).introBox;

// Append the needed items to the screen
screen.append(mainWindow);
// Make sure the intro box is shown in the front 
screen.append(introBox);
// These should stay part of the screen at all times, so it's appended to the screen
screen.append(menubar);
screen.append(statusBar);

// Append the textArea to the mainWindow
mainWindow.append(textArea);

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
    statusBar.setContent(`Unsaved Document\t\t\t< Press Ctrl + W to quit >\t\t\t Line 1 | Col 1`);
    screen.render();
    // Destroy the introBox completely
    introBox = null;
});

program.key('left', () => {
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

// For some reason after changing some internal code the enter key is automatic now?
// It may have something to do with the fact that keypress listens for everything and inserts a \n on an enter key by default
textArea.key('enter', () => {
    // This should be fine for now, likely need to do more checks in the future
    program.cursorDown();
    screen.render();
});

//TODO: These two methods don't work just yet
textArea.key('pageup', () => {
    textArea.scroll(-1, true);
    screen.render();
});

textArea.key('pagedwon', () => {
    textArea.scroll(1, true);
    screen.render();
});

textArea.key('backspace', () => {
    program.getCursor((err, data) => {
        if (err) return;
        // Use the custom backspace keyHandler, passing the needed objects for blessed operations
        return keyHandlers.backspaceHandler(data, program, screen, textArea);
    });
});

textArea.key('space', () => {
    // TODO: have this make sure it won't breach any bounds
    program.cursorForward();
});

textArea.key('tab', () => {
    // TODO: have this make sure it won't breach any bounds
    // cursorForwardTab doesn't actually seem to insert a \t correctly, so it's done by advancing the cursor
    // by a tab width of 4
    program.cursorForward(4);
});

// This catches all keypresses
textArea.on('keypress', (ch, key) => {
    // Return, these are keys we can handle later (undefined means it isn't a character)
    if (ch == undefined) return;
    // If the key is already handled elsewhere, return
    else if (customKeys.has(key.name)) return;
    // TODO: Make sure that if autoreflow is off (it is by default) that the text box horizontally
    // scrolls accordingly
    // TODO: Eventually, this need to be able to get the cursor location and go through a series
    // of steps to determine if text can be entered or if it is to be overflowed
    // TODO: This should only deal with the CURRENT line
    // TODO: Else, a handler should be returned for inserting text
    
    // TODO: handle inserting text between words instead of only being able to append
    // (kind of like how backspace currently works)
    textArea.setText(textArea.content + ch);
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
textArea.key(['C-s'], function (ch, key) {
    // Remove the cursor from the text that for SOME REASON shows up
    fs.writeFileSync('test', textArea.content.replace('', ''));
});

// Render the screen
screen.render();