#!/bin/bash

pushd public
# Remove jed edited files in the public dir
find . | grep --color=never '\~$' | xargs rm -f
find . | grep '\.DS_Store' | xargs rm -f
popd


#PUBLIC_URL="https://podcasttime-2916.kxcdn.com" yarn run build
yarn run build
./post-build.py build
apack build.zip build
