var d3 = require('d3-selection');
var accessor = require('accessor')();

function renderCodeColumn({ rootSelector, initialColumn, lineAnnotations }) {
  var root = d3.select(rootSelector);
  var column = getColumn(Object.assign({ lineAnnotations }, initialColumn));
  var units = root.selectAll('.code-unit').data(column);

  units.exit().remove();

  var newUnits = units
    .enter()
    .append('div')
    .classed('code-unit', true);
  newUnits.append('pre').classed('unit-text', true);
  newUnits.append('div').classed('unit-note', true);

  var retainedUnits = newUnits.merge(units);
  retainedUnits.select('.unit-text').text(accessor('text'));
  retainedUnits.select('.unit-note').text(accessor('note'));
}

function getColumn({ file, lines, lineAnnotations }) {
  var startIndex = -1;
  var endIndex = -1;
  for (var i = 0; i < lineAnnotations.length; ++i) {
    let annotation = lineAnnotations[i];
    if (annotation.file === file) {
      if (startIndex === -1) {
        if (annotation.lineNumber === lines[0]) {
          startIndex = i;
        }
      }
      if (annotation.lineNumber === lines[1]) {
        endIndex = i + 1;
        break;
      }
    }
  }
  if (endIndex > startIndex) {
    return lineAnnotations.slice(startIndex, endIndex);
  } else {
    return [];
  }
}

module.exports = renderCodeColumn;
