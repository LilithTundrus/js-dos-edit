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

// The actual text entered will likely need to be a huge string buffer that we keep an index
// of for the current character that the cursor is on my (handling vertical positioning may be a challenge)
// This allows us to actually know which character to delete on the screen when it's pressed

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
// TODO: Document everything we do -- this library has no documentation internally
// TODO: Scrollbars should have up/down arrows and be all the way to the right of the screen instead of right - 1

// Create the main box --this should mostly be void of style/borders and just act as the primary container
let mainWindow = blessed.box({
    top: 'center',
    left: 'center',
    width: '100%',
    height: '100%',
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
    // This should move the cursor to the start of the text box (somehow)
    screen.render();
});

textArea.key(['left'], function (ch, key) {
    // This callback returns an err and data object, the data object has the x position of cursor we need to poll
    program.getCursor(function (err, data) {
        // This VISUALLY keeps the cursor in left bound of the editing window
        if (data.x > 2) {
            // Move the cursor forward by one from the current position
            // TODO: This should wrap up to the next line if there is a line of text/empty spcae above
            program.cursorBackward();
        }
    })
});

textArea.key(['right'], function (ch, key) {
    // This callback returns an err and data object, the data object has the x position of cursor we need to poll
    program.getCursor(function (err, data) {
        // This VISUALLY keeps the cursor in right bound of the editing window
        if (data.x < screen.width - 1) {
            // Get the line that the cursor is sitting on minus the borders of the UI/screen
            let currentLineText = textArea.getLine(data.y - 2);
            // We need to make sure the line has any content in it at all before allowing a right cursor move

            // Pretty sure a 'line' includes anything written to a part of the text box
            // that doesn't have a \n to break it
            if (data.x > currentLineText.length + 2) return;
            // Move the cursor forward by one from the current position
            program.cursorForward();
            screen.render();
        }
    })
});

textArea.key(['up'], function (ch, key) {
    // This callback returns an err and data object, the data object has the y position of cursor we need to poll
    program.getCursor(function (err, data) {
        // This VISUALLY keeps the cursor in top bound of the editing window plus the menubar height
        if (data.y > 3) {
            // TODO: If the box is in a scrolling state we need to also scroll up as well
            program.cursorUp();
        }
    })
});

textArea.key(['down'], function (ch, key) {
    // This callback returns an err and data object, the data object has the y position of cursor we need to poll
    program.getCursor(function (err, data) {
        // This VISUALLY keeps the cursor in bottom bound of the editing window plus the statusbar height
        if (data.y < screen.height - 1) {
            // Get the line that the cursor is sitting on minus the borders of the UI/screen
            let currentLineText = textArea.getLine(data.y - 2);
            let allLinesText = textArea.getLines();
            // This likely isn't sound code
            // This is just checking if the line above equals the current line and if not
            // if (currentLineText == textArea.getLine(data.y - 1))
            if (currentLineText == allLinesText[allLinesText.length - 1]) return;
            // Using the current line, it needs to be determined if one exists
            // below it or not before letting the cursor move down
            // TODO:  If the box is in a scrolling state we need to also scroll down as well
            program.cursorDown();
        }
    });
});

textArea.key(['enter'], function (ch, key) {
    //TODO: This should intelligently insert a \n and flow any text into the next line
    program.getCursor(function (err, data) {
        textArea.insertLine(data.y - 2, `test ${data.y}`);
        screen.render();
    });
});

textArea.key(['a', 'b'], function (ch, key) {
    // Eventually, this need to be able to get the cursor location and go through a series
    // of steps to determine if text can be entered or if it is to be overflowed or even how 
    // to bring the cursor back to the last character of the current line being 'edited'

    // Eventually this should only deal with the CURRENT line
    textArea.setText(textArea.content + ch);
    // Get the current line value + text
    // Add the character to the end of the line if cursor pos is at the end of the current line
    // Else, insert the character at the current cursor position
    textLength++;
    screen.render();
});

textArea.key(['backspace'], function (ch, key) {
    program.getCursor(function (err, data) {
        // Get the line that the cursor is sitting on minus the borders of the UI/screen
        let currentLineText = textArea.getLine(data.y - 3);
        if (currentLineText.length >= 1) {
            // TODO: check the cursor.x var and if it's not at the end of the currentLineText
            // string, splice that character out rather than removing the characters at the end of the line
            textArea.setLine(data.y - 3, currentLineText.substring(0, currentLineText.length - 1));
        }
        // Else the cursor needs to flow up to the next line and backspace the previous line!
        else if (currentLineText.length < 1 && textArea.getLines().length > 1) {
            // Reflow to the next line
            textArea.deleteLine(data.y - 3);
            program.cursorPrecedingLine();
            let preceedingLineText = textArea.getLine(data.y - 3);
            // Move the cursor forward the length of the text + 1 for the UI border
            program.cursorForward(preceedingLineText.length + 1);
        }
        // Always render the screen on character changes
        screen.render();
    });
});

// Quit on Control-W
textArea.key(['C-w'], function (ch, key) {
    return process.exit(0);
});

// Render the screen.
screen.render();