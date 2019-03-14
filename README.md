columns-within-columns
==================

A module that will render code as columns within columns in an attempt to show how it is executed.

Installation
------------

    npm install columns-within-columns

Usage
----

	var renderColumns = require('columns-within-columns');

	renderColumns({
		rootSelector: '#columns-root',
		start: { file: 'main.c', line: 40 },
		lineAnnotations: [
			{"file":"main.c","lineNumber":40,"text":"int main(int argc, char *argv[])","next":{"line":41,"file":"main.c"}},
			{"file":"main.c","lineNumber":41,"text":"{","next":{"line":42,"file":"main.c"}},
			{"file":"main.c","lineNumber":42,"text":"\t/* Save the setuid we have got, then turn back into the player */","next":{"line":43,"file":"main.c"}},
			{"file":"main.c","lineNumber":43,"text":"//\tsaved_uid = geteuid();","next":{"line":44,"file":"main.c"}},
			{"file":"main.c","lineNumber":44,"text":"//\tsetuid(true_uid = getuid());","next":{"line":45,"file":"main.c"}},
			{"file":"main.c","lineNumber":45,"text":"","next":{"line":46,"file":"main.c"}},
			{"file":"main.c","lineNumber":46,"text":"\tif (init(argc, argv))\t/* restored game */","next":{"line":47,"file":"main.c"}},
			{"file":"main.c","lineNumber":47,"text":"\t{","next":{"line":48,"file":"main.c"}},
			{"file":"main.c","lineNumber":48,"text":"\t\tgoto PL;","next":{"line":62,"file":"main.c"}},
			{"file":"main.c","lineNumber":49,"text":"\t}","next":{"line":50,"file":"main.c"}},
			{"file":"main.c","lineNumber":50,"text":"","next":{"line":51,"file":"main.c"}},
			{"file":"main.c","lineNumber":51,"text":"\tfor (;;)","next":{"line":52,"file":"main.c"}},
			{"file":"main.c","lineNumber":52,"text":"\t{","next":{"line":53,"file":"main.c"}},
			{"file":"main.c","lineNumber":53,"text":"    ","note":"Make all the things that go in the map.","next":{"line":54,"file":"main.c"}},
			{"file":"main.c","lineNumber":54,"text":"\t\tclear_level();","next":{"line":55,"file":"main.c"}},
			{"file":"main.c","lineNumber":55,"text":"\t\tmake_level();","next":{"line":56,"file":"main.c"}},
			{"file":"main.c","lineNumber":56,"text":"\t\tput_objects();","next":{"line":57,"file":"main.c"}},
			{"file":"main.c","lineNumber":57,"text":"\t\tput_stairs();","next":{"line":58,"file":"main.c"}},
			{"file":"main.c","lineNumber":58,"text":"\t\tadd_traps();","next":{"line":59,"file":"main.c"}},
			{"file":"main.c","lineNumber":59,"text":"\t\tput_mons();","next":{"line":60,"file":"main.c"}},
			{"file":"main.c","lineNumber":60,"text":"\t\tput_player(party_room);","next":{"line":61,"file":"main.c"}},
			{"file":"main.c","lineNumber":61,"text":"\t\tprint_stats(STAT_ALL);","next":{"line":62,"file":"main.c"}},
			{"file":"main.c","lineNumber":62,"text":"PL:\t\t","next":{"line":63,"file":"main.c"}},
			{"file":"main.c","lineNumber":63,"text":"    ","note":"Now, allow them all to interact.","next":{"line":64,"file":"main.c"}},
			{"file":"main.c","lineNumber":64,"text":"\t\tplay_level(); ","expand":{"file":"play.c","lines":[151,406]},"next":{"line":65,"file":"main.c"}},
			{"file":"main.c","lineNumber":65,"text":"\t\tfree_stuff(&level_objects);","next":{"line":66,"file":"main.c"}},
			{"file":"main.c","lineNumber":66,"text":"\t\tfree_stuff(&level_monsters);","next":{"line":67,"file":"main.c"}},
			{"file":"main.c","lineNumber":67,"text":"\t}","next":{"line":51,"file":"main.c"}},
			{"file":"main.c","lineNumber":68,"text":"","next":{"line":69,"file":"main.c"}}
		]
	});

To generate line annotation objects, you can use `parse-source-file.js`. `parse-source-to-array.sh` has an example of using it on a lot of source files to create a single JSON file that has one array of annotation objects in it.

Annotation objects can have the following properties:

- file: The name of the file that the line of code comes from.
- lineNumber: The line number of the line of code.
- text: The content of the line. (The actual code.)
- next: An object (with properties `file` and `lineNumber`) specifying the next line of code that will execute after this one. `parse-source-file.js` assumes this will be the next line in the file, unless there is a special annotation.
- expand: An object (with properties `file` and `lines`, an array of two linu numbers) specifying which lines of code this particular line of code should expand into when the user clicks on it. Useful for showing a function's definition inline. 
- note: An optional note about the code to be rendered alongside the code.

## Special annotations that `parse-source-file.js` understands.

It looks for annotations in a line to be after this string: `//||` and in the form of a JSON string.

- **next**: This tells the renderer	where to go when the user clicks next while on this line.

      goto PL;//||{"next": {"line": 62}}

- **note**: This tells the renderer to display a note next to the code. Or, if there is no code on that line, to just display the note.

      //||{"note": "Make all the things that go in the map."}

- **expand**: Tell the renderer that, when the user clicks on the line, it should display the specified lines of code below it.

      play_level(); //||{"expand": {"file": "play.c", "lines": [151, 406]}}

Development
----

First, install Node. Then:

    npm install
    npm install wzrd -g

    make run    

Then, wzrd will say something like:

    wzrd index.js
    server started at http://localhost:9966

You can open your browser to http://localhost:9966/workspace.html to try out your changes.

Run `make prettier` (expects you to have run `npm install -g prettier`) and `eslint .` before committing.

License
-------

The MIT License (MIT)

Copyright (c) 2019 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
