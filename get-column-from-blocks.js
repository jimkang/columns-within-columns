function getColumnFromBlocks({ file, lines, blocks }) {
  var blockStartIndex = -1;
  var blockEndIndex = -1;

  for (let j = 0; j < blocks.length && blockEndIndex === -1; ++j) {
    let annotatedLines = blocks[j].annotatedLines;
    for (let i = 0; i < annotatedLines.length; ++i) {
      let annotation = annotatedLines[i];
      if (annotation.file === file) {
        if (blockStartIndex === -1) {
          if (annotation.lineNumber === lines[0]) {
            blockStartIndex = j;
          }
        }
        if (annotation.lineNumber === lines[1]) {
          blockEndIndex = j + 1;
          break;
        }
      }
    }
  }
  if (blockEndIndex > blockStartIndex) {
    return blocks.slice(blockStartIndex, blockEndIndex);
  } else {
    return [];
  }
}

module.exports = getColumnFromBlocks;
