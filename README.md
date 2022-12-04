# Wikipedia-Talk-Parser

## Description

A generalized **Wikipedia Talk** parser with metadata and configurations available 

- It backtracks the entire conversation (with metadata) of a comment the user wants to reply to
- Comment metadata format (if available)
```
author: string
id: string
level: int
replies: array
timestamp: date
type: string
```

## Parser Configurations (in the source code)
```
"include_title":false,         //include section title of a talk
"bind_comments_to_users":true, //all comments are associated with inferred users using timestamp
"remove_comment_info":true,    //remove comment username and timestamp
"debug": false,                //troubleshooting only
```

## Getting Started
1. Download [Tampermonkey](https://www.tampermonkey.net) suitable to your browser

2. [Install](https://github.com/peiliou/Wikipedia-Talk-Parser/raw/main/Userscript.user.js) Userscript.user.js

3. Go to any wikipedia talk page -> open web developer tools-> switch to the console tab -> the console will show parsed results when a reply button is clicked on a wiki talk page

4. Continue adding code inside the userscript to process the parsed results for further development

---

**Alternatively, you can also use it as a library (see example files in the [lib](https://github.com/peiliou/Wikipedia-Talk-Parser/tree/main/lib) folder)**

---

## The Parsing Algorithm
1. It starts by checking if the comment is at the root level, since the comment DOM layout at the root level is different from other levels
2. It creates deep copies of original nodes to process them without side effects
3. Starting from the selected comment, it backtracks its preceding comment until the root level is reached
   - All comments preceding it at the same level are traversed before jumping back towards the root level
   - Comment texts (with or without the comment info) and metadata (if available) of all traversed comments are saved
4. After reaching the root level, it traverses backwards until the section title is reached
   - Comment texts (with or without the comment info) and metadata (if available) of all traversed comments are saved

**`remove_nested_comments(node, metadata)`**: remove all non-primary comments of `node` and add metadata of the first comment to `metadata`

**`prepend_if_valid(stack, node)`**: add `node` into the `stack` with behaviors affected by settings of `config`
   >- Duplication checking
   >- Catches some edge cases
   >- Calls the helper function `preprocess(node)`

**`preprocess(node)`**: remove noises of `node` with behaviors affected by settings of `config` to permit the clean use of `node.innerText`
   >- Catches some edge cases