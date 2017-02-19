#!/bin/sh
scour --enable-id-stripping --no-line-breaks --remove-descriptive-elements --enable-comment-stripping --strip-xml-prolog -p 3 -i $1 -o $2
