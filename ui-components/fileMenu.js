// Using ES5 strict mode
'use strict';

// Node/NPM package requires
const fs = require('fs');
const blessed = require('neo-blessed');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the file menu box, where multiple commands selected from a list can be executed

// Hierarchy is:
// Box/Window
// List of entries:
// [N]ew
// [O]pen
// [S]ave
// S[a]ve as...
// [E]xit

// Each of these entries will do something eventually!

// This needs to be a class because on construction blessed tries to attach this to a parent screen
class FileMenu {

    /** Creates an instance of FileMenu. This is the dialog box that allows files to be opened
     * @param {*} parent Blessed screen parent to attach the element to
     * @memberof FileMenu
     */
    constructor(parent, nextFocusElement, statusBar) {
        this.parent = parent;
        this.nextFocusElement = nextFocusElement;
        this.statusBar = statusBar;

        // Create the fileMenuBox
        this.fileMenu = blessed.box({
            parent: this.parent,
            // Top of this element should be 1 below the top of the screen
            top: 1,
            // Left start of this element should be 1 to the left of the screen for padding/looks
            left: 1,
            // Fixed width because the box's contents will be static
            width: 15,
            // Fixed height because the box's contents will be static
            height: 7,
            style: {
                fg: 'black',
                bg: 'lightgrey',
                border: {
                    fg: 'black',
                    bg: 'lightgrey'
                }
            },
            shadow: true
        });

        this.menuList = blessed.list({
            // Borders to match how DOS Edit has borders for its menus
            border: 'line',
            padding: 'none',
            // The parent of the titlebar should be the generated fileMenu
            parent: this.fileMenu,
            width: this.fileMenu.width,
            height: this.fileMenu.height,
            // Use the default keys for the belssed fileMenu
            keys: true,
            style: {
                border: {
                    fg: 'black',
                    bg: 'lightgrey'
                },
                // Style of the currently selected list item
                selected: {
                    fg: 'lightgrey',
                    bg: 'black'
                },
                // Style of any other listItem
                item: {
                    fg: 'black',
                    bg: 'lightgrey'
                }
            }
        });

        // Set the items for the menu list
        this.menuList.setItems(['New', 'Open...', 'Save', 'Save As...', 'Exit']);

        // Append each UI subcomponent to the fileMenu box
        this.fileMenu.append(this.menuList);

        // TODO: this should change the color of the top row to indicate that the file menu is open!!
        // Handle anything that needs to happen on focus of the fileMenu
        this.fileMenu.on('focus', () => {
            parent.render();
            // Focus the first element that makes the most sense (the file select)
            this.menuList.focus();
            statusBar.setContent(`File Menu...`);
        });

        this.menuList.key(['escape'], () => {
            this.nextFocusElement.focus();
            this.fileMenu.hide();
            this.parent.render();
        });

        this.menuList.on('select', (item) => {
            // The text parse is item.content

            // TODO: This needs to make sure the file is properly saved before exiting
            if (item.content == 'Exit') return process.exit();

            // TODO: This needs to make sure the file is properly saved before making changes
            if (item.content == 'New') {
                nextFocusElement.setContent('');
                this.fileMenu.hide();
                // Reset what the textarea says
                // reset the cursor
                this.parent.render();
            }
        });
    }
}

// Export the blessed component
module.exports = FileMenu;