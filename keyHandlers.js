// Using ES5 strict mode
'use strict';

// This file contains the handlers for each key/combination that the editor supports

function rightArrowHandler(cursor, program, screen, textArea) {
    // This VISUALLY keeps the cursor in right bound of the editing window
    if (cursor.x < screen.width - 1) {
        // Get the line that the cursor is sitting on minus the borders of the UI/screen
        let currentLineText = textArea.getLine(cursor.y - 3);
        // We need to make sure the line has any content in it at all before allowing a right cursor move

        // Pretty sure a 'line' includes anything written to a part of the text box
        // that doesn't have a \n to break it
        if (cursor.x > currentLineText.length + 1) return;
        // Move the cursor forward by one from the current position
        program.cursorForward();
        screen.render();
    }
}

function leftArrowHandler(cursor, program, screen, textArea) {
    // This VISUALLY keeps the cursor in left bound of the editing window
    if (cursor.x > 2) {
        // Move the cursor backward by one from the current position
        program.cursorBackward();
        // Make sure the action shows up on the screen
        screen.render();
    }
    // Make sure the cursor is all the way to the left before wrapping
    else if (cursor.x == 2) {
        // Get the y location and then get the line one above current position
        // If there is a line above, wrap to the right of that line and render the screen
        let previouslineText = textArea.getLine(cursor.y - 2);
        // Make sure there's text above AND within the screen bounds
        if (previouslineText && cursor.y > 3) {
            program.cursorForward(previouslineText.length);
            program.cursorUp();
        }
    }
}

function upArrowHandler(cursor, program, screen, textArea) {
    // This VISUALLY keeps the cursor in top bound of the editing window plus the menubar height
    if (cursor.y > 3) {
        // TODO: If the box is in a scrolling state we need to also scroll up as well

        // Get the line one above current y position (relative to borders, etc.)
        let previouslineText = textArea.getLine(cursor.y - 4);
        // Get the current line for comparison
        let currentLineText = textArea.getLine(cursor.y - 3);

        // If the previous line is longer than the current
        if (previouslineText.length > cursor.x - 1 && cursor.x - 1 > currentLineText.length) {
            // Find the difference between the current cursor.x and the length of the line above
            program.cursorForward(previouslineText.length - cursor.x + 2);
            program.cursorUp();
            // If both lines are equal
        } else if (previouslineText.length + 2 == cursor.x && currentLineText.length + 2 == cursor.x) {
            program.cursorUp();
            // If the cursor is ahead of the next line up
        } else if (previouslineText.length < cursor.x - 1) {
            program.cursorBackward(cursor.x - previouslineText.length - 2);
            program.cursorUp();
            // Else, just put the cursor up one -- it's in the middle and there is text above
        } else {
            program.cursorUp();
        }
    }
}

function downArrowHandler(cursor, program, screen, textArea) {
    // This VISUALLY keeps the cursor in bottom bound of the editing window plus the statusbar height
    if (cursor.y < screen.height - 1) {
        // TODO: If the box is in a scrolling state we need to also scroll down as well

        // Get the line one above current y position (relative to borders, etc.)
        let nextLineText = textArea.getLine(cursor.y - 2);
        // Get the current line for comparison
        let currentLineText = textArea.getLine(cursor.y - 3);

        // Don't allow the cursor to move beyond the next line if it's 'empty'
        // Empty means the same line shows up each time, returned from the textArea check
        // This likely needs a better, stronger check
        let allLinesText = textArea.getLines();
        if (currentLineText == allLinesText[allLinesText.length - 1] && allLinesText.length - 1 == cursor.y - 3) return;

        // If the next line is longer than the current
        if (nextLineText.length > cursor.x - 1 && cursor.x - 1 > currentLineText.length) {
            // Find the difference between the current cursor.x and the length of the line above
            program.cursorForward(nextLineText.length - cursor.x + 2);
            program.cursorDown();
            // If both lines are equal
        } else if (nextLineText.length + 2 == cursor.x && currentLineText.length + 2 == cursor.x) {
            program.cursorDown();
            // If the cursor is ahead of the next line down
        } else if (nextLineText.length < cursor.x - 1) {
            program.cursorBackward(cursor.x - nextLineText.length - 2);
            program.cursorDown();
            // Else, just put the cursor down one -- it's in the middle and there is text above
        } else {
            program.cursorDown();
        }
    }
}

// TODO: on an 'empty' line removal, don't move the cursor back, it should stay in the same spot
function backspaceHandler(cursor, program, screen, textArea) {
    if (cursor.x > 1) {
        // Get the line that the cursor is sitting on minus the borders of the UI/screen
        let currentLineText = textArea.getLine(cursor.y - 3);
        if (currentLineText.length >= 1) {
            // If cursor is at the end of the current line
            if (cursor.x == currentLineText.length + 2) {
                textArea.setLine(cursor.y - 3, currentLineText.substring(0, currentLineText.length - 1));
            } else {
                // Else, a splice is needed rather than a removal
                // Find the cursor position relative to the text
                // Get the current cursor pos.x - 2 for finding which character to slice within the string minus the border
                let backspaceIndex = cursor.x - 2;
                //TODO: FIX! This does some weird stuff with the cursor where it resets on every backspace
                // it may have something to do with the rendering procedure
                textArea.setLine(cursor.y - 3, currentLineText.substring(0, backspaceIndex - 1) + currentLineText.substring(backspaceIndex, currentLineText.length));
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
            textArea.deleteLine(cursor.y - 3);
            // TODO: figure out why this wraps to the bottom line if in the middle of the text box
            let preceedingLineText = textArea.getLine(cursor.y - 4);
            // Move the cursor forward the length of the text + 1 for the UI border
            if (preceedingLineText.length > 1) {
                program.cursorForward(preceedingLineText.length + 1);
            }
            program.cursorUp();
        }
        // Always render the screen on character changes
    }
    screen.render();
}

module.exports.rightArrowHandler = rightArrowHandler;
module.exports.leftArrowHandler = leftArrowHandler;
module.exports.upArrowHandler = upArrowHandler;
module.exports.downArrowHandler = downArrowHandler;
module.exports.backspaceHandler = backspaceHandler;