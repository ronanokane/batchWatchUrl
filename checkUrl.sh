#!/bin/bash

git_update(){
	git add $file &> /dev/null
	git commit -m "$1" &> /dev/null
}

getPageElement(){
	downloadedpage=$(node ../retrieveHtml.js "$1" "$cookies" 2> /dev/null) || { echo "Couldn' t connect to $1" >&2 ; exit 1; }
	element=$(xmllint --html --xpath $2 <(echo $downloadedpage) 2> /dev/null) || { echo 'Xpath parse error...' >&2; exit 1; } 
}

usage(){
	echo "Usage: $1 -u <url> -x <xPath_element> -c <cookieFile> -f <xPathOutputFile>"
	echo
}

while getopts ':u:x:c:f:' OPTION; do
	case "$OPTION" in
		u)
			url="$OPTARG";;
		x)
			xpath="$OPTARG";;
		c)
			cookies="$OPTARG";;
		f)
			file="$OPTARG";;
	esac
done

if [ $# -eq 0 ] || [ -z $xpath ] || [ -z $url ] || [ -z $file ]; then
	usage $0
	exit 1
fi

cd watches &> /dev/null || { mkdir watches && cd watches; }

getPageElement "$url" "$xpath"

if [ ! -e "$file" ]; then
	echo "$element" > $file
fi

if [ ! -e ".git" ]; then
	git init &> /dev/null && git_update 'initial commit...'
	exit 0
fi

if [ $(md5sum $file | awk '{print $1}') != $(echo $element | md5sum | awk '{print $1}') ]; then
	echo $element > $file
	git_update 'change...'
	echo "$(git diff @~ @)"
fi