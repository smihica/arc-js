var Reader = classify("Reader", {

  static: {
    EOF:    new Object(),
    DOT:    new Object(),
    LPAREN: new Object(),
    RPAREN: new Object(),
    LBRACK: new Object(),
    RBRACK: new Object(),
    QUOTE:            Symbol.get('quote'),
    QUASIQUOTE:       Symbol.get('quasiquote'),
    UNQUOTE:          Symbol.get('unquote'),
    UNQUOTE_SPLICING: Symbol.get('unquote-splicing'),
    NUMBER_PATTERN: /^[-+]?([0-9]+(\.[0-9]*)?|\.[0-9]+)([eE][-+]?[0-9]+)?$/
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
      return (-1 < String.fromCharCode(9,10,11,12,13,32).indexOf(c));
    },

    delimited: function(c) {
      return this.whitespace_p(c) || (-1 < '()[]";'.indexOf(c));
    },

    number_p: function(c) {
      return (-1 < '0123456789+-.'.indexOf(c));
    },

    reader_macro_p: function(c) {
      return c === '#';
    },

    read_reader_macro: function(c) {
      if (c === '\\') {
        if (this.i < this.slen) return Char.get(this.str[this.i++]);
      }
      if (c === '/') {
        if (this.i < this.slen) return this.read_regexp();
      }
      var tok = this.read_thing();
      if (tok.length === 0) throw new Error("unexpected end-of-file while reading macro-char #" + c);
      switch (c) {
      case 'x':
        return parseInt(tok, 16);
      case 'd':
        return parseInt(tok, 10);
      case 'o':
        return parseInt(tok, 8);
      case 'b':
        return parseInt(tok, 2);
      }
    },

    read_list: function(bracketed) {
      var token;
      var lis = nil;
      while ((token = this.read_token()) !== Reader.EOF) {
        if (token === Reader.RPAREN) {
          if (bracketed) throw new Error("bracketed list terminated by parenthesis");
          return nreverse(lis, nil);
        }
        if (token === Reader.RBRACK) {
          if (!bracketed) throw new Error("parenthesized list terminated by bracket");
          return nreverse(lis, nil);
        }
        if (token === Reader.LPAREN) {
          lis = cons(this.read_list(), lis);
          continue;
        }
        if (token === Reader.LBRACK) {
          lis = cons(this.read_blist(), lis);
          continue;
        }
        if (token === Reader.DOT) {
          if (lis === nil) throw new Error("misplaced dot('.') while reading list.");
          var rest = this.read_expr();
          if (rest === Reader.DOT) throw new Error("misplaced dot('.') while reading list.");
          token = this.read_token();
          if (token === Reader.RPAREN) {
            if (bracketed) throw new Error("bracketed list terminated by parenthesis.");
            lis = nreverse(lis, rest);
            return lis;
          }
          if (token === Reader.RBRACK) {
            if (!bracketed) throw new Error("parenthesized list terminated by bracket.");
            lis = nreverse(lis, rest);
            return lis;
          }
          if (token === Reader.EOF) throw new Error("unexpected end-of-file while reading list.");
          throw new Error("more than one item following dot('.') while reading list.");
        }
        lis = cons(token, lis);
      }
      throw new Error("unexpected end-of-file while reading list");
    },

    read_blist: function() {
      var body = this.read_list(true);
      return cons(Symbol.get('%shortfn'), cons(body, nil));
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
      var tok = this.read_thing();
      if (tok.length === 0) return Reader.EOF;
      if (tok === '.')      return Reader.DOT;
      if (tok === '+inf.0') return Infinity;
      if (tok === '-inf.0') return -Infinity;
      if (tok.match(Reader.NUMBER_PATTERN))
        return this.make_number(tok);
      return this.read_symbol(tok);
    },

    make_number: function(tok) {
      var n = parseFloat(tok);
      // TODO flaction, imagine, +pattern.
      if (n === NaN) throw new Error("parsing failed the number " + tok);
      return n;
    },

    read_symbol: function(tok) {
      if (arguments.length < 1) tok = this.read_thing();
      if (tok.length === 0) return Reader.EOF;
      return this.make_symbol(tok);
    },

    make_symbol: function(tok) {
      if (tok === 'nil') return nil;
      if (tok === 't') return true;
      return Symbol.get(tok);
    },

    read_string: function(delimiter, type, escape_only_delimiter) {
      delimiter = delimiter || '"';
      type = type || 'string';
      var str = '', esc = false;
      var escaped_char_tbl = {n: '\n', r: '\r', s: '\s', t: '\t'};
      while(this.i < this.slen) {
        var c = this.str[this.i++];
        // TODO more Escape patterns.
        if (esc) {
          esc = false;
          var escaped_char = ((escaped_char_tbl)[c]);
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
          continue;
        } else {
          switch(c) {
          case '\\':
            esc = true;
            continue;
          case delimiter:
            return str;
          default:
            str += c;
            continue;
          }
        }
      }
      throw new Error("unexpected end-of-file while reading " + type);
    },

    read_regexp: function() {
      var str = this.read_string('/', 'regexp', true);
      return list(Symbol.get('annotate'), list(Symbol.get('quote'), Symbol.get('regexp')), str);
    },

    read_token: function() {
      var c = '', tmp = '';
      outer:
      while (true) {
        if (this.slen <= this.i) return Reader.EOF;
        c = this.str[this.i++];
        if (this.whitespace_p(c)) { continue; }
        if (this.number_p(c)) { this.i--; return this.read_number(); }
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
      if (token === Reader.LPAREN) return this.read_list();
      if (token === Reader.LBRACK) return this.read_blist();
      return token;
    },

    read: function(str) {
      if (str) this.load_source(str);
      return this.read_expr();
    }
  }
});
ArcJS.Reader = Reader;
