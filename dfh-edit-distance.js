// Generated by CoffeeScript 1.8.0
(function() {
  var Analyzer, Cell, Char, CharSeq, Matrix, ed;

  ed = (window.dfh != null ? window.dfh : window.dfh = {}).ed = {};

  Analyzer = (function() {
    function Analyzer(scale) {
      this.scale = scale;
    }

    Analyzer.prototype.distance = function(s1, s2) {
      return this.analyze(s1, s2).distance;
    };

    Analyzer.prototype.analyze = function(s1, s2) {
      return this.table(s1, s2).finalCell();
    };

    Analyzer.prototype.edits = function(s1, s2) {
      var i, _i, _len, _ref, _results;
      _ref = this.chain(s1, s2);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(i.edit());
      }
      return _results;
    };

    Analyzer.prototype.chain = function(s1, s2, includeRoot) {
      var c, chain, t;
      if (includeRoot == null) {
        includeRoot = false;
      }
      t = this.table(s1, s2);
      c = t.finalCell();
      chain = [];
      while (!c.isRoot()) {
        chain.push(c);
        c = c.parent;
      }
      if (includeRoot) {
        chain.push(t.root);
      }
      if (!this.scale.reversed) {
        chain = chain.reverse();
      }
      return chain;
    };

    Analyzer.prototype.table = function(s1, s2) {
      return new Matrix(s1, s2, this.scale);
    };

    Analyzer.prototype.explain = function(s1, s2) {
      return this.analyze(s1, s2).explain();
    };

    Analyzer.prototype.chart = function(s1, s2) {
      return this.table(s1, s2).chart();
    };

    return Analyzer;

  })();

  Cell = (function() {
    function Cell(matrix, source, destination, s, d, distance, parent, edit) {
      this.matrix = matrix;
      this.source = source;
      this.destination = destination;
      this.s = s;
      this.d = d;
      this.distance = distance;
      this.parent = parent;
      this.edit = edit;
    }

    Cell.prototype.isRoot = function() {
      return !this.parent;
    };

    Cell.prototype.cost = function() {
      if (!this.isRoot()) {
        return this.c != null ? this.c : this.c = this.distance - this.parent.distance;
      }
    };

    Cell.prototype.arrow = function() {
      if (this.isRoot()) {
        return '\u00b7';
      } else if (this.s === this.parent.s) {
        return '\u21d0';
      } else if (this.d === this.parent.d) {
        return '\u21d1';
      } else {
        return '\u21d6';
      }
    };

    Cell.prototype.chart = function(f) {
      var c;
      c = this.cost();
      if (this.s && this.d) {
        return "|" + (this.arrow()) + " " + (f(c));
      } else if (this.s) {
        return "" + (this.arrow()) + (this.source.at(this.s - 1)) + (f(c));
      } else if (this.d) {
        return "|" + (this.arrow()) + (this.destination.at(this.d - 1)) + (f(c));
      } else {
        return "  " + (f(' '));
      }
    };

    Cell.prototype.initial = function() {
      var _ref;
      return (_ref = this.parent) != null ? _ref.isRoot() : void 0;
    };

    Cell.prototype.final = function(source) {
      if (source == null) {
        source = false;
      }
      return source && this.s === this.source.length() || !source && this.d === this.destination.length();
    };

    Cell.prototype.chars = function() {
      return this.h != null ? this.h : this.h = (function(_this) {
        return function() {
          var c1, c2;
          if (_this.s !== 0) {
            c1 = _this.source.at(_this.s - 1);
          }
          if (_this.d !== 0) {
            c2 = _this.destination.at(_this.d - 1);
          }
          return [c1, c2];
        };
      })(this)();
    };

    Cell.prototype.describe = function() {
      var c1, c2, d, _ref;
      _ref = this.chars(), c1 = _ref[0], c2 = _ref[1];
      d = (function() {
        switch (this.edit) {
          case 'a':
            return "kept " + c1;
          case 'i':
            return "inserted " + c2;
          case 'd':
            return "deleted " + c1;
          case 's':
            return "substituted " + c2 + " for " + c1;
        }
      }).call(this);
      return "" + d + " (" + (this.cost()) + ")";
    };

    Cell.prototype.explain = function() {
      var cell, i, sequence, _i, _len, _results;
      cell = this;
      sequence = [cell];
      while (!(cell = cell.parent).isRoot()) {
        sequence.unshift(cell);
      }
      _results = [];
      for (_i = 0, _len = sequence.length; _i < _len; _i++) {
        i = sequence[_i];
        _results.push(i.describe());
      }
      return _results;
    };

    Cell.prototype.list = function() {
      return this.l != null ? this.l : this.l = [];
    };

    Cell.prototype.hash = function() {
      return this.h != null ? this.h : this.h = {};
    };

    return Cell;

  })();

  CharSeq = (function() {
    function CharSeq(s) {
      var i;
      this.s = s;
      this.chars = (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = s.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push(new Char(s.charAt(i), i, s.length - i - 1));
        }
        return _results;
      })();
    }

    CharSeq.prototype.at = function(i) {
      return this.chars[i];
    };

    CharSeq.prototype.toString = function() {
      return this.s;
    };

    CharSeq.prototype.length = function() {
      return this.s.length;
    };

    return CharSeq;

  })();

  Char = (function() {
    function Char(c, pre, post) {
      this.c = c;
      this.pre = pre;
      this.post = post;
    }

    Char.prototype.list = function() {
      return this.l != null ? this.l : this.l = [];
    };

    Char.prototype.hash = function() {
      return this.h != null ? this.h : this.h = {};
    };

    Char.prototype.isFront = function() {
      return this.pre < this.post;
    };

    Char.prototype.isBack = function() {
      return this.post < this.pre;
    };

    Char.prototype.toString = function() {
      return this.c;
    };

    return Char;

  })();

  Matrix = (function() {
    function Matrix(source, destination, scale) {
      var d, dDim, e, i, p, s, sDim, w, _i, _j, _k, _l, _len, _len1, _m, _n, _o, _ref, _ref1, _ref2, _ref3, _results, _results1;
      if (scale.normalize) {
        _ref = (function() {
          var _i, _len, _ref, _results;
          _ref = [source, destination];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            s = _ref[_i];
            _results.push(scale.normalize(s));
          }
          return _results;
        })(), source = _ref[0], destination = _ref[1];
      }
      this.source = new CharSeq(source);
      this.destination = new CharSeq(destination);
      this.scale = scale;
      this.sDim = sDim = source.length;
      this.dDim = dDim = destination.length;
      this.matrix = new Array(sDim + 1);
      for (i = _i = 0, _ref1 = this.sDim; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
        this.matrix[i] = new Array(dDim + 1);
      }
      this.root = new Cell(this, this.source, this.destination, 0, 0, 0);
      this.matrix[0][0] = this.root;
      if (this.scale.prepare) {
        this.scale.prepare(this);
      }
      _ref2 = (sDim ? (function() {
        _results = [];
        for (var _k = 1; 1 <= sDim ? _k <= sDim : _k >= sDim; 1 <= sDim ? _k++ : _k--){ _results.push(_k); }
        return _results;
      }).apply(this) : []);
      for (_j = 0, _len = _ref2.length; _j < _len; _j++) {
        i = _ref2[_j];
        p = this.matrix[i - 1][0];
        e = 'd';
        w = p.distance + scale.weigh(p, e, i, 0);
        this.matrix[i][0] = new Cell(this, this.source, this.destination, i, 0, w, p, e);
      }
      _ref3 = (dDim ? (function() {
        _results1 = [];
        for (var _m = 1; 1 <= dDim ? _m <= dDim : _m >= dDim; 1 <= dDim ? _m++ : _m--){ _results1.push(_m); }
        return _results1;
      }).apply(this) : []);
      for (_l = 0, _len1 = _ref3.length; _l < _len1; _l++) {
        i = _ref3[_l];
        p = this.matrix[0][i - 1];
        e = 'i';
        w = p.distance + scale.weigh(p, e, 0, i);
        this.matrix[0][i] = new Cell(this, this.source, this.destination, 0, i, w, p, e);
      }
      if (sDim && dDim) {
        for (s = _n = 1; 1 <= sDim ? _n <= sDim : _n >= sDim; s = 1 <= sDim ? ++_n : --_n) {
          for (d = _o = 1; 1 <= dDim ? _o <= dDim : _o >= dDim; d = 1 <= dDim ? ++_o : --_o) {
            this.c(s, d);
          }
        }
      }
    }

    Matrix.prototype.chart = function() {
      var cell, f, row, s, _i, _j, _len, _len1, _ref;
      s = '';
      f = this.nformat();
      _ref = this.matrix;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        for (_j = 0, _len1 = row.length; _j < _len1; _j++) {
          cell = row[_j];
          s += cell.chart(f);
        }
        s += "\n";
      }
      return s;
    };

    Matrix.prototype.finalCell = function() {
      return this.matrix[this.sDim][this.dDim];
    };

    Matrix.prototype.cell = function(s, d) {
      return this.matrix[s][d];
    };

    Matrix.prototype.list = function() {
      return this.l != null ? this.l : this.l = [];
    };

    Matrix.prototype.hash = function() {
      return this.h != null ? this.h : this.h = {};
    };

    Matrix.prototype.nformat = function() {
      var c, cell, ci, cm, i, m, row, _i, _j, _len, _len1, _ref;
      i = m = 0;
      _ref = this.matrix;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        for (_j = 0, _len1 = row.length; _j < _len1; _j++) {
          cell = row[_j];
          c = cell.cost();
          if (c == null) {
            continue;
          }
          c = Math.abs(c).toString();
          ci = c.replace(/(\d+)(\..*)?/, '$1').length;
          cm = c.replace(/[^.]+\.?((.*))/, '$1').length;
          if (ci > i) {
            i = ci;
          }
          if (cm > m) {
            m = cm;
          }
        }
      }
      return function(n) {
        var a, j, l, signum, x;
        if (n === ' ') {
          l = m ? i + m + 2 : i + 1;
          return ((function() {
            var _k, _results;
            _results = [];
            for (x = _k = 0; 0 <= l ? _k < l : _k > l; x = 0 <= l ? ++_k : --_k) {
              _results.push(' ');
            }
            return _results;
          })()).join('');
        } else {
          signum = n < 0 ? '-' : ' ';
          a = Math.abs(n);
          l = i - Math.trunc(a).toString().length;
          l = ((function() {
            var _k, _results;
            _results = [];
            for (j = _k = 0; 0 <= l ? _k < l : _k > l; j = 0 <= l ? ++_k : --_k) {
              _results.push(' ');
            }
            return _results;
          })()).join('');
          return l + signum + a.toFixed(m).toString();
        }
      };
    };

    Matrix.prototype.c = function(s, d) {
      var c1, c2, c3, d1, e, p, s1, w, w1, w2, w3;
      s1 = s - 1;
      d1 = d - 1;
      c3 = this.matrix[s1][d1];
      if (this.source.at(s1).c === this.destination.at(d1).c) {
        p = c3;
        w = c3.distance;
        e = 'a';
      } else {
        c1 = this.matrix[s1][d];
        c2 = this.matrix[s][d1];
        w1 = c1.distance + this.scale.weigh(c1, 'd', s, d);
        w2 = c2.distance + this.scale.weigh(c2, 'i', s, d);
        w3 = c3.distance + this.scale.weigh(c3, 's', s, d);
        if (w1 < w3) {
          if (w1 < w2) {
            p = c1;
            w = w1;
            e = 'd';
          } else {
            p = c2;
            w = w2;
            e = 'i';
          }
        } else if (w2 < w3) {
          p = c2;
          w = w2;
          e = 'i';
        } else {
          p = c3;
          w = w3;
          e = 's';
        }
      }
      return this.matrix[s][d] = new Cell(this, this.source, this.destination, s, d, w, p, e);
    };

    return Matrix;

  })();

  ed.analyzer = function(alg) {
    return new Analyzer(alg);
  };

  ed.lev = ed.levenshtein = function() {
    return new Analyzer({
      weigh: function(parent, edit, sourceOffset, destinationOffset) {
        return 1;
      }
    });
  };

  ed.cheapMargins = function(startOffset, endOffset, w1, w2, w3) {
    if (startOffset == null) {
      startOffset = 0;
    }
    if (endOffset == null) {
      endOffset = 0;
    }
    if (w1 == null) {
      w1 = 0.25;
    }
    if (w2 == null) {
      w2 = 1;
    }
    if (w3 == null) {
      w3 = 0;
    }
    return {
      isPrefixy: function(word, i) {
        var c;
        if (startOffset) {
          return (c = word.at(i - 1)) && c.isFront() && c.pre < startOffset;
        }
      },
      isSuffixy: function(word, i) {
        var c;
        if (endOffset) {
          return (c = word.at(i - 1)) && c.isBack() && c.post < endOffset;
        }
      },
      weigh: function(parent, edit, s, d) {
        var w;
        w = (function() {
          switch (edit) {
            case 'd':
              if (this.isSuffixy(parent.source, s) || this.isPrefixy(parent.source, s)) {
                return w1;
              }
              break;
            case 'i':
              if (this.isSuffixy(parent.destination, d) || this.isPrefixy(parent.destination, d)) {
                return w1;
              }
              break;
            case 's':
              if (this.isSuffixy(parent.source, s) && this.isSuffixy(parent.destination, d) || this.isPrefixy(parent.source, s) && this.isPrefixy(parent.destination, d)) {
                return w1;
              }
              break;
            default:
              return w3;
          }
        }).call(this);
        return w != null ? w : w = w2;
      }
    };
  };

}).call(this);
