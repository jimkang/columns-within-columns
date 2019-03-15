var d3 = require('d3-selection');
var getColumnFromBlocks = require('./get-column-from-blocks');
var callNextTick = require('call-next-tick');
var accessor = require('accessor')();
var Crown = require('csscrown');
var crown = Crown({
  crownClass: 'selected-unit'
});

var tabsRegex = /\t/g;
var ltRegex = /</g;
var gtRegex = />/g;

const tabInSpaces = '&nbsp;&nbsp;&nbsp;&nbsp;';
const maxGetClosestTries = 5;

function renderCodeColumn({
  root,
  rootSelector,
  initialColumn,
  blocks,
  selectFirstUnit
}) {
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
  mainRows.append('code').classed('unit-text', true);
  mainRows.append('div').classed('unit-note', true);
  mainRows
    .append('button')
    .classed('next-button', true)
    .text('Next')
    .on('click', onClickNext);
  mainRows
    .append('button')
    .classed('expand-button', true)
    .text('↕')
    .on('click', onClickExpand);

  var retainedUnits = newUnits.merge(units);
  retainedUnits.attr('id', getUnitId);
  retainedUnits.classed('expandable', accessor('expand'));
  retainedUnits
    .filter(accessor('expand'))
    .append('section')
    .classed('expand-root', true);
  retainedUnits.select('.unit-text').html(convertUnitText);
  retainedUnits.select('.unit-note').text(accessor('note'));

  if (selectFirstUnit) {
    crown(retainedUnits.node());
  }

  // Expects to be called with `this` set to a child of
  // a .code-unit element.
  function onClickExpand(unit) {
    d3.event.stopPropagation();
    let codeUnitEl = findParentWithClass(this, 'code-unit');
    if (codeUnitEl) {
      var root = d3.select(codeUnitEl).select('.expand-root');
      // Expand if this is not already expanded; collapse otherwise.
      if (root.select('.code-unit').empty()) {
        callNextTick(renderCodeColumn, {
          root,
          initialColumn: unit.expand,
          blocks,
          selectFirstUnit: true
        });
      } else {
        root.selectAll('*').remove();
      }
    } else {
      console.error(
        new Error('onClickExpand could not find parent code-unit.')
      );
    }
  }

  function onClickNext(unit) {
    d3.event.stopPropagation();
    if (unit.expand) {
      let nextButtonEl = this;
      onClickExpand.bind(nextButtonEl)(unit);
    } else if (unit.next) {
      let nextUnitEl = getClosestUnitElementAfter(unit.next);
      if (nextUnitEl) {
        crown(nextUnitEl);
      }
    }
  }
}

function getClosestUnitElementAfter({ file, line }) {
  for (var i = 0; i < maxGetClosestTries; ++i) {
    let unitId = getUnitId({ file, lineNumber: line + i });
    var unitEl = document.getElementById(unitId);
    if (unitEl) {
      return unitEl;
    }
  }
}

function getUnitId(unit) {
  var lineNumber = unit.lineNumber;
  if (isNaN(lineNumber)) {
    lineNumber = unit.line;
  }
  if (isNaN(lineNumber)) {
    lineNumber = 0;
  }
  return `${unit.file}-L${lineNumber}`;
}

function onClickUnit() {
  d3.event.stopPropagation();
  crown(this);
}

function convertUnitText(unit) {
  var text = unit.text.replace(tabsRegex, tabInSpaces);
  text = text.replace(ltRegex, '&lt;');
  return text.replace(gtRegex, '&gt;');
}

function findParentWithClass(el, className) {
  var target = el;
  do {
    target = target.parentElement;
  } while (target && !target.classList.contains(className));
  return target;
}

module.exports = renderCodeColumn;
