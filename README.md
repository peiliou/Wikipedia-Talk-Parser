# Wikipedia-NLP

## Description

A browser extension that parses wiki talk conversation for NLP analysis

## Usage (for now)

* Download the entire repo and extract them to a folder
* Open your browser -> go to manage extensions -> enable developer mode -> load unpacked extension -> select the folder
* Go to any wikipedia talk page -> open web developer tools using F12 -> click the console tab -> click any reply button on a wiki talk page

## Parser Configurations
```
"include_title":false,         //include section title of a talk
"bind_comments_to_users":true, //all comments are associated with inferred users using timestamp (except last comment)
"remove_comment_info":true,    //remove comment username and timestamp
"debug": true,                 //troubleshooting only
```
