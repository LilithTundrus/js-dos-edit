'use strict';
// Main entry point for the JS-DOS editor
// Eventually this will just return an instantiated editor class or something like that

const blessed = require('neo-blessed');
let program = blessed.program();

// Require the class created for the introduction box object that appears first on start
const IntroBox = require('./intro-box');

// Create a screen object to work with blessed
let screen = blessed.screen({
    smartCSR: true,
    autoPadding: true,
    program: program
});

// Set the title of the terminal window (if any)
screen.title = 'EDIT - untitled';

// Our menubar needs to look like this (the brackets meaning the highlighted character for alt + letter): 
// [F]ile [E]dit [S}earch [V]iew [O]ptions [H]elp

// The menubar should go FIRST, even before the main editing box
// This may be a challenge depending on how blessed works

// After the menubar we'll want our main window

// Inside that window will be the text entry box
// This box will have the filename as the name of the title
// We'll want to keep the cursor bound to this box

// The actual text entered will likely need to be a huge string buffer that we keep an index
// of for the current character that the cursor is on my (handling vertical positioning may be a challenge)
// This allows us to actually know which character to delete on the screen when it's pressed

// The scrollbar up/down arrow ASCII characters may just have to be static and not actually
// part of a real scrollbar (I need to look at all of the code for this project)

// At the bottom there should be a character counter and a word counter as well as line/column count:
//  Current Document status (IE did it save?)      F1=Help Ctrl-C=quit          Col: 1 Line: 1

// NOTE: Alt codes like ↑ work in blessed!
// TODO: Document everything we do -- this library has no documentation internally

// Create the main box --this should mostly be void of style/borders and just act as the primary container
let mainWindow = blessed.box({
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%',
    // tags: true,
    style: {
        fg: 'white',
        bg: 'black',
    },
});

// Create the file menu box
let menubar = blessed.box({
    // the top should be the top of the screen
    top: 'top',
    left: 'center',
    // Always 100% of the screen width since it's a file menu
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
    content: `{red-fg}F{/red-fg}ile {red-fg}E{/red-fg}dit {red-fg}V{/red-fg}iew {red-fg}F{/red-fg}ind {red-fg}O{/red-fg}ptions`
})

let statusBar = blessed.box({
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
})

// This will likely become a regular box at some point that we end up customizing
let textArea = blessed.box({
    top: 1,
    keyable: true,
    label: 'UNTITLED1',
    align: 'left',
    width: '100%',
    height: '100%-1',
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
    scrollbar: {
        ch: '█',
        track: {
            bg: 'black',
            ch: '░'
        },
    },
});

// Create an instance of an IntroBox and passing the screen as the parent
let introBox = new IntroBox(screen, textArea).introBox;

// Append the needed items to the screen
screen.append(mainWindow);
// Make sure the intro box is shown in the front 
screen.append(introBox);
// These should stay part of the screen at all times, so it's appended to the screen
screen.append(menubar);
screen.append(statusBar);

// Append the textArea to the mainWindow
mainWindow.append(textArea);

textArea.on('focus', function () {
    // text.show();
    program.resetCursor();
    // This should move the cursor to the start of the text box
    program.move(-10, 20);
    // program.
    screen.render();                                            //may not be needed
    // textArea.readInput();
    screen.render();
});

textArea.key(['left'], function (ch, key) {
    // This callback returns an err and data object, the data object has the x position of cursor we need to poll
    program.getCursor(function (err, data) {
        // This VISUALLY keeps the cursor in left bound of the editing window
        if (data.x > 3) {
            program.cursorBackward();
        }
    })
});

textArea.key(['right'], function (ch, key) {
    // textArea.setContent(`${JSON.stringify(textArea.position)} ${program}`)
    program.getCursor(function (err, data) {
        if (data.x < screen.width - 1) {
            program.cursorForward()
            screen.render()
        }
    })
});

textArea.key(['up'], function (ch, key) {
    // This callback returns an err and data object, the data object has the y position of cursor we need to poll
    program.getCursor(function (err, data) {
        // This VISUALLY keeps the cursor in left bound of the editing window
        if (data.y > 3) {
            // If the box is in a scrolling state we need to also scroll up as well
            program.cursorUp();
        }
    })
});

// Quit on Control-W
textArea.key(['C-w'], function (ch, key) {
    return process.exit(0);
});

// Render the screen.
screen.render();