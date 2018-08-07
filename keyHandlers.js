// Using ES5 strict mode
'use strict';

// This file contains the handlers for each key/combination that the editor supports

// TODO: Maybe split the major keys out into their own function since they're getting a bit long

// This handles all standard character keys
function mainKeyHandler(cursor, program, screen, textArea, ch) {
    // TODO: There should also be a check for if the current line is valid to write to
    // IE it isn't in the middle of a blank editor
    // TODO: Scroll horizontally if this check doesn't occur

    // This VISUALLY keeps the cursor in left bound of the editing window
    if (cursor.x < screen.width - 1) {
        // Get the line that the cursor is sitting on minus the borders of the UI/screen
        let currentLineText = textArea.getLine(cursor.y - 3);

        // If there's no text to begin with (this should be what avoids weird text ghosting onto a new line)
        if (cursor.x == 2 && currentLineText.length < 1) {
            // Add the character to the beginning of the line
            textArea.setLine(cursor.y - 3, ch);
            // Render the text change
            screen.render();
        }
        // If cursor is at the beginning of the line (move the rest of the text forward and insert the character)
        else if (cursor.x == 2 && currentLineText.length > 1) {
            // Add the character to the beginning of the line
            textArea.setLine(cursor.y - 3, ch + currentLineText);
            // Render the text change
            screen.render();
            // Offset the auto-cursor-restore to move the cursor back to the last position it was in
            program.cursorBackward(currentLineText.length);
            // Render the cursor change
            screen.render();
        }
        // If the cursor is at the end
        else if (cursor.x >= currentLineText.length + 1) {
            // Add the character to the end of the line, the cursor auto-renders and moves forward on its own in this case
            textArea.setLine(cursor.y - 3, currentLineText + ch);
        }
        // If the cursor is somehwere in the middle (its an insert)
        else {
            textArea.setLine(cursor.y - 3, currentLineText.substring(0, cursor.x - 2) + ch + currentLineText.substring(cursor.x - 2));
            // Render the text change
            screen.render();
            program.cursorBackward(currentLineText.length - currentLineText.substring(0, cursor.x - 1).length + 1)
            // Render the cursor change
            screen.render();
        }
        // Always render the screen at the end of the function to be sure the changes made correctly show
        screen.render();
    } else {
        // This is where my vertical scroll code would go IF I HAD ANY
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
        // Render the cursor change
        screen.render();
    }
}

