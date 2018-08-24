// Using ES5 strict mode
'use strict';

const fs = require('fs');


// This file contains the handlers for each key/combination that the editor supports

// TODO: Maybe split the major keys out into their own function since they're getting a bit long

// This handles all standard character keys
// TODO: fix a weird issue where text can 'ghost' to a new line somehows
// Maye have something to do with getting the current line's text?/maybe even the down arrow handler since that's where is happens most oftens
function mainKeyHandler(cursor, program, screen, textArea, ch, file) {
    // TODO: There should also be a check for if the current line is valid to write to
    // IE it isn't in the middle of a blank editor, or not, what we're trying to match is weird anyway

    // TODO: Scroll horizontally if this check doesn't occur
    // This VISUALLY keeps the cursor in left bound of the editing window
    if (cursor.x < screen.width - 1) {
        let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

        // Get the line that the cursor is sitting on minus the borders of the UI/screen
        let currentLineText = textArea.getLine(currentLineScrollOffset);

        // If there's no text to begin with (this should be what avoids weird text ghosting onto a new line)
        if (cursor.x == 2 && currentLineText.length < 1) {
            // Add the character to the beginning of the line
            textArea.setLine(currentLineScrollOffset, ch);
            // Render the text change
            screen.render();
        }
        // If cursor is at the beginning of the line (move the rest of the text forward and insert the character)
        else if (cursor.x == 2 && currentLineText.length > 1) {
            // Add the character to the beginning of the line
            textArea.setLine(currentLineScrollOffset, ch + currentLineText);
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
            textArea.setLine(currentLineScrollOffset, currentLineText + ch);
        }
        // If the cursor is somehwere in the middle (its an insert)
        else {
            textArea.setLine(currentLineScrollOffset, currentLineText.substring(0, cursor.x - 2) + ch + currentLineText.substring(cursor.x - 2));
            // Render the text change
            screen.render();
            program.cursorBackward(currentLineText.length - currentLineText.substring(0, cursor.x - 1).length + 1)
            // Render the cursor change
            screen.render();
        }
        // Always render the screen at the end of the function to be sure the changes made correctly show
        screen.render();
    } else {

        // This is where horizontal scroll code will go

        // One idea would be to VISUALLY scroll, the other would be to do smart string manipulations
        // Right now it's about figuring out which will be the most doable

        // Looking in the code for boxes/element should help, seeing if there's a way to visually 'shift' lines
        // Like how scrolling works

        // This has to 'move' ALL lines (not just the current one)
        // Maybe something like setting a scrolling flag and then getting the first character of each line and
        // 'remove' it, to show the next character for the line.

        // This might require some 'shadow line' BS that may be complicated, so hopefully I can think
        // of something less janky

        /////////
        // Another idea would to be to have a 'padding' offset like curses does, where
        // the window is larger than the actual screen and every time a key is pressed, the view is moved
        // to something like padding + offset
        /////////

        // // THIS IS N O T EFFICIENT, leads to memory leaks on larger files
        // let allLinesText = textArea.getLines();

        // let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

        // let currentLineText = allLinesText[currentLineScrollOffset];

        // // TODO: Keep in mind that the cursor position (middle/end of the line for cursor pos needs different logic)

        // textArea.setLine(currentLineScrollOffset, currentLineText.substring(1) + ch);
        // file[currentLineScrollOffset] = currentLineText + ch;

        // program.cursorPos(currentLineScrollOffset, screen.width - 2)

        screen.render();
    }
}

function rightArrowHandler(cursor, program, screen, textArea, editor) {
    let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

    // Get the line that the cursor is sitting on minus the borders of the UI/screen
    let currentLineText = textArea.getLine(currentLineScrollOffset);

    // This VISUALLY keeps the cursor in right bound of the editing window
    if (cursor.x < screen.width - 1) {
        // We need to make sure the line has any content in it at all before allowing a right cursor move
        if (cursor.x > currentLineText.length + 1) return;
        // Move the cursor forward by one from the current position
        program.cursorForward();
        // Render the cursor change
        screen.render();
    } else if (currentLineText.length > screen.width - 3) {
        // Horizontally scroll

        // Get all (visible) lines
        let linesToAdjust = getVisibleLines(textArea);

        // Move all visible lines to the right by 1
        rightShiftVisibleLines(textArea, linesToAdjust);

        editor.leftPadOffset++;
        screen.render();
        // Put the cursor where it should be (at the end)
        program.cursorPos(cursor.y, screen.width - 3);
    }
}

