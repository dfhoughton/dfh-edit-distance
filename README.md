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

## Description

This package provides a pluggable edit distance algorithm in the `dfh.ed`
namespace. You can use the pre-packaged Levenshtein algorithm or implement
your own, which involves conditioning the cost of single-character insertions,
deletions, and substitutions on whatever suits you. I will include some utility
functions for generating algorithms with cheap suffixes, or a known set of
suffixes, in the future, and perhaps a sample algorithm for Welsh which makes
word-initial changes in a fixed set and internal vowel changes cheap as well.
This should be sufficient to whet your imagination.

## Installation

I haven't packaged this up in any special way. You can clone this, of course,
and use it however you wish. I've also included the coffeescript compiled into
puffy and minified javascript.

## Module functions

### `lev` or `levenshtein`

This returns an analyzer that implements the Levenshtein edit distance algorithm,
where insertions, deletions, and substitutions all have a cost of 1.

### `analyzer(obj)`

This takes an object implementing at least one method, `weigh`, and returns
an `Analyzer`. This, for example, implements the Levenshtein algorithm:

```javascript
dfh.ed.analyzer({
  weigh: function(parent, edit, sourceOffset, destinationOffset) {
    return 1;
  }
});
```

The `weigh` method returns the cost of a particular edit. Its `parent` parameter
is the `Cell` containing the previous edit; `edit` is one of `a`, `s`, `i`, `d`,
denoting "no change," "substitution," "insertion," and "deletion," respectively.
The `sourceOffset` and `destinationOffset` indicate the position of the two
relevant characters in the two strings.

Other optional attributes of this object are

#### `normalize(s)`

A normalization step applied to the source and destination strings before any
further processing.

#### `prepare(matrix)`

A pre-processing step.

#### `reversed`

Whether or not the `normalization` step reversed the order of the two strings.
The edit distance algorithm proceeds in a fixed direction from left to right.
In a prefixing language like Swahili it may be better to run the algorithm from
right to left, for which you need to reverse the source and destination. This
can make for confusing edit explanations, however, unless you've recorded that
you did this reversal. The attribute is expected to be a boolean, not a function.

### `cheapMargins(startOffset=0, endOffset=0, cheap=0.25, expensive=1, match=0)`

The `cheapMargins` function generates an algorithm for which marginal edits --
those in some fixed-width prefix or suffix of the string -- are cheaper than
those in the middle. The first parameter, `startOffset`, specifies the size of
the prefix; the second, `endOffset`, that of the suffix. By the cost of
insertions, deletions, and substitutions in these regions is specified by the
`cheap` parameter, by default 0.25. Other edits are have the `expensive` cost.
Matches have the `match` cost.

The output of this function can be fed to `analyzer` to generate an analyzer
which will use these costs.

A cheap margins algorithm is useful to indicate that words that differ by
prefixes or suffixes are more similar than those that differ internally. For
instance, you might want the distance between `camel` and `camels` to be less
than that between `camel` and `scamel`, which you could do by making suffixes
cheap and prefixes expensive.

## Analyzer methods

The two `Analyzer` methods of greatest utility are

### `distance(s, d)`

The edit distance between the strings `s` (source) and `d` (destination).

### `explain(s, d)`

A description of the optimal list of edits given the algorithm from `s` (source)
to `d` (destination).

### `chart(s, d)`

A chart representing all the edits in the table used by the dynamic programming
algorithm.

```
> console.log(dfh.ed.lev().chart('walked','walking'))
    |⇐w 1|⇐a 1|⇐l 1|⇐k 1|⇐i 1|⇐n 1|⇐g 1
⇑w 1|⇖  0|⇐  1|⇐  1|⇐  1|⇐  1|⇐  1|⇐  1
⇑a 1|⇑  1|⇖  0|⇐  1|⇐  1|⇐  1|⇐  1|⇐  1
⇑l 1|⇑  1|⇑  1|⇖  0|⇐  1|⇐  1|⇐  1|⇐  1
⇑k 1|⇑  1|⇑  1|⇑  1|⇖  0|⇐  1|⇐  1|⇐  1
⇑e 1|⇑  1|⇑  1|⇑  1|⇑  1|⇖  1|⇖  1|⇖  1
⇑d 1|⇑  1|⇑  1|⇑  1|⇑  1|⇖  1|⇖  1|⇖  1
```

The bottom right-hand cell represents the final state. One can trace the edits
used by following the arrows back to the top left.

*Note that if you use the minified javascript included, you must specify the
character set of the source as utf-8 for this to work:*

```html
<script src="dfh-edit-distance.min.js" charset="utf-8"></script>
```

### other methods

`Analyzer` has other methods beyond these -- `table`, `chain`, `analyze`,
`edits`. These are useful chiefly for exploring algorithms, but for that most
likely all you need is `explain` and perhaps `chart`.

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
