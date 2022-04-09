**BIBLEUP DOCUMENTATION** 📖💡

BibleUp is a simple but powerful tool for converting bible references on a Web page to text accessible via a popup. 

# Installation
BibleUp can be installed through NPM or you can include into your project by fetching the code through any of your favourite CDN.

## NPM

`npm install @bibleup/bibleup`

In your javascript file:

`import BibleUp from 'bibleup'`

## CDN
If you prefer to use a CDN, you can import the ES module or include via the script tag.

In your javascript file:

`import BibleUp from 'https://jsdlvr.com/bibleup'`

or using `<srcipt/>` in your HTML

`<script src="https://jsdlvr.com/bibleup"></script>`

> NOTE: 
You can also use the `<script/>` to include BibleUp after installation with NPM.
BibleUp ships both ESM and UMD builds

## BibleUp Core
BibleUp comes with the CSS included into the build by default therefore providing a single minified build. However, you can decide to include BibleUp Core API and CSS separately.

### installation with NPM:
 
In your javascript file:

`import BibleUp from 'bibleup/core'`

Then include the CSS using `<link>`

`<link rel="stylesheet" src="node_modules/bibleup/dist/css/bibleup.css">`

### Installation through CDN:
Using your favourite CDN, You can either import the core API ESM build or use the `<script>` to include the UMD build. The CSS can only be included using `<link>`

In your Javascript file: 

`import BibleUp from "https:/jsdelivr.com/esm/bibleup-core"`

or using `<script>` in your HTML:

`<script src="https://jsdelivr.com/umd/bibleup-core"></script>`

Then include the CSS using `<link>`

`<link rel="stylesheet" src="https://jsdelivr.com/css/bibleup">`

> NOTE:
- We **recommend** using the single minified build of BibleUp for production rather than including the API and CSS separately.
- You are free to use other CDN registry apart from the one used in the examples


# Usage

After installation, intialize `BibleUp` by passing an element and the required `options` object into it. BibleUp exposes a single object interface which is `BibleUp`.

`let bibleup = new BibleUp(element, options)`

**element** - This is the HTML element containing the bible references. This could be the entire `document.body`, browser window or a particular element you want BibleUp to search through.

**options**  - This is an object that should contain all BibleUp options and configurations. BibleUp options will be discussed on the next section.


When you are done with configuring `BibleUp`, put it to work by calling the `create()` method

`bibleup.create()`

BibleUp will transform all valid Bible references to links. Hover or click on the link to get the Bible text 🎉🎉

For a detailed example of usage
`
let body = document.body
let bibleup = new BibleUp(body, {
version: "KJV", 
popup: "classic"
})

bibleup.create()
`
Check next section for full list of options properties