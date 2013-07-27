var Table = classify("Table", {
  static: {
    genkey: (function() {
      var i = 0;
      return function() {
        return '%___table_key_' + i++ + '___';
      }
    })(),
    keying: function keying(obj) {
      var type_name = type(obj).name;
      var key;
      switch (type_name) {
      case 'string':
        break;
      case 'int':
      case 'num':
        key = obj+'';
        break;
      case 'sym':
        key = ((obj === nil) ? 'nil' :
               (obj === t)   ? 't' :
               obj.name);
        break;
      case 'cons':
        key = keying(car(obj)) + keying(cdr(obj));
        break;
      default:
        obj.key_for_table = obj.key_for_table || Table.genkey();
        key = obj.key_for_table;
        break;
      }
      return type_name + ':' + key;
    }
  },
  property: { src: null, n: 0 },
  method: {
    init: function() {
      this.src = {};
    },
    put: function(key, val) {
      key = Table.keying(key);
      if (!(key in this.src)) this.n++;
      this.src[key] = val;
    },
    get: function(key) {
      key = Table.keying(key);
      return this.src[key] || nil;
    },
    rem: function(key) {
      key = Table.keying(key);
      if (key in this.src) {
        this.n--;
        delete this.src[key];
      }
      return nil;
    },
    stringify_content: function() {
      return '()'; // TODO: mendokuse.
    }
  }
});
