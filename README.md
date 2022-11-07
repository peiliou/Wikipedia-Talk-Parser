# Wikipedia-Talk-Parser

## Description

A generalized Wikipedia Talk (Conversation+Metadata) parser with configurations available 

- It backtracks the entire conversation (with metadata) of a comment the user wants to reply to
- Wikipedia Talk Comment Metadata Format
```
author: string
id: string
level: int
replies: array
timestamp: date
type: string
```

## Parser Configurations (can be found in Userscript.user.js or main.template.js)
```
"include_title":false,         //include section title of a talk
"bind_comments_to_users":true, //all comments are associated with inferred users using timestamp (except last comment)
"remove_comment_info":true,    //remove comment username and timestamp
"debug": false,                //troubleshooting only
```

## Getting Started
1. Download [Tampermonkey](https://www.tampermonkey.net) suitable to your browser

2. [Install](https://github.com/peiliou/Wikipedia-Talk-Parser/raw/main/Userscript.user.js) Userscript.user.js

3. Go to any wikipedia talk page -> open web developer tools using F12 -> click the console tab -> click any reply button on a wiki talk page to see parser results in the console

4. Continue adding code inside the userscript to process the parser results (for further developments)

---

**Alternatively, you can also use it as a library (see example files in the `lib` folder)**

---