function leftArrowHandler(cursor, program, screen, textArea) {
    // This VISUALLY keeps the cursor in left bound of the editing window
    if (cursor.x > 2) {
        // Move the cursor backward by one from the current position
        program.cursorBackward();
        // Render the cursor change
        screen.render();
    }
    // Make sure the cursor is all the way to the left before wrapping
    else if (cursor.x == 2) {
        // Get the y location and then get the line one above current position
        // If there is a line above, wrap to the right of that line and render the screen
        let previouslineText = textArea.getLine(cursor.y - 2);
        // Make sure there's text above AND within the screen bounds
        if (previouslineText && cursor.y > 3) {
            // TODO: also make sure that the cursor STARTS at the beginning of the current line so the cursor isn't out in the middle of nowhere
            // Move the cursor forward by the length of the above text and up by one
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
    // Scroll the text up by one (sort of, not just yet)
    else if (cursor.y == 3 && textArea.getScrollPerc() > 1) {
        // TODO: This needs to more cleanly handle this (the x position of the cursor janks around)
        textArea.scroll(-1);
        screen.render();
        program.cursorPos(3, cursor.x);
        screen.render();
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

        // TOD: make this a better check
        // If the last entry in the array of lines equals what the cursor line currently is AND the array is at the length of the line cursor is on
        if (currentLineText == allLinesText[allLinesText.length - 1] && allLinesText.length - 1 == cursor.y - 3 && cursor.x > 2) return;

        // If the next line is longer than the current
        if (nextLineText.length > cursor.x - 1 && cursor.x - 1 > currentLineText.length && currentLineText.length > 0) {
            // Find the difference between the current cursor.x and the length of the line above
            program.cursorForward(nextLineText.length - cursor.x + 2);
            program.cursorDown();
        }
        // If both lines are equal
        else if (nextLineText.length + 2 == cursor.x && currentLineText.length + 2 == cursor.x) {
            program.cursorDown();
        }
        // If the cursor is ahead of the next line down
        else if (nextLineText.length < cursor.x - 1 && cursor.x > 2) {
            program.cursorBackward(cursor.x - nextLineText.length - 2);
            program.cursorDown();
        }
        // Else, just put the cursor down one -- it's in the middle and there is text above
        else {
            program.cursorDown();
        }
        // Scroll the text down by one
    } else if (cursor.y == screen.height - 1) {
        // TODO: This needs to more cleanly handle this (the x position of the cursor janks around)
        textArea.scroll(1);
        screen.render();
        // For some reason the screen - 2 is what sets the cursor to the bottom position that's needed
        program.cursorPos(screen.height - 2, cursor.x);
        screen.render();
    }
}

// TODO: Make sure when reflowing up to the next line that it won't go out of bounds
function backspaceHandler(cursor, program, screen, textArea) {
    if (cursor.x <= 1) return;

    // Get the line that the cursor is sitting on minus the borders of the UI/screen
    let currentLineText = textArea.getLine(cursor.y - 3);

    if (currentLineText.length >= 1) {
        // If cursor is at the end of the current line
        if (cursor.x == currentLineText.length + 2) {
            textArea.setLine(cursor.y - 3, currentLineText.substring(0, currentLineText.length - 1));
            // For some reason blessed automatically handles whitespace backspacing
            // If the character at the END of the line isn't a space 
            if (currentLineText.charAt(currentLineText.length - 1) !== ' ') {
                program.cursorBackward();
            }
            screen.render();
        }
        // Cursor is at the beginning of the full line 
        else if (cursor.x == 2 && textArea.getLines().length > 1) {
            // Flow the current text up to the next line

            // Get the previous line's text
            let preceedingLineText = textArea.getLine(cursor.y - 4);

            textArea.setLine(cursor.y - 4, preceedingLineText + currentLineText);
            textArea.deleteLine(cursor.y - 3);
            // Reender the text change
            screen.render();
            // Move the cursor to the above line where the merge was made
            // Y, X notation for row:column
            program.cursorPos(cursor.y - 2, cursor.x + preceedingLineText.length)
            // Render the cursor change
            screen.render();
        }
        // Else, a splice is needed rather than a removal
        else {
            // Find the cursor position relative to the text
            // Get the current cursor pos.x - 2 for finding which character to slice within the string minus the border
            let backspaceIndex = cursor.x - 2;
            textArea.setLine(cursor.y - 3, currentLineText.substring(0, backspaceIndex - 1) + currentLineText.substring(backspaceIndex, currentLineText.length));
            // Set the cursor back to where the last character was removed, even after a reset
            screen.render();
            if (cursor.x > 2) {

                program.cursorBackward(currentLineText.length - currentLineText.substring(0, backspaceIndex).length);
                // Render the cursor change
                screen.render();
            }
        }
        if (cursor.x > 2) {
            program.cursorBackward();
        }
    }
    // Else the cursor needs to flow up to the next line and backspace the previous line!
    else if (currentLineText.length < 1 && textArea.getLines().length > 1) {
        // Reflow to the next line
        textArea.deleteLine(cursor.y - 3);
        let preceedingLineText = textArea.getLine(cursor.y - 4);
        // Render the line being deleted
        screen.render();
        if (cursor.x > 1 && cursor.y > 2) {
            // Position the cursor up to the next line
            // Y, X notation for row:column
            program.cursorPos(cursor.y - 2, cursor.x - 1 + preceedingLineText.length);
            // Render the cursor change
            screen.render();
        }
    }
    // Always render the screen at the end of the function to be sure the changes made correctly show
    screen.render();
}

function spaceHandler(cursor, program, screen, textArea) {
    // TODO: Scroll horizontally if this check doesn't occur

    // This VISUALLY keeps the cursor in right bound of the editing window
    if (cursor.x < screen.width - 1) {
        // Get the line that the cursor is sitting on minus the borders of the UI/screen
        let currentLineText = textArea.getLine(cursor.y - 3);

        // If cursor is at the beginning of the line (move the rest of the text forward and insert the character)
        if (cursor.x == 2 && currentLineText.length > 1) {
            // Add the space to the start of the line
            textArea.setLine(cursor.y - 3, ' ' + currentLineText);
            // Render the text change
            screen.render();
            program.cursorBackward(currentLineText.length);
            program.cursorForward();
            // Render the cursor change
            screen.render();
        }
        // If the cursor is at the end
        else if (cursor.x >= currentLineText.length + 1) {
            textArea.setLine(cursor.y - 3, currentLineText + ' ');
            program.cursorForward();
        }
        // If the cursor is somehwere in the middle (its an insert)
        else {
            textArea.setLine(cursor.y - 3, currentLineText.substring(0, cursor.x - 2) + ' ' + currentLineText.substring(cursor.x - 2));
            // Render the text change
            screen.render();
            program.cursorBackward(currentLineText.length - currentLineText.substring(0, cursor.x - 1).length + 1)
            // Render the cursor change
            screen.render();
        }
        screen.render();
    }
}

function enterHandler(cursor, program, screen, textArea) {
    // Get the line that the cursor is sitting on minus the borders of the UI/screen
    let currentLineText = textArea.getLine(cursor.y - 3);

    // If cursor is at the beginning of the line
    if (cursor.x == 2 && currentLineText.length >= 1) {
        // Insert a line ABOVE the current line so the content flows down by one, but on the 'same' line
        textArea.insertLine(cursor.y - 3, '');
        // Render the line change
        screen.render();
        // Set the cursor back to the beginning of the line
        // Y, X notation for row:column
        program.cursorPos(cursor.y, cursor.x - 1);
        // Render the cursor change
        screen.render();
    }
    // If the cursor is at the end
    else if (cursor.x > currentLineText.length + 1) {
        // Insert a line BELOW the current line
        textArea.insertLine(cursor.y - 2, '');
        // Render the line change
        screen.render();
        // Set the cursor back to the beginning of the line
        // Y, X notation for row:column
        program.cursorPos(cursor.y, 1);
        // Render the cursor change
        screen.render();
    }
    // The enter key was pressed in between the text
    else {
        // Split the text and reflow the text that was in front of the cursor to the next line
        textArea.setLine(cursor.y - 3, currentLineText.substring(0, cursor.x - 2));
        // Set the line below to be the rest of the text
        textArea.insertLine(cursor.y - 2, currentLineText.substring(cursor.x - 2));
        // Render the line changes
        screen.render();
        // Set the cursor back to the beginning of the line
        // Y, X notation for row:column
        program.cursorPos(cursor.y, 1);
        // Render the cursor change
        screen.render();
    }
    screen.render();
}

// Export the key handlers
module.exports.mainKeyHandler = mainKeyHandler;
module.exports.rightArrowHandler = rightArrowHandler;
module.exports.leftArrowHandler = leftArrowHandler;
module.exports.upArrowHandler = upArrowHandler;
module.exports.downArrowHandler = downArrowHandler;
module.exports.backspaceHandler = backspaceHandler;
module.exports.spaceHandler = spaceHandler;
module.exports.enterHandler = enterHandler;