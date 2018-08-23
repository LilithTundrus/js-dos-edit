// Using ES5 strict mode
'use strict';

// Node/NPM package requires
const fs = require('fs');
const blessed = require('neo-blessed');

// Require the functions to handle each keypress
const keyHandlers = require('../lib/keyHandlers');
// Require the set of keys to listen for on keypress event for keys to ignore that custom handlers listen for
const customKeys = require('../lib/handledKeysSet');

// This file contains one of the blessed components for constructing the UI in an effort to
// keep this project modular

// Create the textArea textbox, where the actual text being edited will be displayed

// This needs to be a class because on construction blessed tries to attach this to a parent parent

// TODO: At some point, the scrollbar(s) should always show no matter the content length
class TextArea {

    /** Creates an instance of TextArea. This is the main text entry box
     * @param {*} parent Blessed parent parent to attach the element to
     * @param {*} fileLabel The filename to set the textAreas's label to
     * @memberof TextArea
     */
    constructor(parent, fileLabel, statusBar, editor) {
        this.parent = parent;
        this.statusBar = statusBar;
        this.editor = editor;

        // Create the textArea UI element as a blessed box element type
        this.textArea = blessed.box({
            parent: this.parent,
            // The top of this element should be the parent width plus 1
            top: 1,
            bold: true,
            shrink: false,
            // Mark the element as keyable to the parent passes down any keypresses to the box
            keyable: true,
            label: fileLabel,
            // Left-align the text
            align: 'left',
            // Keep the width of this element to 100% of the screen
            width: '100%+1',
            // Height should be the entire screen minus 1 because of the statusBar (not doing this hide part of the text entry window)
            height: '100%-1',
            // Don't capture SGR blessed escape codes, that could cause issues
            tags: false,
            // No text wrapping (this isn't documented in blessed?)
            wrap: false,
            // This style matches the DOS edit theme
            style: {
                fg: 'bold',
                bg: 'blue',
                border: {
                    fg: 'light-grey',
                },
                label: {
                    fg: 'black',
                    bg: 'light-grey'
                }
            },
            border: {
                type: 'line'
            },
            scrollable: true,
            // Scrollbar styles, using extended characters here
            scrollbar: {
                ch: '█',
                track: {
                    bg: 'black',
                    ch: '░'
                },
            },
            // Limit files to 16,000 lines (ambitious at best)
            baseLimit: 16000,
            // This fixes any issues with the box not scrolling on scroll method calls
            alwaysScroll: true,
        });

        // Key/Event handlers

        this.textArea.on('focus', () => {
            // TODO: When a file is opened, start at the top of the first line, but at the end of that line
            // Get the top and bottom + left/right of the parent to reset the cursor
            // Pull the cursor all the way to the top left no matter where it is
            this.parent.program.getCursor((err, data) => {
                this.parent.program.cursorUp(this.parent.height);
                this.parent.program.cursorBackward(this.parent.width);
                // Put the cursor at line 1 column one of the editing window
                this.parent.program.cursorForward(1);
                this.parent.program.cursorDown(2);
                this.parent.render();
            });

            // Reset the content of the statusBar (the numbers are placeholders)
            // TODO: make the numbers + filePath no longer be placeholders
            this.statusBar.setContent(`Unsaved Document\t\t\t< Ctrl+W=Quit  F1=Help >\t\t\t Line 1 | Col 1`);
            this.parent.render();
            // // Destroy the introBox completely (it's not needed more than once)
            // introBox = null;
        });

        this.textArea.key('left', () => {
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                // Use the custom left keyHandler, passing the needed objects for blessed operations
                return keyHandlers.leftArrowHandler(data, this.parent.program, this.parent, this.textArea);
            });
        });

        this.textArea.key('right', () => {
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                // Use the custom right keyHandler, passing the needed objects for blessed operations
                return keyHandlers.rightArrowHandler(data, this.parent.program, this.parent, this.textArea, this.editor);
            });
        });

        this.textArea.key('up', () => {
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                // Use the custom up keyHandler, passing the needed objects for blessed operations
                return keyHandlers.upArrowHandler(data, this.parent.program, this.parent, this.textArea, null);
            });
        });

        this.textArea.key('down', () => {
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                // Use the custom down keyHandler, passing the needed objects for blessed operations
                return keyHandlers.downArrowHandler(data, this.parent.program, this.parent, this.textArea);
            });
        });

        this.textArea.key('enter', () => {
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                return keyHandlers.enterHandler(data, this.parent.program, this.parent, this.textArea);
            });
        });

        this.textArea.key('backspace', () => {
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                // Use the custom backspace keyHandler, passing the needed objects for blessed operations
                return keyHandlers.backspaceHandler(data, this.parent.program, this.parent, this.textArea);
            });
        });

        // TODO: have this make sure it won't breach any bounds
        this.textArea.key('space', () => {
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                // Use the custom space keyHandler, passing the needed objects for blessed operations
                return keyHandlers.spaceHandler(data, this.parent.program, this.parent, this.textArea);
            });
        });

        // TODO: have this make sure it won't breach any bounds
        this.textArea.key('tab', () => {
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                // Use the custom space keyHandler, passing the needed objects for blessed operations
                return keyHandlers.tabHandler(data, this.parent.program, this.parent, this.textArea);
            });
        });

        // This catches all keypresses
        this.textArea.on('keypress', (ch, key) => {
            // Return, these are keys we can handle elsewhere (undefined means it isn't a display character)
            if (ch == undefined) return;
            // If the key is already handled elsewhere, return
            else if (customKeys.has(key.name)) return;
            // This shouldn't be needed, but the \r code sometimes gets into here
            if (ch === '\r') return;

            // Determine where to insert the character that was entered based on the cursor position
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                return keyHandlers.mainKeyHandler(data, this.parent.program, this.parent, this.textArea, ch, null);
            });
            this.parent.render();
        });

        // Home/End keys used to get to the beginning/end of a line
        // TODO: These need to handle horizontal scrolling
        this.textArea.key('home', () => {
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                // Use the custom home keyHandler, passing the needed objects for blessed operations
                return keyHandlers.homeHandler(data, this.parent.program, this.parent, this.textArea);
            });
        });

        this.textArea.key('end', () => {
            // This callback returns an err and data object, the data object has the x/y position of the cursor
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                // Use the custom end keyHandler, passing the needed objects for blessed operations
                return keyHandlers.endHandler(data, this.parent.program, this.parent, this.textArea);
            });
        });

        // On escape, the cursor can do some weird things, so that gets prevented here (hopefully)
        this.textArea.key('escape', () => {
            this.parent.program.getCursor((err, data) => {
                if (err) return;
                this.parent.program.resetCursor();
                this.parent.program.cursorPos(data.y - 1, data.x - 1);
            });
        });

        // Quit on Control-W
        // TODO: This should be aware of whether or not the editor has a file that isn't saved/etc.
        this.textArea.key(['C-w'], () => {
            return process.exit(0);
        });

        // Test file writing function
        // TODO: This should be aware of whether or not the editor has a file already/etc.
        this.textArea.key(['C-s'], () => {
            // TODO: this needs to be doing a lot more eventually
            // Remove the cursor from the text that for SOME REASON shows up
            fs.writeFileSync('test', this.textArea.content.replace('', ''));
        });

        // Quit on F4
        // TODO: This should be aware of whether or not the editor has a file that isn't saved/etc.
        this.textArea.key(['f4'], () => {
            return process.exit();
        });

    }
}

// Export the blessed component
module.exports = TextArea;