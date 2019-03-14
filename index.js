var d3 = require('d3-selection');
var accessor = require('accessor')();

function renderCodeColumn({ rootSelector, initialColumn, blocks }) {
  var root = d3.select(rootSelector);
  var column = getColumn(Object.assign({ blocks }, initialColumn));
  var codeBlocks = root.selectAll('.code-block').data(column);
  codeBlocks.exit().remove();

  var newCodeBlocks = codeBlocks
    .enter()
    .append('section')
    .classed('code-block', true);
  newCodeBlocks.append('div').classed('unit-root', true);
  newCodeBlocks.append('div').classed('block-note', true);

  var retainedCodeBlocks = newCodeBlocks.merge(codeBlocks);
  retainedCodeBlocks.select('.block-note').text(accessor('note'));
  var unitRoots = retainedCodeBlocks.select('.unit-root');

  var units = unitRoots
    .selectAll('.code-unit')
    .data(accessor('annotatedLines'));

  units.exit().remove();

  var newUnits = units
    .enter()
    .append('div')
    .classed('code-unit', true);
  newUnits.append('pre').classed('unit-text', true);
  newUnits.append('div').classed('unit-note', true);

  var retainedUnits = newUnits.merge(units);
  retainedUnits.attr('id', getUnitId);
  retainedUnits.select('.unit-text').text(accessor('text'));
  retainedUnits.select('.unit-note').text(accessor('note'));
}

function getColumn({ file, lines, blocks }) {
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

function getUnitId(unit) {
  return `${unit.file}-L${unit.lineNumber}`;
}

module.exports = renderCodeColumn;
