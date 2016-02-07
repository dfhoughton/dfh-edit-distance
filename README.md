# dfh-edit-distance
coffeescript/javascript pluggable edit distance algorithm library

This is a port to javascript, via coffeescript, of the edit distance algorithm
I first implemented in Ruby.

## Synopsis

```javascript
var analyzer = dfh.ed.levenshtein();
// undefined
analyzer.distance('cat','rat');
// 1
analyzer.distance('cat','dog');
// 3
analyzer.explain('cat','rat');
// ["substituted r for c (1)", "kept a (0)", "kept t (0)"]
analyzer.explain('cat','dog');
// ["substituted d for c (1)", "substituted o for a (1)", "substituted g for t (1)"]
```

## License

See included license file.
