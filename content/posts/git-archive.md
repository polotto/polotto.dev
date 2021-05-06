---
title: "The amazing Git Archive"
date: 2021-05-06T00:00:00+03:00
tags: ["git"]
author: "Polotto"
showToc: false
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Starting a blog about development."
disableShare: true
disableHLJS: false
hideSummary: false
searchHidden: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
---

I’ve been using git for 5 years and this tool always surprises me.
I faced a problem this week that seems simple but require a lot effort to execute using only the commands ZIP or TAR:

* Create a TAR archive of the project excluding all the files and folders included in the gitignore file.

I tried only with the TAR command but my `.gitigore` was massive. After some research, I found the following example that uses git archive command to compress the project excluding the content of gitignore ([this post](https://askubuntu.com/a/87693/1127802)):

```text
If you're trying to zip up a project which is stored in Git, 
use the git archive command. From within the source directory:

git archive -o bitvolution.zip HEAD *
```

My case was a bit more specific, my project was allocated in a subfolder that is not a Git repository containing an `.gitignore` file, but that example was so great and so simple that I give a shoot changing the output file format to TAR:

`git archive --format=tar -o archive.tar HEAD`

To my surprise, it worked fine, the command created a file called archive.tar with all my project files excluding all files described in the gitignore in a folder that is not a Git repository.

GIT IS GREAT!!!