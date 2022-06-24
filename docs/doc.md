## **BIBLEUP DOCUMENTATION (v1.0.0)** 📖💡

> Notes and minor documentations.<br> 
> Notes here are not synced with the official documentation. 

---
## Discussion
Seting A Bible Citation Standard to remove citation ambiguity.
- Space must come after `book` and `chapter` ('Romans 6' instead of 'Romans6'). No space is currently permitted. 
- Should multiple spaces be allowed (Romans 6: 3 - 5). This is currently allowed.
- Enable multi-chapter tagging (E.g Romans 3:23, 4:4). This is currently not allowed.
- Match standalone verses after a single chapter definition [romans 5  (john 4:5) verse 5 to match 'VERSE 5' as Romans 5:5]

## Popover Presets
### Github-popover style
```js
{
	version: 'kjv',
	popup: 'inline',
	darkTheme: false,
	styles: {
		primary: ' #fff',
		secondary: '#fff',
		tertiary: '#f2f2f2',
		headerColor: '#24292f',
		color: ['#24292f','#24292f'],
		borderRadius: '6px',
		boxShadow: '0 0 0 1px #d0d7de, 0 8px 24px rgba(140,149,159,0.2)'
	}
}
```

### Stackoverflow style
```js
{
	version: 'kjv',
	popup: 'inline',
	darkTheme: false,
	styles: {
		primary: ' #fff',
		secondary: '#fff',
		tertiary: '#f2f2f2',
		headerColor: '#0c0d0e',
		color: ['#0c0d0e','#0c0d0e'],
		borderRadius: '5px',
		boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.06), 0 3px 8px rgba(0,0,0,0.09)'
	}
}
```
