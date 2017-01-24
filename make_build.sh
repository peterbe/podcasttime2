#!/bin/bash

pushd public
# Remove jed edited files in the public dir
find . | grep --color=never '\~$' | wc -l
find . | grep --color=never '\~$' | xargs rm -f
popd


time yarn run build
ls -ltrh build.zip
