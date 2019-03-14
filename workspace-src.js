var renderCodeColumn = require('./index');
var annotations = require('./meta/rogue.json');

(function go() {
  renderCodeColumn({
    rootSelector: '#code-root',
    initialColumn: { file: 'main.c', lines: [40, 70] },
    lineAnnotations: annotations
  });
})();
