var Reader = classify("Reader", {

  static: {
    EOF:              new Object(),
    DOT:              new Object(),
    LPAREN:           new Object(),
    RPAREN:           new Object(),
    LBRACK:           new Object(),
    RBRACK:           new Object(),
    LBRACE:           new Object(),
    RBRACE:           new Object(),
    QUOTE:            Symbol.get('quote'),
    QUASIQUOTE:       Symbol.get('quasiquote'),
    UNQUOTE:          Symbol.get('unquote'),
    UNQUOTE_SPLICING: Symbol.get('unquote-splicing'),
    NUMBER_PATTERN:   /^[-+]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][-+]?[0-9]+)?$/,
    NUMBER_UNIT_TBL:  { 'x':16, 'd':10, 'o':8, 'b':2 },
    WHITE_SPACES:     String.fromCharCode(9,10,11,12,13,32),
    ESCAPED_CHAR_TBL: (function() {
      var tbl = {
        'null':   0, 'nul':       0,  'backspace':  8,
        'tab':    9, 'linefeed': 10,  'newline':   10,
        'vtab':  11, 'page':     12,  'return':    13,
        'space': 32, 'rubout':  127,
      };
      for (var t in tbl) tbl[t] = String.fromCharCode(tbl[t]);
      return tbl;
    })(),
    ESCAPED_STR_TBL:  { 'n':'\n', 'r':'\r', 's':'\s', 't':'\t' }
  },

  property: {
    str: '',
    i: 0,
    slen: 0,
  },

  method: {
    init: function() {},

    load_source: function(str) {
      this.str = str;
      this.slen = str.length;
      this.i = 0;
    },

    whitespace_p: function(c) {
      return (-1 < Reader.WHITE_SPACES.indexOf(c));
    },

    delimited: function(c) {
      return this.whitespace_p(c) || (-1 < '()[]{}";'.indexOf(c));
    },

    number_p: function(c) {
      return (-1 < '0123456789+-.'.indexOf(c));
    },

    readable_symbol_p: function(c) {
      return c === '|';
    },

    reader_macro_p: function(c) {
      return c === '#';
    },

    read_reader_macro: function(c) {
      if (this.i < this.slen) {
        if (c === '\\') return this.read_char();
        if (c === '/')  return this.read_regexp();
      }
      var tok = this.read_thing();
      if (tok.length === 0) throw new Error("unexpected end-of-file while reading macro-char #" + c);
      var unit = Reader.NUMBER_UNIT_TBL[c];
      if (unit) return parseInt(tok, unit);
      else      throw new Error("invalid macro character #" + c);
    },

    read_char: function() {
      var c = this.read_thing(), l, e;
      if ((l = c.length) == 1) return Char.get(c);
      if (l == 0) { // specified char was a delimiter.
        return Char.get(this.str[this.i++]);
      }
      if (e = Reader.ESCAPED_CHAR_TBL[c]) {
        return Char.get(e);
      }
      if (c.match(/^0([0-7]{1,3})$/)) {
        e = String.fromCharCode(parseInt(RegExp.$1, 8))
        return Char.get(e);
      }
      if (c.match(/^(?:u([0-9a-fA-F]{1,4})|U([0-9a-fA-F]{1,6}))$/)) {
        e = String.fromCharCode(parseInt(RegExp.$1 || RegExp.$2, 16))
        return Char.get(e);
      }
      throw new Error("invalid char declaration \"" + c + "\"");
    },

    read_list: function(type) {
      type = type || 'parenthesized';
      var lis = nil;
      while (true) {
        var token = this.read_token();
        switch (token) {
        case Reader.EOF:
          throw new Error("unexpected end-of-file while reading list");
        case Reader.RPAREN:
          if (type !== 'parenthesized') throw new Error(type + " list terminated by parenthesis");
          return nreverse(lis, nil);
        case Reader.RBRACK:
          if (type !== 'bracketed')     throw new Error(type + " list terminated by bracket");
          return nreverse(lis, nil);
        case Reader.RBRACE:
          if (type !== 'braced')        throw new Error(type + " list terminated by brace");
          return nreverse(lis, nil);
        case Reader.LPAREN:
          token = this.read_list();
          break;
        case Reader.LBRACK:
          token = this.read_blist();
          break;
        case Reader.LBRACE:
          token = this.read_clist();
          break;
        case Reader.DOT:
          if (lis === nil) throw new Error("misplaced dot('.') while reading list");
          var rest = this.read_expr();
          if (rest === Reader.DOT) throw new Error("misplaced dot('.') while reading list");
          switch (this.read_token()) {
          case Reader.EOF:
            throw new Error("unexpected end-of-file while reading list");
          case Reader.RPAREN:
            if (type !== 'parenthesized') throw new Error(type + " list terminated by parenthesis");
            return nreverse(lis, rest);
          case Reader.RBRACK:
            if (type !== 'bracketed')     throw new Error(type + " list terminated by bracket");
            return nreverse(lis, rest);
          case Reader.RBRACE:
            if (type !== 'braced')        throw new Error(type + " list terminated by brace");
            return nreverse(lis, rest);
          default:
            throw new Error("more than one item following dot('.') while reading list");
          }
        }
        lis = cons(token, lis);
      }
    },

    read_blist: function() {
      var body = this.read_list('bracketed');
      return cons(Symbol.get('***cut-fn***'), cons(body, nil));
    },

    read_clist: function() {
      var body = this.read_list('braced');
      return cons(Symbol.get('table'), body);
    },

    read_thing: function() {
      var thing = '';
      while (this.i < this.slen) {
        var c = this.str[this.i];
        if (this.delimited(c)) {
          return thing;
        }
        thing += c;
        this.i++;
      }
      return thing;
    },

    read_number: function() {
      var i_bk = this.i;
      var tok = this.read_thing();
      if (tok.length === 0) return Reader.EOF;
      if (tok === '.')      return Reader.DOT;
      if (tok === '+inf.0') return Infinity;
      if (tok === '-inf.0') return -Infinity;
      if (tok.match(Reader.NUMBER_PATTERN))
        return this.make_number(tok);
      // This will be not a number. restore i pos.
      this.i = i_bk;
      return this.read_symbol();
    },

    make_number: function(tok) {
      var n = parseFloat(tok);
      // TODO flaction, imagine, +pattern.
      if (isNaN(n)) throw new Error("parsing failed the number " + tok);
      return n;
    },

    read_readable_symbol: function() {
      var c, acc = '';
      while (this.i < this.slen) {
        c = this.str[this.i++];
        if (c === '|') {
          return coerce(acc, s_sym);
        } else {
          acc += c;
        }
      }
      throw new Error("unexpected end-of-file while reading symbol");
    },

    read_symbol: function() {
      var tok = '', start_sb = false;
      while (this.i < this.slen) {
        var c = this.str[this.i];
        if (this.delimited(c)) {
          if (c === '[') {
            var s  = this.i;
            this.i++;
            var n1 = this.read_expr();
            var n2 = this.read_token();
            if (n2 === Reader.RBRACK && !(n1 instanceof Cons)) {
              tok += this.str.slice(s, this.i);
              continue;
            } else {
              this.i = s;
            }
          }
          break;
        }
        tok += c;
        this.i++;
      }
      if (tok.length === 0) return Reader.EOF;
      return this.make_symbol(tok, false);
    },

    make_symbol: function(tok, readable) {
      if (tok === 'nil') return nil;
      if (tok === 't') return true;
      return Symbol.get(tok, readable);
    },

    read_string: function(delimiter, type, escape_only_delimiter) {
      delimiter = delimiter || '"';
      type = type || 'string';
      var str = '', esc = false;
      while(this.i < this.slen) {
        var c = this.str[this.i++];
        // TODO more Escape patterns.
        if (esc) {
          esc = false;
          var escaped_char = Reader.ESCAPED_STR_TBL[c];
          if (escape_only_delimiter && !escaped_char && c !== delimiter) {
            str += '\\' + c;
          } else {
            if (escaped_char) {
              str += escaped_char;
            } else if (c === 'u' &&
                       this.i + 3 < this.slen &&
                       this.str.slice(this.i, this.i + 4).match(/^([0-9a-fA-F]{4})$/))
            {
              var n = parseInt(RegExp.$1, 16);
              str += String.fromCharCode(n);
              this.i += 4;
            } else {
              str += c;
            }
          }
        } else {
          switch(c) {
          case '\\':
            esc = true;
            break;
          case delimiter:
            return str;
          default:
            str += c;
            break;
          }
        }
      }
      throw new Error("unexpected end-of-file while reading " + type);
    },

    read_regexp: function() {
      var str = this.read_string('/', 'regx', true);
      return list(Symbol.get('regex'), str);
    },

    read_token: function() {
      var c = '', tmp = '';
      outer:
      while (true) {
        if (this.slen <= this.i) return Reader.EOF;
        c = this.str[this.i++];
        if (this.whitespace_p(c)) { continue; }
        if (this.number_p(c)) { this.i--; return this.read_number(); }
        if (this.readable_symbol_p(c)) { return this.read_readable_symbol(); }
        if (this.reader_macro_p(c)) {
          c = this.str[this.i++];
          if (c === '|') {
            c = '';
            while (this.i < this.slen) {
              tmp = c;
              c = this.str[this.i++];
              if (tmp+c === '|#') continue outer;
            }
            return Reader.EOF;
          }
          return this.read_reader_macro(c);
        }
        switch (c) {
        case ";":
          while (this.i < this.slen) {
            c = this.str[this.i++];
            if (c === '\n' || c === '\r') continue outer;
          }
          return Reader.EOF;
        case '"': return this.read_string();
        case '(': return Reader.LPAREN;
        case ')': return Reader.RPAREN;
        case '[': return Reader.LBRACK;
        case ']': return Reader.RBRACK;
        case '{': return Reader.LBRACE;
        case '}': return Reader.RBRACE;
        case "'": {
          var obj = this.read_expr();
          if (obj === Reader.EOF) throw new Error("unexpected end-of-file following quotation-mark(')");
          return cons(Reader.QUOTE, cons(obj, nil));
        }
        case "`": {
          var obj = this.read_expr();
          if (obj === Reader.EOF) throw new Error("unexpected end-of-file following backquotation-mark(`)");
          return cons(Reader.QUASIQUOTE, cons(obj, nil));
        }
        case ',':
          if (this.slen <= this.i) throw new Error("unexpected end-of-file following comma(,)");
          c = this.str[this.i++];
          if (c === '@') {
            var obj = this.read_expr();
            return cons(Reader.UNQUOTE_SPLICING, cons(obj, nil));
          }
          this.i--;
          return cons(Reader.UNQUOTE, cons(this.read_expr(), nil));
        default:
          this.i--;
          return this.read_symbol();
        }
      }
    },

    read_expr: function() {
      var token = this.read_token();
      if (token === Reader.RPAREN) throw new Error("unexpected closing parenthesis");
      if (token === Reader.RBRACK) throw new Error("unexpected closing bracket");
      if (token === Reader.RBRACE) throw new Error("unexpected closing brace");
      if (token === Reader.LPAREN) return this.read_list();
      if (token === Reader.LBRACK) return this.read_blist();
      if (token === Reader.LBRACE) return this.read_clist();
      return token;
    },

    completed_p: function() {
      return (this.slen <= this.i);
    },

    read: function(str) {
      if (str) this.load_source(str);
      return this.read_expr();
    }
  }
});
ArcJS.Reader = Reader;
