/* global process */

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');

const annotationMarker = '//||';

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
var lineObjects = lines.map(getObjectForLine);
// Print as line-delimited JSON.
// If necessary, these could stream to stdout instead of
// pooling, then printing at the end.
console.log(lineObjects.map(stringify).join('\n'));

function stringify(obj, i, objects) {
  var s = JSON.stringify(obj);
  if (trail) {
    if (!skipTrailOnLastLine || i !== objects.length - 1) {
      s += trail;
    }
  }
  return s;
}

function getObjectForLine(line, i, lines) {
  var text = line;
  var annotation;
  if (line.indexOf(annotationMarker) !== -1) {
    let parts = line.split(annotationMarker);
    if (parts.length === 2) {
      text = parts[0];
      annotation = JSON.parse(parts[1]);
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
  return lineObject;
}
