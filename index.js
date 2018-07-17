'use strict';
// Main entry point for the JS-DOS editor
// Eventually this will just return an instantiated editor class or something like that

const blessed = require('neo-blessed');
const IntroBox = require('./intro-box');

// Create a screen object.
let screen = blessed.screen({
    smartCSR: true,
    autoPadding: true
});

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


// Create the main box --this should mostly be void of style/borders
let mainWindow = blessed.box({
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%',
    // Label is the box's title, we likely DON'T want to use this if we can prevent it
    // label: `{light-grey-bg}{bold}Test{/bold}{/light-grey-bg}`,
    tags: true,
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        },
    },
});

// Create the file menu box
let menubar = blessed.box({
    top: 'top',
    left: 'center',
    width: '100%',
    height: 1,
    tags: true,
    style: {
        fg: 'black',
        bg: 'light-grey',
    },
    content: `  {red-fg}F{/red-fg}ile`
})

let menubarBottom = blessed.box({
    bottom: 'bottom' - 1,
    left: 'center',
    width: '100%',
    height: 1,
    tags: true,
    style: {
        fg: 'black',
        bg: 'light-grey',
    },
    content: `Null`
})

let textArea = blessed.textarea({
    top: 'center',
    left: 'center',
    keys: true,
    width: '100%',
    height: '100%',
    tags: true,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'blue',
        border: {
            fg: 'light-grey',
            // bg: 'blue'
        },
    },
});

// Create an instance of an IntroBox and passing the screen as the parent
let introBox = new IntroBox(screen, textArea).introBox;

// Append our box to the screen.
screen.append(mainWindow);
screen.append(introBox);

// Append the textArea to the mainWindow
mainWindow.append(textArea);
mainWindow.append(menubar);
screen.append(menubarBottom);

// Testing for key events
textArea.key('enter', function (ch, key) {
    // box.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
    // box.setLine(1, 'bar');
    // box.insertLine(1, 'foo');
    mainWindow.setLabel('{right}{light-grey-bg}{black-fg}Test{/black-fg}{/light-grey-bg}{/right}')
    screen.render();
});

textArea.on('focus', function () {
    // text.show();
    textArea.readInput();
    // screen.render();                                            //may not be needed
});

// Quit on Control-C
textArea.key(['C-c'], function (ch, key) {
    return process.exit(0);
});

// Focus the PH by default
// introBox.focus();

// Render the screen.
screen.render();