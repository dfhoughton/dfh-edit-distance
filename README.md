# dfh-edit-distance
coffeescript/javascript pluggable edit distance algorithm library

This is a port to javascript, via coffeescript, of the edit distance algorithm
I first implemented in Ruby.

```javascript
var analyzer = dfh.ed.levenshtein();
console.log(analyzer.distance('cat', 'cats')); // 1
```
