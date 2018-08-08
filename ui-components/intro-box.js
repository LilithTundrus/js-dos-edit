// Using ES5 strict mode
'use strict';

const blessed = require('neo-blessed');

// This module represents an introduction window for the editor, consisting
// of multiple elements, the hierarchy is:
// Box centered in the screen with centered intro text with a border + shadow
// Enter/OK button

class IntroBox {
    /** Creates an instance of IntroBox. The parent should always bes the blessed screen object
     * @param {*} parent Blessed screen parent to attach the element to
     * @param {*} nextFocusElement Next blessed element to focus after the box is cleared
     * @param {*} statusBar StatusBar to change the text of when the intro box is focused
     * @memberof IntroBox
    */
    constructor(parent, nextFocusElement, statusBar) {
        this.parent = parent;
        this.nextFocusElement = nextFocusElement;

        // Create the introBox element and return it using the parent
        this.introBox = blessed.box({
            parent: this.parent,
            border: 'line',
            // Top of the box is the cetner of the screen
            top: 'center',
            // Center the box to the left and right of the screen
            left: 'center',
            right: 'center',
            // Width of the box should be 50% of the screen
            width: '50%',
            // Height of 9 since this doesn't need to be any taller
            height: 9,
            // Center align the box's text
            align: 'center',
            // Vertically center the text
            valign: 'middle',
            // This matches the DOS edit theme
            style: {
                fg: 'black',
                bg: 'light-grey',
                border: {
                    fg: 'black',
                    bg: 'light-grey',
                },
            },
            // Draw a black shadow around the box
            shadow: true,
            content: 'Welcome to JS DOS Edit\n\nPlease note that this is still in early development!',
        });

        // Create a button to append to the message box
        let button = blessed.button({
            // The parent of the button should be the generated introBox
            parent: this.introBox,
            // Using extended characters here
            content: `► OK ◄`,
            // Allow the button to shrink when needed
            shrink: true,
            // Center the button
            left: 'center',
            style: {
                fg: 'black',
                // Cyan
                bg: '#33F0FF',
            },
            // Button should only be a height of 1
            height: 1,
            // Center the button in the most elegant way possible
            top: Math.round(this.introBox.height / 2),
        });

        // Append and then focus the button
        this.introBox.append(button);
        button.focus();
        // Set the status bar to what the user can do
        statusBar.setContent(`Enter=OK`);

        // On enter key, hide and destroy this box as it's no longer needed and focus the next element
        button.key(['enter'], () => {
            this.introBox.hide();
            this.introBox.destroy();
            nextFocusElement.focus();
        });
    }
}

// Export the blessed component(s)
module.exports = IntroBox;