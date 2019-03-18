var d3 = require('d3-selection');
var ease = require('d3-ease');
var timer = require('d3-timer').timer;
var getColumnFromBlocks = require('./get-column-from-blocks');
var callNextTick = require('call-next-tick');
var Crown = require('csscrown');
var createSimpleScroll = require('simplescroll');
var StrokeRouter = require('strokerouter');

var accessor = require('accessor')();
var crownUnit = Crown({
  crownClass: 'selected-unit'
});
var crownBlock = Crown({
  crownClass: 'selected-block'
});
var crownOutermostParentOfExpandRoot = Crown({
  crownClass: 'outermost-parent-of-expand-root'
});

var simpleScroll = createSimpleScroll({
  d3,
  easingFn: ease.easeCubicInOut,
  timer,
  root: document.body
});

var docStrokeRouter = StrokeRouter(document);

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
  docStrokeRouter.routeKeyUp('n', null, onNextKeyUp);

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
    .html('<u>N</u>ext')
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
    selectUnit(retainedUnits.node());
  }

  // Expects to be called with `this` set to a child of
  // a .code-unit element.
  function onClickExpand(unit) {
    d3.event.stopPropagation();
    let codeUnitEl = findParentWithClass(this, 'code-unit');
    if (codeUnitEl) {
      expandUnitToColumn(unit, codeUnitEl);
    }
  }

  function expandUnitToColumn(unit, codeUnitEl) {
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
  }

  function onClickNext(unit) {
    d3.event.stopPropagation();
    showNext(unit, this);
  }

  function onNextKeyUp() {
    var selectedUnit = d3.select('.selected-unit');
    if (!selectedUnit.empty()) {
      showNext(selectedUnit.datum(), selectedUnit.node());
    }
  }

  function showNext(unit, nextButtonEl) {
    if (unit.expand) {
      let codeUnitEl = findParentWithClass(nextButtonEl, 'code-unit');
      if (codeUnitEl) {
        expandUnitToColumn(unit, codeUnitEl);
      }
    } else if (unit.next) {
      let nextUnitEl = getClosestUnitElementAfter(unit.next);
      if (nextUnitEl) {
        selectUnit(nextUnitEl);
        if (!simpleScroll.isStillScrolling()) {
          simpleScroll.scrollToElement(nextUnitEl, 400, 20);
        }
        // else: Nothing needs to be done. It'll scroll the
        // next time the user goes to the next line.
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
  selectUnit(this);
}

function selectUnit(el) {
  crownUnit(el);

  var enclosingBlock = findParentWithClass(el, 'code-block');
  if (enclosingBlock) {
    crownBlock(enclosingBlock);

    var expandRoot = findParentWithClass(el, 'expand-root');
    if (expandRoot) {
      let parentBlock = findOutermostParentWithClass(
        enclosingBlock,
        'code-block'
      );
      crownOutermostParentOfExpandRoot(parentBlock);
    }
  }
}

function convertUnitText(unit) {
  var text = unit.text.replace(tabsRegex, tabInSpaces);
  text = text.replace(ltRegex, '&lt;');
  if (text === '') {
    // Avoid rendering just-linebreak lines as 0-height.
    text = '&nbsp;';
  }
  return text.replace(gtRegex, '&gt;');
}

function findParentWithClass(el, className) {
  var target = el;
  while (target && !target.classList.contains(className)) {
    target = target.parentElement;
  }
  return target;
}

function findOutermostParentWithClass(el, className) {
  var target;
  var parentEl = el;

  do {
    if (parentEl && parentEl.classList.contains(className)) {
      target = parentEl;
    }
    parentEl = parentEl.parentElement;
  } while (parentEl);

  return target;
}

module.exports = renderCodeColumn;
