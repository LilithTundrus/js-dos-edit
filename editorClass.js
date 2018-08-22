// Using ES5 strict mode
'use strict';

// Node/NPM package requires
const fs = require('fs');
const blessed = require('neo-blessed');

// Require the class created for the introduction box blessed component that appears first on start
const IntroBox = require('./ui-components/intro-box');
// Require the functions to handle each keypress
const keyHandlers = require('./lib/keyHandlers');
// Require the set of keys to listen for on keypress event for keys to ignore that custom handlers listen for
const customKeys = require('./lib/handledKeysSet');
// Require the custom modular blessed components
const MainWindow = require('./ui-components/mainWindow');
const TextArea = require('./ui-components/textArea');
const MenuBar = require('./ui-components/menuBar');
const StatusBar = require('./ui-components/statusBar');
const OpenDialog = require('./ui-components/openDialog');
const ScrollArrowUp = require('./ui-components/scrollArrowUp');
const ScrollArrowDown = require('./ui-components/scrollArrowDown');
const FileMenu = require('./ui-components/fileMenu');

// This is the main editor class that puts all of the pieces together

class Editor {
    constructor(program, screen, currentFilePath) {
        // Initialize everything that's needed to get the editor working
        this.program = program;
        this.screen = screen;
        this.currentFilePath = currentFilePath;
        this.editingMode = '';

        // Create instances of the UI elements, passing the screen as the parent
        this.textArea = new TextArea(this.screen, this.currentFilePath).textArea;
        this.mainWindow = new MainWindow(this.screen).mainWindow;
        this.menuBar = new MenuBar(this.screen).menuBar;
        this.statusBar = new StatusBar(this.screen).statusBar;
        this.introBox = new IntroBox(this.screen, this.textArea, this.statusBar).introBox;
        this.openDialog = new OpenDialog(this.screen, this.textArea, this.statusBar).openDialog;
        this.scrollArrowUp = new ScrollArrowUp(this.screen).scrollArrowUp;
        this.scrollArrowDown = new ScrollArrowDown(this.screen).scrollArrowDown;
        this.fileMenu = new FileMenu(this.screen, this.textArea, this.statusBar, this.menuBar).fileMenu;

        // Quit on Control-W
        // TODO: This should be aware of whether or not the editor has a file that isn't saved/etc.
        this.textArea.key(['C-w'], () => {
            return process.exit(0);
        });
    }

    start(fileName, filePath, windowTitle) {
        // This function trusts its input 
        if (this.currentFilePath !== 'Untitled') {
            this.editingMode == 'existing';

            let contents = fs.readFileSync(filePath, 'UTF-8');
            this.currentFilePath = filePath;
            this.textArea.setContent(contents, false, true);
        }
        // Else, just launch a blank editor and set the edit mode to not have a file saved yet

        // Set the title of the terminal window (if any) -- this will eventually take cli arguments for reading a file to be edited
        this.screen.title = `EDIT - ${filePath}`;
        this.textArea.setLabel(`${filePath}`);

        // Append the needed UI elements to the screen (in visual order)
        this.screen.append(this.mainWindow);
        this.screen.append(this.menuBar);
        this.screen.append(this.textArea);
        this.screen.append(this.statusBar);
        // Make sure the intro box is shown in the front
        this.screen.append(this.introBox);
        this.screen.append(this.openDialog);
        this.screen.append(this.fileMenu);

        // Scrolling arrows, these don't do much just yet except appear on the screen for the scrollbar
        this.screen.append(this.scrollArrowUp);
        this.screen.append(this.scrollArrowDown);

        // Hide any dialogs/menus just to be sure
        this.openDialog.hide();
        this.fileMenu.hide();

        // Reset the cursor after appending all of the UI elements
        this.program.resetCursor();
    }
}

module.exports = Editor;