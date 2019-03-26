var renderCodeColumn = require('./index');
var blocks = require('./meta/rogue.json');

(function go() {
  renderCodeColumn({
    columnsRootSelector: '#columns-root',
    columnNumber: 0,
    codeToShow: { file: 'main.c', lines: [52, 70] },
    selectFirstUnit: true,
    blocks
  });
})();
