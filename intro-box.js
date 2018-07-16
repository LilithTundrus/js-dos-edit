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
    constructor(parent, nextFocusElement) {
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
                    // this matches the DOS edit theme
                    fg: 'black',
                    bg: 'light-grey'
                },
                // label: {
                //     bg: 'light-grey',
                //     fg: 'black',
                //     transparent: true
                // }
            },
            shadow: true,
            content: 'Welcome to JS DOS Edit\n\nNote that this is still in early development',
        });

        // this.introBox.setLabelCenter({ text: 'TEST'})

        // Append a button to the box
        let button = blessed.button({
            parent: this.introBox,
            content: `► OK ◄`,
            shrink: true,
            left: 'center',
            style: {
                fg: 'black',
                bg: '#33F0FF',
            },
            shadow: true,
            height: 1,
            top: Math.round(this.introBox.height / 2),
        });
        this.introBox.append(button);
        button.focus();

        button.key(['enter'], () => {
            this.introBox.destroy();
            nextFocusElement.focus();
            // Reset the cursor to the nextFocusElement starting point
            // parent.cursorReset();
            parent.render();
        });
    }

    remove() {
        // Hide the box using blessed methods
    }
}

module.exports = IntroBox;