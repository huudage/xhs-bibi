(function(root,factory){ if(typeof module==='object'&&module.exports) module.exports=factory(); else root.BibiPipeline=factory(); })(typeof self!=='undefined'?self:globalThis, function(){
  var NotesData, KT, MockLLM, Extractor, Assembler, SKU_INDEX;

  function load(){
    if (NotesData) return;
    var g = typeof globalThis !== 'undefined' ? globalThis : root;
    if (typeof require === 'function') {
      NotesData = require('../data/notes-tent.js').NOTES.concat(require('../data/notes-suit.js').NOTES);
      KT = require('../data/knowledge-table.js').TABLE;
      MockLLM = require('./llm-mock.js');
      Extractor = require('./extractor.js');
      Assembler = require('./assembler.js');
      SKU_INDEX = (require('../../assets/demo.js') || {}).SKUS || {};
    } else {
      NotesData = g.BibiNotes.NOTES;
      KT = g.BibiKnowledgeTable.TABLE;
      MockLLM = g.BibiMockLLM;
      Extractor = g.BibiExtractor;
      Assembler = g.BibiAssembler;
      SKU_INDEX = g.SKUS || {};
    }
  }

  // 检索层 demo 化：直传该组 SKU 的全部 mock 笔记（F37）；
  // 抽取请求覆盖该类目知识表全部维度，使汇编层可对未选维度做折叠判定
  async function buildReport(p){
    load();
    var skuIds = p.skuIds || [], dimNames = p.dimNames || [];
    var llm = p.llm || MockLLM.createMockLLM();
    // 类目边界（F46）：整组按首个 SKU 的类目取知识表，跨类目维度不进报告
    var cat = (SKU_INDEX[skuIds[0]] || {}).category || 'tent';
    var KTc = KT.filter(function(d){ return d.category === cat; });
    var notes = NotesData.filter(function(n){ return skuIds.indexOf(n.sku_id) !== -1; });
    var extracted = await Extractor.extractFromNotes({
      notes: notes,
      dimensions: KTc.map(function(d){ return d.name; }),
      llm: llm
    });
    var report = Assembler.assemble({
      skuIds: skuIds, dims: dimNames, tuples: extracted.tuples,
      notes: notes, skuIndex: SKU_INDEX, knowledgeTable: KTc
    });
    report.meta = extracted.meta;
    return report;
  }

  // 追加维度：与初始维度同管线重跑（F38），返回新报告对象
  async function appendDimension(p){
    var dims = p.report.rows.map(function(r){ return r.dim; }).concat([p.dimName]);
    return buildReport({ skuIds: p.report.skuIds, dimNames: dims, llm: p.llm });
  }

  return { buildReport: buildReport, appendDimension: appendDimension };
});
