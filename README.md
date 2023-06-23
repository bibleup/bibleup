<p align="center">
  <a href="https://bibleup.netlify.app">
    <img src="https://user-images.githubusercontent.com/67844971/166860855-3735ee35-a269-4863-b5bc-9e046c4b4424.png" alt="BibleUp Logo" width="400" />
  </a>
</p>

<p align="center">
<strong>A tool for converting Bible references on a webpage to links with an accessible popover.</strong>
</p>


<div align="center">
  <a href="https://www.npmjs.com/package/@bibleup/bibleup">
    <img src='https://img.shields.io/npm/v/@bibleup/bibleup?logo=Npm&style=flat-square' />
  </a>
  <a href="">
    <img src='https://img.shields.io/github/v/release/Bibleup/bibleup?include_prereleases&logo=Github&style=flat-square' />
  </a>
  <a href="">
    <img src='https://img.shields.io/github/languages/top/Bibleup/bibleup?logo=typescript&style=flat-square' />
  </a>
  <a href="https://www.jsdelivr.com/package/npm/@bibleup/bibleup"><img src="https://img.shields.io/jsdelivr/npm/hm/@bibleup/bibleup?color=blue&label=JSDelivr%20Hits&logo=jsdelivr&logoColor=yellow&style=flat-square" alt="JSDelivr Hits/month"></a>
</div>

<p align="center">
  <strong>
    <a href="https://bibleup.netlify.app">Home</a> ∙
    <a href="https://bibleup.netlify.app/demo">Demo</a> ∙
    <a href="https://bibleup.netlify.app/docs">Documentation</a> ∙
    <a href="https://wordpress.org/plugins/bibleup/">WordPress</a> ∙
    <a href="https://github.com/Bibleup/bibleup/issues">Get Support</a>
  </strong>
</p>

<br>
<div align="center">
<img alt="A classic BibleUp popover with dark theme enabled." width="400" src="https://lh3.googleusercontent.com/d/1Hacc6-ueJReD-8rXOvHKapkJuBff5tYy" />
<p align="center"><sub>(A classic BibleUp popover with dark theme enabled)</sub></p>
</div>
<hr>

## What is BibleUp?

BibleUp makes Bible references on a webpage easily accessible without the need of leaving the page.<br>
This tool converts Bible references found on a webpage into clickable links, and upon hovering over these links, a feature-rich and flexible popover appears, providing the relevant Bible text.
<br><br>
BibleUp is a blend of an internal API and a display interface.

## Features

- **Easy integration** - simply install and configure.
- **Powerful and smart tagging** - matches all valid references including abbreviated books, verse ranges and chapter-level references.
- **Highly customizable popover** - style according to your site theme.
- **Robust Configuration** - configure behaviour as you want.
- **Supports different Bible versions** - KJV, ASV, LSV and WEB with much more to come.
- **Fast and performant** - no site bloats
- **Extensive browsers support** - works on all your favourite browsers.
- **Follows WAI-ARAI accessibility guidelines** - for screen readers and keyboard navigation.
- [**BibleUp Editor**](https://bibleup.netlify.app/demo/editor) - style popover in real-time and export options

## Example
This is a minimal example of BibleUp options and usage (check the docs for full options):
```js
const page = new BibleUp(document.body, {
  version: 'KJV',
  popup: 'classic',
  darkTheme: true,
  styles: {
    fontSize: '15px',
    borderRadius: '20px 15px',
  }
});

// activate BibleUp 💡
page.create();
```

## Documentation

Installing and configuring BibleUp is as simple as it can get.<br> See the [docs](https://bibleup.netlify.app/docs) for guides on installation, usage and how to get started with Bibleup.

## Plugin and Extension

BibleUp is available as a plugin for WordPress sites and a browser extension that can be used on any website.

-  [Wordpress plugin](https://github.com/bibleup/wordpress)
-  [Browser Extension](https://github.com/bibleup/browser-extension)


## Contributing

You can contibute to this project in many, different ways: as a blogger, reviewer, organisation or even by developing with us. See how to contribute [here.](https://bibleup.netlify.app/docs/guide)<br><br>
Feature requests and issues are always welcomed.<br>
Kindly make sure you state the specifics in detail, whether a bug, feature request or a fix.<br>
Thank you for choosing to contribute!

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera-mini/opera-mini_48x48.png" alt="Opera Mini" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera Mini |
| --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| IE11, Edge| last 3 versions| last 3 versions| last 5 versions| last 5 versions| last 3 versions| last 10 versions

## Credits

Special thanks to [API.Bible](https://scripture.api.bible)!

## Licence

BibleUp core is available under the [MIT Licence.](https://github.com/Bibleup/bibleup/blob/main/LICENSE)<br>Other derivative projects may carry a different licence.
