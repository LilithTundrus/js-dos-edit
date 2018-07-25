'use strict';
const blessed = require('neo-blessed');

// This module represents an introduction window for the editor, consisting
// of multiple elements

// Hierarchy:
// Box centered in the screen with centered intro text with a border + shadow
// Enter/OK button

class IntroBox {
    /** Creates an instance of IntroBox. The parent should always bes the blessed screen object
     * @param {*} parent
     * @param {*} nextFocusElement
     * @memberof IntroBox
     */
    constructor(parent, nextFocusElement, statusBarElement) {
        this.parent = parent;
        this.nextFocusElement = nextFocusElement;
        // Create the introBox element and return it using the parent
        this.introBox = blessed.box({
            parent: this.parent,
            border: 'line',
            top: 'center',
            left: 'center',
            width: '50%',
            height: 9,
            align: 'center',
            valign: 'middle',
            style: {
                fg: 'black',
                bg: 'light-grey',
                border: {
                    // This matches the DOS edit theme
                    fg: 'black',
                    bg: 'light-grey'
                },
            },
            shadow: true,
            content: 'Welcome to JS DOS Edit\n\nPlease note that this is still in early development!',
        });

        // TODO: have this set the status bar up to say Enter=OK

        // Append a button to the box
        let button = blessed.button({
            parent: this.introBox,
            // Using extended characters here
            content: `► OK ◄`,
            shrink: true,
            left: 'center',
            style: {
                fg: 'black',
                bg: '#33F0FF',
            },
            shadow: true,
            height: 1,
            // Try to center the button in the most elegant way possible
            top: Math.round(this.introBox.height / 2),
        });

        // Append and then focus the button
        this.introBox.append(button);
        button.focus();

        // On enter key, hide and destroy this box as it's no longer needed and focus the next element
        button.key(['enter'], () => {
            this.introBox.hide();
            this.introBox.destroy();
            nextFocusElement.focus();
            parent.render();
        });
    }
}

module.exports = IntroBox;