function leftArrowHandler(cursor, program, screen, textArea, editor) {
    // This VISUALLY keeps the cursor in left bound of the editing window
    if (cursor.x > 2) {
        // Move the cursor backward by one from the current position
        program.cursorBackward();
        // Render the cursor change
        screen.render();
    }
    // Make sure the cursor is all the way to the left before wrapping
    else if (cursor.x == 2 && editor.leftPadOffset == 0) {
        let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

        // Get the y location and then get the line one above current position
        // If there is a line above, wrap to the right of that line and render the screen

        // For some reason with the new method for getting a scroll offset this works even though it doesn't seem right
        let previouslineText = textArea.getLine(currentLineScrollOffset - 1);
        // Make sure there's text above AND within the screen bounds
        if (cursor.y > 3) {
            // TODO: also make sure that the cursor STARTS at the beginning of the current line so the cursor isn't out in the middle of nowhere
            // Move the cursor forward by the length of the above text and up by one
            if (previouslineText.length !== 0 && previouslineText.length !== 1) {
                program.cursorForward(previouslineText.length);
                program.cursorUp();
                screen.render();
            } else {
                program.cursorUp();
                screen.render();
            }
        }
    }
    else if (cursor.x == 2 && editor.leftPadOffset !== 0) {
        // Horizontal scroll!

        // Get the original contents from the editor
        let test = editor.getTextAreaShadowText();

        // Get the visible lines from the shadow content


        // Get all (visible) lines from the textArea
        let linesToAdjust = getVisibleLines(textArea);
    }
}

// TODO: fix this sometimes going out of bounds when on an empty line
function upArrowHandler(cursor, program, screen, textArea, scrollArrowUp) {

    // This VISUALLY keeps the cursor in top bound of the editing window plus the menubar height
    if (cursor.y > 3) {
        let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

        // Get the line one above current y position (relative to borders, etc.)
        let previouslineText = textArea.getLine(currentLineScrollOffset - 1);
        // Get the current line for comparison
        let currentLineText = textArea.getLine(currentLineScrollOffset);

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
        textArea.scroll(-1);
        screen.render();
        // For some reason setting the y on this to 2 scrolls more 'smoothly' than 3 (less cursor jank)
        program.cursorPos(2, cursor.x - 1);
        screen.render();
    }

    // // Flash the up arrow on the scrollbar
    // program.saveCursor('currentLineScrollOffset');
    // scrollArrowUp.style.bg = 'light-grey';
    // scrollArrowUp.style.fg = 'black';
    // screen.render();
    // setTimeout(() => {
    //     scrollArrowUp.style.bg = 'black';
    //     scrollArrowUp.style.fg = 'light-grey';
    //     screen.render();
    //     program.restoreCursor('currentLineScrollOffset');
    //     screen.render()
    // }, 50);
}

// TODO: fix this sometimes going out of bounds when on an empty line
function downArrowHandler(cursor, program, screen, textArea) {
    // This VISUALLY keeps the cursor in bottom bound of the editing window plus the statusbar height
    if (cursor.y < screen.height - 1) {
        let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

        // Get the line one below current y position (relative to borders, etc.)
        let nextLineText = textArea.getLine(currentLineScrollOffset + 1);
        // Get the current line for comparison (one below the previous line)
        let currentLineText = textArea.getLine(currentLineScrollOffset);

        // Don't allow the cursor to move beyond the next line if it's 'empty'. Empty means the same line shows up each time, returned from the textArea check
        // TODO: This likely needs a better, stronger check
        // THIS IS N O T EFFICIENT, leads to memory leaks on larger files

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
    }
    // Scroll the text down by one
    else if (cursor.y == screen.height - 1) {
        textArea.scroll(1);
        screen.render();
        // For some reason the screen - 2 is what sets the cursor to the bottom position that's needed
        program.cursorPos(screen.height - 2, cursor.x - 1);
        screen.render();
    }
}

