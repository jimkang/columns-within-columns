#!/bin/bash

# Parses each source file in root into ndjson, then combines
# them all into a single file containing one JSON array.
 
root=../annotated-rogue/marked-up-src/linuxrogue-0.3.7
arrayfile=meta/rogue.json

rm ${arrayfile}

printf "[\n" > meta/rogue.json

for file in ${root}/*.c

do
	echo ${file}
	node parse-source-file.js --file ${file} --trail "," --skipTrailOnLastLine yes >> ${arrayfile}
done

printf "]\n" >> ${arrayfile}

