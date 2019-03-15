var d3 = require('d3-selection');
var getColumnFromBlocks = require('./get-column-from-blocks');
var callNextTick = require('call-next-tick');
var accessor = require('accessor')();
var Crown = require('csscrown');
var crown = Crown({
  crownClass: 'selected-unit'
});

function renderCodeColumn({ root, rootSelector, initialColumn, blocks }) {
  if (!root) {
    root = d3.select(rootSelector);
  }
  var column = getColumnFromBlocks(Object.assign({ blocks }, initialColumn));
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
    .classed('code-unit', true)
    .on('click', onClickUnit);
  var mainRows = newUnits.append('div').classed('main-row', true);
  mainRows.append('pre').classed('unit-text', true);
  mainRows.append('div').classed('unit-note', true);

  var retainedUnits = newUnits.merge(units);
  retainedUnits.attr('id', getUnitId);
  retainedUnits.classed('expandable', accessor('expand'));
  retainedUnits
    .filter(accessor('expand'))
    .on('click', onExpandClick)
    .append('section')
    .classed('expand-root', true);
  retainedUnits.select('.unit-text').text(accessor('text'));
  retainedUnits.select('.unit-note').text(accessor('note'));

  function onExpandClick(unit) {
    callNextTick(renderCodeColumn, {
      root: d3.select(this).select('.expand-root'),
      initialColumn: unit.expand,
      blocks
    });
  }
}

function getUnitId(unit) {
  return `${unit.file}-L${unit.lineNumber}`;
}

function onClickUnit() {
  crown(this);
}

module.exports = renderCodeColumn;
