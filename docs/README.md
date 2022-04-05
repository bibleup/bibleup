<h1 align="center">BibleUp 📖💡</h1>
<img src="./docs/asset/illustration.gif" />
<p align="center">
BibleUp transforms all bible references on a webpage (1 Timothy 2:7, John 3:16) into links and makes the text accessible via a hover popup.<br>
</p>

# Bugs 🐛
[x] fix `bu-data`: concate the object into string to be passed on to `Search` : updatePopup cannot get reference of the result 
(when isLoading = false) since parameter `res` is not an object with `ref` attribute. This happens if `bu-data` is a string
[x] include error text on popup if ref cannot be queried, because of network or other causes
[x] Implement workaround for invalid ranges
[x] Implement cache on previously loaded verses.
[x] fix bible versions

# Heavy Bugs
- Inconsistent BSB version format - E.g 2 Corithians 5:18 (and Gen 3:8) response from api endpoint doesn't follow the regular format and therefore reutns no content - with only BSB version. This issue can only be fixed by api.bible

# Minor Improvements
- Delay popup disappearance after leaving link
[ ] Implement WAI-ARAI accessibility guidelines to make dialogs readable by assistive technologies - focus on close button and ESC to close dialog
[x] `styleLink` option removed. Links should be styled directly instead.

# Performance Test
[ ] `bible-data.js` was included twice in bundle - at `bible.js` and `bibleup.js`. Check if it is only incuded once in dist output

