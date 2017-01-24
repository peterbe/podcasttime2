#!/bin/bash

pushd public
# Remove jed edited files in the public dir
find . | grep --color=never '\~$' | xargs rm -f
find . | grep '\.DS_Store' | xargs rm -f
popd


time yarn run build
apack build.zip build
