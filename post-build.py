#!/usr/bin/env python

# A temporary hack until I figure out a better way to put variables
# in the .js code

import os
import re
import sys
from glob import glob

dir_ = sys.argv[1]
assert os.path.isdir(dir_), '{!r} not a directory'.format(dir_)

LOADCSS_TEMPLATE = """
<link rel="preload" href="{0}" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="{0}"></noscript>
"""

for fn in glob(os.path.join(dir_, '*.html')):
    with open(fn) as f:
        content = f.read()
    print(fn, 'has', content.count('dev-src="'), 'dev-src attributes')
    content = content.replace('dev-src="', 'src="')
    # print(content)
    for link_tag in re.findall('<link [^>]+>', content, re.MULTILINE):
        if 'rel="stylesheet"' in link_tag:
            already = '<noscript>{}</noscript>'.format(link_tag)
            if already in content:
                continue
            # print('BEFORE', repr(link_tag))
            href, = re.findall('href="([^"]+)"', link_tag)
            print(href)
            content = content.replace(
                link_tag,
                LOADCSS_TEMPLATE.format(href).replace('\n', '')
            )
    with open(fn, 'w') as f:
        f.write(content)