// TODO: Make sure when reflowing up to the next line that it won't go out of bounds
function backspaceHandler(cursor, program, screen, textArea) {
    if (cursor.x <= 1) return;

    let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

    // Get the line that the cursor is sitting on minus the borders of the UI/screen
    let currentLineText = textArea.getLine(currentLineScrollOffset);

    if (currentLineText.length >= 1) {
        // If cursor is at the end of the current line
        if (cursor.x == currentLineText.length + 2) {
            textArea.setLine(currentLineScrollOffset, currentLineText.substring(0, currentLineText.length - 1));
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

            textArea.setLine(currentLineScrollOffset - 1, preceedingLineText + currentLineText);
            textArea.deleteLine(currentLineScrollOffset);
            // Reender the text change
            screen.render();
            // Move the cursor to the above line where the merge was made
            // Y, X notation for row:column
            program.cursorPos(currentLineScrollOffset + 1, cursor.x + preceedingLineText.length)
            // Render the cursor change
            screen.render();
        }
        // Else, a splice is needed rather than a removal
        else {
            // Find the cursor position relative to the text
            // Get the current cursor pos.x - 2 for finding which character to slice within the string minus the border
            let backspaceIndex = cursor.x - 2;
            textArea.setLine(currentLineScrollOffset, currentLineText.substring(0, backspaceIndex - 1) + currentLineText.substring(backspaceIndex, currentLineText.length));
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
        let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

        // Get the line that the cursor is sitting on minus the borders of the UI/screen
        let currentLineText = textArea.getLine(currentLineScrollOffset);

        // If cursor is at the beginning of the line (move the rest of the text forward and insert the character)
        if (cursor.x == 2 && currentLineText.length > 1) {
            // Add the space to the start of the line
            textArea.setLine(currentLineScrollOffset, ' ' + currentLineText);
            // Render the text change
            screen.render();
            program.cursorBackward(currentLineText.length);
            program.cursorForward();
            // Render the cursor change
            screen.render();
        }
        // If the cursor is at the end
        else if (cursor.x >= currentLineText.length + 1) {
            textArea.setLine(currentLineScrollOffset, currentLineText + ' ');
            program.cursorForward();
        }
        // If the cursor is somehwere in the middle (its an insert)
        else {
            textArea.setLine(currentLineScrollOffset, currentLineText.substring(0, cursor.x - 2) + ' ' + currentLineText.substring(cursor.x - 2));
            // Render the text change
            screen.render();
            program.cursorBackward(currentLineText.length - currentLineText.substring(0, cursor.x - 1).length + 1)
            // Render the cursor change
            screen.render();
        }
        screen.render();
    }
}

function tabHandler(cursor, program, screen, textArea) {

    // TODO: Scroll horizontally if this check doesn't occur
    // This VISUALLY keeps the cursor in right bound of the editing window
    if (cursor.x < screen.width - 1) {
        let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

        // Get the line that the cursor is sitting on minus the borders of the UI/screen
        let currentLineText = textArea.getLine(currentLineScrollOffset);

        // If cursor is at the beginning of the line (move the rest of the text forward and insert the character)
        if (cursor.x == 2 && currentLineText.length > 1) {
            // Add the space to the start of the line
            textArea.setLine(currentLineScrollOffset, '    ' + currentLineText);
            // Render the text change
            screen.render();
            program.cursorBackward(currentLineText.length);
            // program.cursorForward(4);
            // Render the cursor change
            screen.render();
        }
        // If the cursor is at the end
        else if (cursor.x >= currentLineText.length + 1) {
            textArea.setLine(currentLineScrollOffset, currentLineText + '    ');
            program.cursorForward(4);
        }
        // If the cursor is somehwere in the middle (its an insert)
        else {
            textArea.setLine(currentLineScrollOffset, currentLineText.substring(0, cursor.x - 2) + '    ' + currentLineText.substring(cursor.x - 2));
            // Render the text change
            screen.render();
            program.cursorBackward(currentLineText.length - currentLineText.substring(0, cursor.x - 1).length + 1)
            // Render the cursor change
            screen.render();
        }
        screen.render();
    }
    // Else, a vertical scroll should ouccur
}

// TODO: Fix this going out of lower bounds
function enterHandler(cursor, program, screen, textArea) {

    let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

    // Get the line that the cursor is sitting on minus the borders of the UI/screen
    let currentLineText = textArea.getLine(currentLineScrollOffset);

    // If cursor is at the beginning of the line
    if (cursor.x == 2 && currentLineText.length >= 1) {
        // Insert a line ABOVE the current line so the content flows down by one, but on the 'same' line
        textArea.insertLine(currentLineScrollOffset, '');
        // Render the line change
        screen.render();
        // Set the cursor back to the beginning of the line if not at the bottom of the textArea
        // Y, X notation for row:column
        if (cursor.y < screen.height - 1) program.cursorPos(cursor.y, 1);
        else {
            // Scroll the textArea by one and pull the cursor back to the current line since the entire textArea scrolled
            textArea.scroll(1);
            program.cursorPos(cursor.y - 1, 1);
        }
        // Render the cursor change
        screen.render();
    }
    // If the cursor is at the end
    else if (cursor.x > currentLineText.length + 1) {
        // Insert a line BELOW the current line
        textArea.insertLine(currentLineScrollOffset + 1, '');
        // Render the line change
        screen.render();
        // Set the cursor back to the beginning of the line if not at the bottom of the textArea
        // Y, X notation for row:column
        if (cursor.y < screen.height - 1) program.cursorPos(cursor.y, 1);
        else {
            // Scroll the textArea by one and pull the cursor back to the current line since the entire textArea scrolled
            textArea.scroll(1);
            program.cursorPos(cursor.y - 1, 1);
        }
        // Render the cursor change
        screen.render();
    }
    // The enter key was pressed in between the text
    else {
        // Split the text and reflow the text that was in front of the cursor to the next line
        textArea.setLine(currentLineScrollOffset, currentLineText.substring(0, cursor.x - 2));
        // Set the line below to be the rest of the text
        textArea.insertLine(currentLineScrollOffset + 1, currentLineText.substring(cursor.x - 2));
        // Render the line changes
        screen.render();
        // Set the cursor back to the beginning of the line if not at the bottom of the textArea
        // Y, X notation for row:column
        if (cursor.y < screen.height - 1) program.cursorPos(cursor.y, 1);
        else {
            // Scroll the textArea by one and pull the cursor back to the current line since the entire textArea scrolled
            textArea.scroll(1);
            program.cursorPos(cursor.y - 1, 1);
        }
        // Render the cursor change
        screen.render();
    }
    screen.render();
}

function homeHandler(cursor, program, screen, textArea) {

    // This can be done VERY easily, without having to do any smart checks
    let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

    // Get the line that the cursor is sitting on minus the borders of the UI/screen
    let currentLineText = textArea.getLine(currentLineScrollOffset);

    if (cursor.x !== 2) {
        // Bring the cursor to the beginning of the line
        program.cursorBackward(currentLineText.length + 1);
        program.cursorForward(1);
        // Render the cursor change
        screen.render();
    }
    screen.render();
}

function endHandler(cursor, program, screen, textArea) {
    let currentLineScrollOffset = calculateScrollingOffset(cursor, textArea);

    // Get the line that the cursor is sitting on minus the borders of the UI/screen
    let currentLineText = textArea.getLine(currentLineScrollOffset);

    // If the cursor is at the end of the line, do nothing
    if (cursor.x > currentLineText.length + 1) return;

    // Else
    // Get the current cursor position relative to the length of the text
    program.cursorForward(currentLineText.length - currentLineText.substring(0, cursor.x - 2).length);
}

// Basic function to get the scrolling cursor offset (used frequently for each key)
function calculateScrollingOffset(cursor, textArea) {
    // Get the cursor position relative to the textArea (minus the menubar and the texarea's borders)
    let cursorYRelative = cursor.y - 3;
    // Position of the cursor relative to the BOTTOM of the textArea
    let cursorYFromRelativeBottom = textArea.height - cursorYRelative;

    // getscroll() is the LAST line of the textarea
    // For some reason we need to remove the cursor.y relative offset (add 3)
    let currentLineScrollOffset = textArea.getScroll() - cursorYFromRelativeBottom + 3;

    if (textArea.getScroll() == 0) currentLineScrollOffset = cursorYRelative;

    return currentLineScrollOffset;
}

// Basic function to get the visible lines in the textArea (what can actually be seen)
function getVisibleLines(textArea) {
    let visibleLines = [];

    let relativeBottom = getRelativeBottom(textArea);
    let relativeTop = getRelativeTop(textArea);

    for (let i = relativeTop; i <= relativeBottom; i++) {
        visibleLines.push(textArea.getLine(i))
    }
    return visibleLines;
}

function rightShiftVisibleLines(textArea, linesToAdjust) {
    // Get the relative top and bottom for using in the forEach loop to adjusted each visible line
    let relativeBottom = textArea.getScroll();
    let relativeTop = relativeBottom - textArea.height;

    if (relativeBottom == 0) {
        relativeBottom = textArea.height;
        relativeTop = 0;
    }

    // Move all visible lines to the right by 1
    linesToAdjust.forEach((line, index) => {
        textArea.setLine(index + relativeTop, line.substring(1));
    });
}

function getRelativeTop(textArea) {
    // Get the relative top and bottom for using in the forEach loop to adjusted each visible line
    let relativeBottom = textArea.getScroll();
    let relativeTop = relativeBottom - textArea.height;

    if (relativeBottom == 0) {
        relativeTop = 0;
    }

    return relativeTop;
}

function getRelativeBottom(textArea) {
    let relativeBottom = textArea.getScroll();
    if (relativeBottom == 0) {
        relativeBottom = textArea.height;
    }
    return relativeBottom;
}

// Export the key handlers
module.exports.mainKeyHandler = mainKeyHandler;
module.exports.rightArrowHandler = rightArrowHandler;
module.exports.leftArrowHandler = leftArrowHandler;
module.exports.upArrowHandler = upArrowHandler;
module.exports.downArrowHandler = downArrowHandler;
module.exports.backspaceHandler = backspaceHandler;
module.exports.spaceHandler = spaceHandler;
module.exports.tabHandler = tabHandler;
module.exports.enterHandler = enterHandler;
module.exports.endHandler = endHandler;
module.exports.homeHandler = homeHandler;