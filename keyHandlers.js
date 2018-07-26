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


module.exports.rightArrowHandler = rightArrowHandler;
module.exports.leftArrowHandler = leftArrowHandler;