ed = ( window.dfh ?= {} ).ed = {}

EdError = class extends Error

class Analyzer
  constructor: (scale) -> @scale = scale

  distance: (s1, s2) ->
    @analyze( s1, s2 ).distance

  analyze: (s1, s2) ->
    @table( s1, s2 ).finalCell()

  edits: (s1, s2) ->
    i.edit() for i in @chain( s1, s2 )

  chain: (s1, s2, includeRoot=false) ->
    t = @table s1, s2
    c = t.finalCell()
    chain = []
    while !c.isRoot()
      chain.push c
      c = c.parent
    chain.push t.root if includeRoot
    chain.reverse()

  table: (s1, s2) -> new Matrix s1, s2, @scale

  explain: (s1, s2) -> @analyze( s1, s2 ).explain()

class Cell
  constructor: (matrix, source, destination, s, d, distance, parent, edit ) ->
    @matrix      = matrix
    @source      = source
    @destination = destination
    @s           = s
    @d           = d
    @distance    = distance
    @parent      = parent
    @edit        = edit

  isRoot: -> !@parent

  cost: -> @myCost ?= @distance - @parent.distance unless @isRoot()

  chars: ->
    unless @myChars
      c1 = @source.at @s - 1 unless @s is 0
      c2 = @destination.at @d - 1 unless @d is 0
      @myChars = [ c1, c2 ]
    @myChars

  describe: ->
    [ c1, c2 ] = @chars()
    d = switch @edit
      when 'same'         then "kept #{c1}"
      when 'insertion'    then "inserted #{c2}"
      when 'deletion'     then "deleted #{c1}"
      when 'substitution' then "substituted #{c2} for #{c1}"
    "#{d} (#{@cost()})"

  explain: ->
    cell = @
    sequence = [ cell ]
    while !( cell = cell.parent ).isRoot()
      sequence.unshift cell
    i.describe() for i in sequence

  list: -> @matrix.list

  hash: -> @matrix.hash

class CharSeq
  constructor: (s) ->
    @s     = s
    @chars = ( new Char s.charAt(i), i, s.length - i - 1 for i in [0...s.length] )

  at: (i) -> @chars[i]

  toString: -> @s

class Char
  constructor: (c, pre, post) ->
    @c    = c
    @pre  = pre
    @post = post
    @list = []
    @hash = {}

  isFront: -> @pre < @post

  isBack: -> @post < @pre

  toString: -> @c

class Matrix
  constructor: (source, destination, scale) ->
    @source = new CharSeq source
    @destination = new CharSeq destination
    @scale = scale
    @list = []
    @hash = {}
    @sDim = sDim = source.length
    @dDim = dDim = destination.length
    @matrix = new Array sDim + 1
    @matrix[i] = new Array dDim + 1 for i in [0..@sDim]
    @root = new Cell @, @source, @destination, 0, 0, 0
    @matrix[0][0] = @root
    @scale.prepare @
    for i in ( if sDim then [1..sDim] else [] )
      p = @matrix[i-1][0]
      e = 'deletion'
      w = p.distance + scale.weigh( p, e, i, 0 )
      @matrix[i][0] = new Cell @, @source, @destination, i, 0, w, p, e
    for i in ( if dDim then [1..dDim] else [] )
      p = @matrix[0][ i - 1 ]
      e = 'insertion'
      w = p.distance + scale.weigh( p, e, 0, i )
      @matrix[0][i] = new Cell @, @source, @destination, 0, i, w, p, e
    if sDim and dDim
      for s in [1..sDim]
        for d in [1..dDim]
          @c s, d

  finalCell: -> @matrix[@sDim][@dDim]

  cell: (s, d) ->
    throw new EdError "dimensions of table are #{@sDim} x #{@dDim}" if s < 1 or d < 1 or s > @sDim or d > @dDim
    @matrix[s][d]

  c: (s, d) ->
    s1 = s - 1
    d1 = d - 1
    c3 = @matrix[s1][d1]
    if @source.at(s1).c is @destination.at(d1).c
      p = c3
      w = c3.distance
      e = 'same'
    else
      c1 = @matrix[s1][d]
      c2 = @matrix[s][d1]
      w1 = c1.distance + @scale.weigh c1, 'deletion', s, d
      w2 = c2.distance + @scale.weigh c2, 'insertion', s, d
      w3 = c3.distance + @scale.weigh c3, 'substitution', s, d
      if w1 < w3
        if w1 < w2
          p = c1
          w = w1
          e = 'deletion'
        else
          p = c2
          w = w2
          e = 'insertion'
      else if w2 < w3
        p = c2
        w = w2
        e = 'insertion'
      else
        p = c3
        w = w3
        e = 'substitution'
    @matrix[s][d] = new Cell @, @source, @destination, s, d, w, p, e

ed.analyzer = (alg) ->
  new Analyzer alg

ed.levenshtein = ->
  new Analyzer
    weigh:   ( parent, edit, sourceOffset, destinationOffset ) -> 1
    prepare: (matrix) ->

ed.lev = ed.levenshtein