<h1 align="center">BibleUp</h1>
<img src="./docs/asset/illustration.gif" />
<p align="center">
<b>BibleUp</b> transforms all bible references on a webpage (e.g 1 Timothy 2:7, John 3:16) into links and makes the bible text accessible via a hover popup.<br>
</p>

	
# Introduction 💡
BibleUp makes bible references and verses on a webpage easily accessible without the need of opening them on a new window.

It searches for all bible references on a page and transforms each one to a link. Hovering on these links will make the bible text accessible via a feature-rich and flexible hover popup.

At it core, BibleUp is a blend of an internal api and interactive display interface

# Getting Started 🚀
## Install using <script> tag 
To integrate BibleUp to your webpage using the script tag simply put the following code at the bottom of body
```javascript
<script src="cdn.jsdelivr.net/bibleup"></script>
```
## Install using ES6 import
You can also include BibleUp by using the ES6 import statement. Simply put the following at the top of your javascript file.
```javascript
import BibleUp from "https://skypack.com/bibleup/bibleupjs
```
## NPM
Install package locally from NPM
```
$ npm install bibleup
```

# Initialize BibleUp
After installing, initialize BibleUp using the ```create``` method.
```javascript
let body = document.querySelector(body);
let bibleup = new BibleUp(body);
bibleup.create();
```
## Methods 

