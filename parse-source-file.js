/* global process */

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var curry = require('lodash.curry');

const annotationMarker = '//||';
var lineStartRegex = /\{"file":/g;

var { file, linebreak, trail, skipTrailOnLastLine } = minimist(
  process.argv.slice(2)
);
if (!file) {
  console.log(
    `Usage: node parse-source-file.js --file <source file>
  [--linebreak crlf]
  [--trail ,]
  [--skipTrailOnLastLine yes]
  > <objects file>.ndjson`
  );
  process.exit();
}

var delimiter = '\n';
if (linebreak === 'crlf') {
  delimiter = '\r\n';
} else if (linebreak === 'cr') {
  delimiter = '\r';
}

var filename = path.basename(file);

var fileContents = fs.readFileSync(file, { encoding: 'utf8' });
var lines = fileContents.split(delimiter);
var blocks = [{ annotatedLines: [] }];
lines.forEach(curry(addLineObjectToBlocks)(blocks));
// Print as line-delimited JSON.
console.log(blocks.map(stringify).join('\n'));

function stringify(obj, i, objects) {
  var s = JSON.stringify(obj);
  // A cheap way of adding line breaks before each
  // annotatedFile entry.
  s = s.replace(lineStartRegex, '\n  {"file":');
  if (trail) {
    if (!skipTrailOnLastLine || i !== objects.length - 1) {
      s += trail;
    }
  }
  return s;
}

function addLineObjectToBlocks(blocks, line, i, lines) {
  var text = line;
  var annotation;
  if (line.indexOf(annotationMarker) !== -1) {
    let parts = line.split(annotationMarker);
    if (parts.length === 2) {
      text = parts[0];
      let markup = parts[1];
      if (markup && markup.startsWith('block')) {
        let blockParts = markup.split('||');
        let newBlock = { annotatedLines: [] };
        if (blockParts.length === 2) {
          Object.assign(newBlock, JSON.parse(blockParts[1]));
        }
        blocks.push(newBlock);
        return;
      } else {
        annotation = JSON.parse(markup);
      }
    }
  }

  var lineObject = {
    file: filename,
    lineNumber: i + 1,
    text
  };
  if (annotation) {
    lineObject = Object.assign(lineObject, annotation);
  }
  if (!lineObject.next && i < lines.length - 1) {
    lineObject.next = { line: lineObject.lineNumber + 1 };
  }
  if (lineObject.next && !lineObject.next.file) {
    lineObject.next.file = lineObject.file;
  }
  blocks[blocks.length - 1].annotatedLines.push(lineObject);
}
