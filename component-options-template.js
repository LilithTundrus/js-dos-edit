// Using ES5 strict mode
'use strict';

// Default order of blessed component options
let options = {
    // Parent option for the component
    parent,

    // Component relative position options
    left,
    right,
    top,
    bottom,

    // Component size options
    width,
    height,

    // Key related options
    keys,
    keyable,

    // Content control options
    tags,
    shrink,
    wrap,

    // Alignment options
    align,
    valign,

    // Scrolling options
    scrollable,
    alwaysScroll,
    scrollbar: {
        ch,
        track: {
            bg,
            ch
        },
    },
    baseLimit,

    // Border options
    border: {
        type
    },

    // Styling options
    style: {
        bg,
        fg,
        border: {
            bg,
            fg
        },
        label: {
            bg,
            fg
        }
    },

    // Shadow option
    shadow,

    // Content/label options
    label,
    content,

};