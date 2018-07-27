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
        // TODO: Move the cursor to the end of the next line by default
        // Get the y location and then get the line one above current position
        // If there is a line above, wrap to the right of that line and render the screen
        // If there is a line above, wrap to the right of that line and render the screen
        let previouslineText = textArea.getLine(cursor.y - 4);
        // get the current line for comparison
        let currentLineText = textArea.getLine(cursor.y - 3);

        // Make sure there's text above AND within the screen bounds

        // If the previous line is longer than the current
        if (previouslineText.length > cursor.x - 1) {
            // Find the difference between the current cursor.x and the length of the line above
            program.cursorForward(previouslineText.length - cursor.x + 2);
            program.cursorUp();
            // If both lines are equal
        } else if (previouslineText.length + 2 == cursor.x && currentLineText.length + 2 == cursor.x) {
            program.cursorUp();
        } else {
            program.cursorBackward(cursor.x - previouslineText.length - 2)
            program.cursorUp();
        }
    }
}

module.exports.rightArrowHandler = rightArrowHandler;
module.exports.leftArrowHandler = leftArrowHandler;
module.exports.upArrowHandler = upArrowHandler;