<h1 align="center">BibleUp 📖💡</h1>
<img src="./docs/asset/illustration.gif" />
<p align="center">
BibleUp transforms all bible references on a webpage (1 Timothy 2:7, John 3:16) into links and makes the text accessible via a hover popup.<br>
</p>

# Bugs 🐛
[x] fix `bu-data`: concate the object into string to be passed on to `Search` : updatePopup cannot get reference of the result 
(when isLoading = false) since parameter `res` is not an object with `ref` attribute. This happens if `bu-data` is a simple bible reference 
[x] include error text on popup if ref cannot be queried, because of network or other causes
[x] Implement workaround for invalid ranges
[x] Implement cache on previously loaded verses.
[x] fix bible versions

# Heavy Bugs
[ ] 2 Corithians 5:18 response from api endpoint does not follow the normal format and therefore reutns no content - with only BSB version. This issue can only be fixed by api.bible

# Minor Improvements
- Delay popup disappearance after leaving link

# Performance Test
- `bible-data.js` was included twice in bundle at `bible.js` and `bibleup.js`. Check if it is only incuded once in dist output

BSB
"content": "<p class=\"b\"></p><p class=\"m\">All this is from God, who reconciled us to Himself through Christ and gave us the ministry of reconciliation: </p>",

KJV 
"content": "<p class=\"p\">And all things <span class=\"add\">are</span> of God, who hath reconciled us to himself by Jesus Christ, and hath given to us the ministry of reconciliation; </p>",