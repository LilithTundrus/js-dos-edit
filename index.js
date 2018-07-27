// Using ES5 strict mode
'use strict';

// Main entry point for the JS-DOS editor
// Eventually this will just return an instantiated editor class or something like that

const blessed = require('neo-blessed');
let program = blessed.program();


// Require the class created for the introduction box object that appears first on start
const IntroBox = require('./intro-box');

// Require the functions to handle each keypress
const keyHandlers = require('./keyHandlers');

// Create a screen object to work with blessed
let screen = blessed.screen({
    smartCSR: true,
    autoPadding: true,
    program: program,
    cursor: {
        artificial: true,
        shape: 'line',
        blink: false
    }
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

This is likely what will need the most intelligent code to work properly. A likely solution would be to
address each line as an individual text area and then always know what line the current cursor position 
is on
*/

// NOTE: Alt codes like ↑ work in blessed!
// TODO: Document everything done here -- this library has no documentation internally
// TODO: Scrollbars should have up/down arrows and be all the way to the right of the screen instead of right - 1
// TODO: figure out why the cursor movements aren't working 100% right (I think it's that the y offsets are off)

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
    //TODO: This should move the cursor to the start of the text box (somehow)
    screen.render();
    // Destroy the introBox completely
    introBox = null;
});

textArea.key('left', () => {
    // This callback returns an err and data object, the data object has the x position of cursor we need to poll
    program.getCursor((err, data) => {
        keyHandlers.leftArrowHandler(data, program, screen, textArea);
    });
});

textArea.key('right', () => {
    // This callback returns an err and data object, the data object has the x position of cursor we need to poll
    program.getCursor(function (err, data) {
        keyHandlers.rightArrowHandler(data, program, screen, textArea);
    })
});

textArea.key('up', () => {
    // This callback returns an err and data object, the data object has the y position of cursor we need to poll
    program.getCursor((err, data) => {
        keyHandlers.upArrowHandler(data, program, screen, textArea);
    })
});

textArea.key('down', () => {
    // This callback returns an err and data object, the data object has the y position of cursor we need to poll
    program.getCursor((err, data) => {
        keyHandlers.downArrowHandler(data, program, screen, textArea);
    });
});

textArea.key('enter', () => {
    // TODO: This should intelligently insert a \n and flow any text into the next line
    // TODO: this should NOT insert a line at the bottom but on the cursor pos.y + 1, shifting the entire text
    program.getCursor((err, data) => {
        textArea.insertLine(data.y - 2, `test ${data.y}`);
        screen.render();
    });
});

textArea.key(['a', 'b'], (ch, key) => {
    // TODO: Make sure that if autoreflow is off (it is by default) that the text box horizontally
    // scrolls accordingly
    // Eventually, this need to be able to get the cursor location and go through a series
    // of steps to determine if text can be entered or if it is to be overflowed

    // Eventually this should only deal with the CURRENT line
    textArea.setText(textArea.content + ch);
    // Get the current line value + text
    // Add the character to the end of the line if cursor pos is at the end of the current line
    // Else, insert the character at the current cursor position
    screen.render();
});

textArea.key('backspace', () => {
    program.getCursor((err, data) => {
        if (data.x > 1) {
            // Get the line that the cursor is sitting on minus the borders of the UI/screen
            let currentLineText = textArea.getLine(data.y - 3);
            if (currentLineText.length >= 1) {
                // If cursor is at the end of the current line
                if (data.x == currentLineText.length + 2) {
                    textArea.setLine(data.y - 3, currentLineText.substring(0, currentLineText.length - 1));
                } else {
                    // Else, a splice is needed rather than a removal
                    // Find the cursor position relative to the text
                    // Get the current cursor pos.x - 2 for finding which character to slice within the string minus the border
                    let backspaceIndex = data.x - 2;
                    //TODO: FIX! This does some weird stuff with the cursor where it resets on every backspace
                    // it may have something to do with the rendering procedure
                    textArea.setLine(data.y - 3, currentLineText.substring(0, backspaceIndex - 1) + currentLineText.substring(backspaceIndex, currentLineText.length));
                    // Set the cursor back to where the last character was removed, even after a reset
                    screen.render();
                    program.cursorBackward(currentLineText.length - currentLineText.substring(0, backspaceIndex).length);
                    screen.render();
                }
                program.cursorBackward();
            }
            // Else the cursor needs to flow up to the next line and backspace the previous line!
            else if (currentLineText.length < 1 && textArea.getLines().length > 1) {
                // Reflow to the next line
                textArea.deleteLine(data.y - 3);
                // TODO: figure out why this wraps to the bottom line if in the middle of the text box
                let preceedingLineText = textArea.getLine(data.y - 4);
                // Move the cursor forward the length of the text + 1 for the UI border
                program.cursorForward(preceedingLineText.length + 1);
                program.cursorUp();
            }
            // Always render the screen on character changes
        }
        screen.render();
    });
});

// Quit on Control-W
textArea.key(['C-w'], () => {
    return process.exit(0);
});

// Render the screen
screen.render();