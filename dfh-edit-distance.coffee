ed = ( window.dfh ?= {} ).ed = {}

class Analyzer
  constructor: (scale) -> @scale = scale

  distance: (s1, s2) ->
    @analyze( s1, s2 ).distance

  analyze: (s1, s2) ->
    @table( s1, s2 ).finalCell()

  edits: (s1, s2) ->
    i.edit() for i in @chain( s1, s2 )

  chain: (s1, s2, includeRoot=false) ->
    t     = @table s1, s2
    c     = t.finalCell()
    chain = []
    while !c.isRoot()
      chain.push c
      c = c.parent
    chain.push t.root if includeRoot
    chain = chain.reverse() unless @scale.reversed
    chain

  table: (s1, s2) -> new Matrix s1, s2, @scale

  explain: (s1, s2) -> @analyze( s1, s2 ).explain()

  chart: (s1, s2, width=2) -> @table( s1, s2 ).chart(width)

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

  arrow: ->
    if @isRoot()
      '\u00b7' # ·
    else if @s is @parent.s
      '\u21d0' # ⇐
    else if @d is @parent.d
      '\u21d1' # ⇑
    else
      '\u21d6' # ⇖

  chart: (width=2)->
    if @s and @d
      "|#{@arrow()}   #{@cost().toFixed(width)}"
    else if @s
      "#{@arrow()} #{@source.at(@s - 1)} #{@cost().toFixed(width)}"
    else if @d
      "|#{@arrow()} #{@destination.at(@d - 1)} #{@cost().toFixed(width)}"
    else
      '     ' + ( ' ' for i in [0...width] ).join('')

  chars: ->
    unless @myChars
      c1 = @source.at @s - 1      unless @s is 0
      c2 = @destination.at @d - 1 unless @d is 0
      @myChars = [ c1, c2 ]
    @myChars

  describe: ->
    [ c1, c2 ] = @chars()
    d = switch @edit
      when 'a' then "kept #{c1}"
      when 'i' then "inserted #{c2}"
      when 'd' then "deleted #{c1}"
      when 's' then "substituted #{c2} for #{c1}"
    "#{d} (#{@cost()})"

  explain: ->
    cell = @
    sequence = [ cell ]
    while !( cell = cell.parent ).isRoot()
      sequence.unshift cell
    i.describe() for i in sequence

  list: -> @l ?= []

  hash: -> @h ?= {}

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

  list: -> @l ?= []

  hash: -> @h ?= {}

  isFront: -> @pre < @post

  isBack: -> @post < @pre

  toString: -> @c

class Matrix
  constructor: (source, destination, scale) ->
    if scale.normalize
      [ source, destination ] = ( scale.normalize s for s in [ source, destination] )
    @source      = new CharSeq source
    @destination = new CharSeq destination
    @scale       = scale
    @sDim = sDim = source.length
    @dDim = dDim = destination.length
    @matrix = new Array sDim + 1
    @matrix[i] = new Array dDim + 1 for i in [0..@sDim]
    @root = new Cell @, @source, @destination, 0, 0, 0
    @matrix[0][0] = @root
    @scale.prepare @ if @scale.prepare
    for i in ( if sDim then [1..sDim] else [] )
      p = @matrix[i-1][0]
      e = 'd'
      w = p.distance + scale.weigh( p, e, i, 0 )
      @matrix[i][0] = new Cell @, @source, @destination, i, 0, w, p, e
    for i in ( if dDim then [1..dDim] else [] )
      p = @matrix[0][ i - 1 ]
      e = 'i'
      w = p.distance + scale.weigh( p, e, 0, i )
      @matrix[0][i] = new Cell @, @source, @destination, 0, i, w, p, e
    if sDim and dDim
      for s in [1..sDim]
        for d in [1..dDim]
          @c s, d

  chart: (width=2) ->
    s = ''
    for row in @matrix
      for cell in row
        s += cell.chart(width)
      s += "\n"
    s

  finalCell: -> @matrix[@sDim][@dDim]

  cell: (s, d) -> @matrix[s][d]

  list: -> @l ?= []

  hash: -> @h ?= {}

  c: (s, d) ->
    s1 = s - 1
    d1 = d - 1
    c3 = @matrix[s1][d1]
    if @source.at(s1).c is @destination.at(d1).c
      p = c3
      w = c3.distance
      e = 'a'
    else
      c1 = @matrix[s1][d]
      c2 = @matrix[s][d1]
      w1 = c1.distance + @scale.weigh c1, 'd', s, d
      w2 = c2.distance + @scale.weigh c2, 'i', s, d
      w3 = c3.distance + @scale.weigh c3, 's', s, d
      if w1 < w3
        if w1 < w2
          p = c1
          w = w1
          e = 'd'
        else
          p = c2
          w = w2
          e = 'i'
      else if w2 < w3
        p = c2
        w = w2
        e = 'i'
      else
        p = c3
        w = w3
        e = 's'
    @matrix[s][d] = new Cell @, @source, @destination, s, d, w, p, e

ed.analyzer = (alg) -> new Analyzer alg

ed.lev = ed.levenshtein = ->
  new Analyzer weigh: ( parent, edit, sourceOffset, destinationOffset ) -> 1

ed.cheapMargins = (startOffset=0, endOffset=0, w1=0.25, w2=1, w3=0) ->
  isPrefixy: (word, i) ->
    ( c = word.at i - 1 ) && c.isFront() && c.pre < startOffset if startOffset
  isSuffixy: (word, i) ->
    ( c = word.at i - 1 ) && c.isBack() && c.post < endOffset if endOffset
  weigh: (parent, edit, s, d) ->
    w = switch edit
      when 'd'
        w1 if @isSuffixy( parent.source, s ) or @isPrefixy( parent.source, s )
      when 'i'
        w1 if @isSuffixy( parent.destination, d ) or @isPrefixy( parent.destination, d )
      when 's'
        if @isSuffixy( parent.source, s ) and @isSuffixy( parent.destination, d ) or @isPrefixy( parent.source, s ) and @isPrefixy( parent.destination, d )
          w1
      else
        w3
    w ?= w2
