// Using ES5 strict mode
'use strict';

// Node/NPM package requires
const fs = require('fs');
const chardet = require('chardet');

function checkIfFileMatchesContents(filePath, newLineSeparatedContent) {
    let encodingType = chardet.detectFileSync(filePath);

    return encodingType;
}


module.exports = checkIfFileMatchesContents;