#!/bin/bash

export TS_FILES=$(find . -name '*.ts' | grep -v ".spec.ts" | grep -v ".node_modules" | grep -v "./dist")

for f in ${TS_FILES}; do
  echo $f
  grep -E "Copyright.*WeAreFrank" $f
done
