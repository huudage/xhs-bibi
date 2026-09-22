(function(root,factory){ if(typeof module==='object'&&module.exports) module.exports=factory(); else root.BibiMockLLM=factory(); })(typeof self!=='undefined'?self:globalThis, function(){
  var TUPLES_TABLE = {};
  var g = (typeof globalThis !== 'undefined') ? globalThis : self;
  try { TUPLES_TABLE = require('../data/mock-tuples.js').TUPLES || {}; } catch (e) {}
  if (!Object.keys(TUPLES_TABLE).length && g.BibiMockTuples) TUPLES_TABLE = g.BibiMockTuples.TUPLES || {};

  // 与真实 LLM 适配器同签名：complete({system,user}) → Promise<JSON字符串>
  // user 为 {"dimensions":[...],"note":{...}} 的 JSON 串，从 note.note_id 查表返回
  function createMockLLM(){
    return {
      complete: function(args){
        var user = (args && args.user) || '';
        var req;
        try { req = JSON.parse(user); } catch (e) { req = null; }
        var rows = (req && req.note && TUPLES_TABLE[req.note.note_id]) || [];
        var dims = (req && req.dimensions) || null;
        var out = rows.filter(function(t){ return !dims || dims.indexOf(t.dimension) !== -1; });
        return Promise.resolve(JSON.stringify(out));
      }
    };
  }
  return { createMockLLM: createMockLLM };
});
