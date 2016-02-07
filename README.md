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

## Module functions

### `lev` or `levenshtein`

This returns an analyzer that implements the Levenshtein edit distance algorithm,
where insertions, deletions, and substitutions all have a cost of 1.

### `analyzer(obj)`

This takes an object implementing two methods, `weigh` and `prepare`, and returns
an `Analyzer`. This, for example, implements the Levenshtein algorithm:

```javascript
dfh.ed.analyzer({
  weigh: function(parent, edit, sourceOffset, destinationOffset) {
    return 1;
  },
  prepare: function(matrix) {}
});
```

The `weigh` method returns the cost of a particular edit. Its `parent` parameter
is the `Cell` containing the previous edit; `edit` is one of `a`, `s`, `i`, `d`,
denoting "no change," "substitution," "insertion," and "deletion," respectively.
The `sourceOffset` and `destinationOffset` indicate the position of the two
relevant characters in the two strings.

The `prepare` method can be used to pre-cache information that may be of use
to the algorithm.

## Analyzer methods

The two `Analyzer` methods of greatest utility are

### `distance(s, d)`

The edit distance between the strings `s` (source) and `d` (destination).

### `explain(s, d)`

A description of the optimal list of edits given the algorithm from `s` (source)
to `d` (destination).

### other methods

`Analyzer` has other methods beyond these -- `table`, `chain`, `analyze`,
`edits`. These are useful chiefly for exploring algorithms, but for that most
likely all you need is `explain`.

## Other objects

If you explore the source you will see that a number of classes are defined:
`Matrix`, `Char`, `Cell`, `CharSeq`. For the most part you should regard these
as private classes. The exception to this is that `Matrix`, `Char`, and `Cell`
each provide data structures you might use to cache data of use to a novel edit
distance algorithm. These methods are `list` and `hash`, which provide exactly
what you would expect from their names. A `Matrix` contains many `Cell`s. The
same `Char` will occur in many `Cell`s.

## License

See included license file.
