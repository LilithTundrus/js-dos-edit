// Using ES5 strict mode
'use strict';

// This file contains the handlers for each key/combination that the editor supports

// This handles all standard character keys
function mainKeyHandler(cursor, program, screen, textArea, ch) {
    // This VISUALLY keeps the cursor in left bound of the editing window
    // TODO: There should also be a check for if the current line is valid to write to
    // IE it isn't in the middle of a blank editor
    // TODO: Scrol horizontally if this doesn't occur
    if (cursor.x < screen.width - 1) {
        // Get the line that the cursor is sitting on minus the borders of the UI/screen
        let currentLineText = textArea.getLine(cursor.y - 3);

        // If cursor is at the beginning of the line (move the rest of the text forward and insert the character)
        if (cursor.x == 2 && currentLineText.length > 1) {
            textArea.setLine(cursor.y - 3, ch + currentLineText);
            // Render the text change
            screen.render();
            program.cursorBackward(currentLineText.length);
            // Render the cursor change
            screen.render();
        }
        // If the cursor is somehwere in the middle (its an insert)
        // If the cursor is at the end
        else if (cursor.x >= currentLineText.length + 1) {
            textArea.setLine(cursor.y - 3, currentLineText + ch);
        } else {
            textArea.setLine(cursor.y - 3, currentLineText.substring(0, cursor.x - 2) + ch + currentLineText.substring(cursor.x - 2));
            screen.render();
            program.cursorBackward(currentLineText.length - currentLineText.substring(0, cursor.x - 1).length + 1)
            screen.render();
        }
        screen.render();
    }
}

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

// TODO: fix this sometimes going out of bounds when on an empty line
function upArrowHandler(cursor, program, screen, textArea) {
    // This VISUALLY keeps the cursor in top bound of the editing window plus the menubar height
    if (cursor.y > 3) {
        // TODO: If the box is in a scrolling state we need to also scroll up as well

        // Get the line one above current y position (relative to borders, etc.)
        let previouslineText = textArea.getLine(cursor.y - 4);
        // Get the current line for comparison
        let currentLineText = textArea.getLine(cursor.y - 3);

        // If the previous line is longer than the current
        if (previouslineText.length > cursor.x - 1 && cursor.x - 1 > currentLineText.length && cursor.x > 2) {
            // Find the difference between the current cursor.x and the length of the line above
            program.cursorForward(previouslineText.length - cursor.x + 2);
            program.cursorUp();
            // If both lines are equal
        } else if (previouslineText.length + 2 == cursor.x && currentLineText.length + 2 == cursor.x) {
            program.cursorUp();
            // If the cursor is ahead of the next line up
        } else if (previouslineText.length < cursor.x - 1 && cursor.x > 2) {
            program.cursorBackward(cursor.x - previouslineText.length - 2);
            program.cursorUp();
            // Else, just put the cursor up one -- it's in the middle and there is text above
        } else {
            program.cursorUp();
        }
    }
}

// TODO: fix this sometimes going out of bounds when on an empty line
function downArrowHandler(cursor, program, screen, textArea) {
    // This VISUALLY keeps the cursor in bottom bound of the editing window plus the statusbar height
    if (cursor.y < screen.height - 1) {
        // TODO: If the box is in a scrolling state we need to also scroll down as well

        // Get the line one above current y position (relative to borders, etc.)
        let nextLineText = textArea.getLine(cursor.y - 2);
        // Get the current line for comparison (one below the previous line)
        let currentLineText = textArea.getLine(cursor.y - 3);

        // Don't allow the cursor to move beyond the next line if it's 'empty'. Empty means the same line shows up each time, returned from the textArea check
        // TODO: This likely needs a better, stronger check
        let allLinesText = textArea.getLines();
        // If the last entry in the array of lines equals what the cursor line currently is AND the array is at the length of the line cursor is on
        if (currentLineText == allLinesText[allLinesText.length - 1] && allLinesText.length - 1 == cursor.y - 3 && cursor.x > 2) return;

        // If the next line is longer than the current
        if (nextLineText.length > cursor.x - 1 && cursor.x - 1 > currentLineText.length) {
            // Find the difference between the current cursor.x and the length of the line above
            program.cursorForward(nextLineText.length - cursor.x + 2);
            program.cursorDown();
            // If both lines are equal
        } else if (nextLineText.length + 2 == cursor.x && currentLineText.length + 2 == cursor.x) {
            program.cursorDown();
            // If the cursor is ahead of the next line down
        } else if (nextLineText.length < cursor.x - 1 && cursor.x > 2) {
            program.cursorBackward(cursor.x - nextLineText.length - 2);
            program.cursorDown();
            // Else, just put the cursor down one -- it's in the middle and there is text above
        } else {
            program.cursorDown();
        }
    }
}

// TODO: Fix the backspaces being off/weird/being able to get out of text bounds
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
            // Move the cursor forward the length of the text + 1 for the UI border if not empty
            if (preceedingLineText.length > 1) {
                program.cursorForward(preceedingLineText.length + 1);
            }
            program.cursorUp();
        }
        // Always render the screen on character changes
    }
    return screen.render();
}

function spaceHandler(cursor, program, screen, textArea) {
    // This VISUALLY keeps the cursor in left bound of the editing window
    if (cursor.x < screen.width - 1) {
        // Get the line that the cursor is sitting on minus the borders of the UI/screen
        let currentLineText = textArea.getLine(cursor.y - 3);

        // If cursor is at the beginning of the line
        // If the cursor is somehwere in the middle

        // If the cursor is at the end of the line
        if (cursor.x >= currentLineText.length + 1) {
            textArea.setLine(cursor.y - 3, currentLineText + ' ');
            program.cursorForward();
        }
        screen.render();
    }
}

// Export the key handlers
module.exports.mainKeyHandler = mainKeyHandler;
module.exports.rightArrowHandler = rightArrowHandler;
module.exports.leftArrowHandler = leftArrowHandler;
module.exports.upArrowHandler = upArrowHandler;
module.exports.downArrowHandler = downArrowHandler;
module.exports.backspaceHandler = backspaceHandler;
module.exports.spaceHandler = spaceHandler;