(This doc is just for laying out my ideas for the project)


# Authors: Lilith Tundrus

# What this project is:

A DOS Edit-like program that lets you edit text in a 'graphical' way while still using the CLI

# What this project is NOT:

It's not intended to be used seriously but is merely practice for me on a semi-complex project
if it ends up being usable yay!

# Some base alpha features:
- Edit text (logically!)
- Open Files
- Get the current directory for saving files
- Write (text based) files to disk
- Support file sizes above 16k
- Line + Column count
- Menu system
- Undo/Redo system
- Cut/Copy/Paste support
- Title that matches the current document
- Keyboard shortcuts
- About dialog
- Open dialog
- Save dialog
- Selectable text (visually select text to edit/copy/cut)
- Command line args for opening files

# Nice-to-haves:

- Syntax highlighting
- Autocompletion
- Find and replace
- Some sort of preferences system
- Tabbed workspace


# Layout/Ramblings:

The menuBar needs to look like this (the brackets meaning the highlighted character for alt + letter): 
[F]ile [E]dit [S}earch [V]iew [O]ptions [H]elp

The menuBar should go FIRST, even before the main editing box

After the menuBar will be main window
Inside that window will be the text entry box
This box will have the filename as the name of the title
The cursor will remain bound to this box

The actual text entered is stored in lines, handled one at a time so the amount
of text being worked with at once stays low. 

The scrollbar up/down arrow ASCII characters may just have to be static and not actually
part of a real scrollbar (I need to look at all of the code for this project)

At the bottom there should be a character counter and a word counter as well as line/column count:
Current Document status (IE did it save?)      F1=Help Ctrl-C=quit          Col: 1 Line: 1


For the text entry area the cursor needs to be kept in bounds as well as what character that
the cursor is currently over. This will be likely the biggest challenge, the actual text entry.

The text entry area will be the most logically complex since things like not allowing the END
key to go to the end of the text area but to the end of the text ON that line

Most of the basic logic is there right now but it's hunting the weird cases and actually dealing with them now