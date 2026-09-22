(function(root,factory){ if(typeof module==='object'&&module.exports) module.exports=factory(); else root.BibiAssembler=factory(); })(typeof self!=='undefined'?self:globalThis, function(){
  var LEVEL_RANK = { video_test: 3, image_test: 2, unbox: 1, opinion: 0 };
  var LEVEL_LABEL = { video_test: '实测视频', image_test: '实测图文', unbox: '开箱', opinion: '观点陈述' };
  var FORBIDDEN = /建议买|推荐|更值得|最优|闭眼入|性价比之王|无脑入/;
  var CHIP_KEYS = ['158', '170+', '新手', '通勤'];
  var CHIP_LABELS = { '全部': '全部', '158': '158小个子', '170+': '170+', '新手': '露营新手', '通勤': '通勤党' };

  function tokens(s){
    var out = new Set();
    var words = s.match(/[A-Za-z0-9]+/g) || [];
    for (var i = 0; i < words.length; i++) out.add(words[i].toLowerCase());
    var cjk = (s.match(/[\u4e00-\u9fff]/g) || []).join('');
    for (var j = 0; j + 1 < cjk.length; j++) out.add(cjk.slice(j, j + 2));
    if (cjk.length === 1) out.add(cjk);
    return out;
  }
  function overlap(a, b){ for (var t of a) { if (b.has(t)) return true; } return false; }

  function normalizeCrowd(tag){
    if (!tag) return null;
    if (tag.indexOf('158') !== -1) return '158';
    if (tag.indexOf('170') !== -1) return '170+';
    if (tag.indexOf('新手') !== -1) return '新手';
    if (tag.indexOf('通勤') !== -1) return '通勤';
    return null;
  }

  // 校验顺序：必填（含笔记身份匹配）→ snippet⊆原文 → 结论↔snippet分词交集≥1 → 导购词表
  function makeCheck(noteById, ktNames){
    return function(t){
      if (!t || typeof t !== 'object') return 'discard';
      var note = noteById[t.note_id];
      if (!note) return 'discard';
      if (t.sku_id !== note.sku_id) return 'discard';
      if (typeof t.dimension !== 'string' || ktNames.indexOf(t.dimension) === -1) return 'discard';
      var keys = ['conclusion', 'crowd_tag', 'evidence_level', 'snippet'];
      for (var i = 0; i < keys.length; i++) {
        if (typeof t[keys[i]] !== 'string' || !t[keys[i]]) return 'discard';
      }
      if (!(t.evidence_level in LEVEL_RANK)) return 'discard';
      if (!note.text || note.text.indexOf(t.snippet) === -1) return 'discard';
      if (!overlap(tokens(t.conclusion), tokens(t.snippet))) return 'discard';
      if (FORBIDDEN.test(t.conclusion)) return 'violation';
      return 'pass';
    };
  }

  function objValue(s, dim){
    if (!s) return null;
    if (dim === '价格') return '¥' + s.price;
    if (dim === '重量') {
      var t = (s.tags || []).filter(function(x){ return /[\d.]+kg/.test(x); })[0];
      return t || null;
    }
    if (dim === '容纳人数') {
      var c = (s.tags || []).filter(function(x){ return /人$/.test(x); })[0];
      return c || null;
    }
    if (dim === '面料成分') {
      var f = (s.tags || []).filter(function(x){ return /混纺/.test(x); })[0];
      return f || null;
    }
    return null;
  }
  function numValue(s, dim){
    if (!s) return null;
    if (dim === '价格') return s.price;
    if (dim === '重量') {
      var t = (s.tags || []).filter(function(x){ return /[\d.]+kg/.test(x); })[0];
      return t ? parseFloat(t) : null;
    }
    return null;
  }

  // 合并键：(crowd_tag, conclusion)；组内 lvl 取最强、n 计数、lack=n<3；snips 排序=(isReported升序, 级别降序, 出现序)
  function mergeGroups(list, noteById){
    var map = new Map(), order = [];
    list.forEach(function(t, idx){
      var key = t.crowd_tag + '\u2502' + t.conclusion;
      if (!map.has(key)) {
        map.set(key, { conclusion: t.conclusion, crowd: t.crowd_tag, n: 0, level: null, snips: [], _max: -1, _first: order.length });
        order.push(key);
      }
      var g = map.get(key);
      var note = noteById[t.note_id] || {};
      g.n++;
      if (LEVEL_RANK[t.evidence_level] > g._max) { g._max = LEVEL_RANK[t.evidence_level]; g.level = t.evidence_level; }
      g.snips.push({
        text: t.snippet, noteId: t.note_id,
        isReported: !!note.is_reported, isPurchased: !!note.is_purchased,
        _rank: LEVEL_RANK[t.evidence_level], _idx: idx
      });
    });
    var groups = order.map(function(k){ return map.get(k); });
    var byCrowd = {};
    groups.forEach(function(g){ (byCrowd[g.crowd] = byCrowd[g.crowd] || []).push(g); });
    Object.keys(byCrowd).forEach(function(c){
      if (c === '通用' && byCrowd[c].length > 1) byCrowd[c].forEach(function(g){ g.divergent = true; });
    });
    groups.sort(function(a, b){ return (b.n - a.n) || (b._max - a._max) || (a._first - b._first); });
    groups.forEach(function(g){
      g.lack = g.n < 3;
      g.snips.sort(function(x, y){
        return ((x.isReported ? 1 : 0) - (y.isReported ? 1 : 0)) || (y._rank - x._rank) || (x._idx - y._idx);
      });
      g.snips = g.snips.map(function(s){ return { text: s.text, noteId: s.noteId, isReported: s.isReported, isPurchased: s.isPurchased }; });
      delete g._max; delete g._first;
    });
    return groups;
  }

  function assemble(p){
    var skuIds = p.skuIds || [], dims = p.dims || [], tuples = p.tuples || [];
    var notes = p.notes || [], skuIndex = p.skuIndex || {}, knowledgeTable = p.knowledgeTable || [];

    var noteById = {};
    notes.forEach(function(n){ noteById[n.note_id] = n; });
    var ktNames = knowledgeTable.map(function(d){ return d.name; });
    var ktByName = {};
    knowledgeTable.forEach(function(d){ ktByName[d.name] = d; });

    var check = makeCheck(noteById, ktNames);
    var passed = [], discarded = 0, violations = 0;
    tuples.forEach(function(t){
      var r = check(t);
      if (r === 'pass') passed.push(t);
      else if (r === 'violation') violations++;
      else discarded++;
    });
    var needsPromptReview = (discarded + passed.length) > 0 && discarded / (discarded + passed.length) > 0.10;

    var selected = new Set(dims);
    var rows = [], chipPresence = {};

    dims.forEach(function(dim){
      var kd = ktByName[dim];
      var row = {
        dim: dim,
        layer: kd ? (kd.layer === 'objective' ? '客观' : '主观') : '主观',
        diff: false, crowds: [], hotRank: kd ? kd.hot_rank : 99,
        cells: {}
      };
      if (kd && kd.layer === 'objective') {
        var minNum = null;
        if (dim === '价格' || dim === '重量') {
          var nums = skuIds.map(function(id){ return numValue(skuIndex[id], dim); }).filter(function(v){ return v != null; });
          if (nums.length) minNum = Math.min.apply(null, nums);
        }
        skuIds.forEach(function(id){
          var s = skuIndex[id];
          var v = objValue(s, dim);
          if (v == null) { row.cells[id] = null; return; }
          var cell = { type: 'obj', value: v };
          if (minNum != null && numValue(s, dim) === minNum) cell.tag = (dim === '价格') ? '最低价' : '最轻';
          row.cells[id] = cell;
        });
        row._sort = [0, 0, 0, row.hotRank];
      } else {
        var bySku = {};
        skuIds.forEach(function(id){ bySku[id] = []; });
        passed.forEach(function(t){ if (t.dimension === dim && bySku[t.sku_id]) bySku[t.sku_id].push(t); });
        var anyLack = false, crowds = new Set();
        skuIds.forEach(function(id){
          var list = bySku[id];
          if (!list.length) { row.cells[id] = null; return; }
          var groups = mergeGroups(list, noteById);
          groups.forEach(function(g){ if (g.lack) anyLack = true; });
          list.forEach(function(t){
            var c = normalizeCrowd(t.crowd_tag);
            if (c) { crowds.add(c); chipPresence[c] = true; }
          });
          row.cells[id] = { type: 'ev', groups: groups };
        });
        var evidenced = skuIds.every(function(id){ return row.cells[id]; });
        var concls = new Set();
        skuIds.forEach(function(id){
          (row.cells[id] && row.cells[id].groups || []).forEach(function(g){ concls.add(g.conclusion); });
        });
        row.diff = evidenced && concls.size > 1;
        row.crowds = CHIP_KEYS.filter(function(k){ return crowds.has(k); });
        row._sort = [1, row.diff ? 0 : 1, anyLack ? 1 : 0, row.hotRank];
      }
      rows.push(row);
    });
    // 行序：客观行置顶（客观上/主观下，F31）→ 主观行内 diff → 无lack → hotRank
    rows.sort(function(a, b){ return (a._sort[0] - b._sort[0]) || (a._sort[1] - b._sort[1]) || (a._sort[2] - b._sort[2]) || (a._sort[3] - b._sort[3]); });
    rows.forEach(function(r){ delete r._sort; });

    var foldRows = [];
    knowledgeTable.forEach(function(kd){
      if (selected.has(kd.name)) return;
      var list = passed.filter(function(t){ return t.dimension === kd.name && skuIds.indexOf(t.sku_id) !== -1; });
      if (!list.length) return;
      var evidenced = skuIds.every(function(id){ return list.some(function(t){ return t.sku_id === id; }); });
      if (!evidenced) return;
      var concls = new Set(list.map(function(t){ return t.conclusion; }));
      if (concls.size !== 1) return;
      foldRows.push({ dim: kd.name, conclusion: list[0].conclusion, layer: kd.layer === 'objective' ? '客观' : '主观' });
    });
    foldRows.sort(function(a, b){ return ktByName[a.dim].hot_rank - ktByName[b.dim].hot_rank; });

    var foldNames = new Set(foldRows.map(function(f){ return f.dim; }));
    var plusPool = knowledgeTable
      .filter(function(d){ return !selected.has(d.name) && !foldNames.has(d.name); })
      .map(function(d){ return d.name; });

    var crowdChips = [['全部', '全部']];
    CHIP_KEYS.forEach(function(k){ if (chipPresence[k]) crowdChips.push([CHIP_LABELS[k], k]); });

    return {
      skuIds: skuIds.slice(),
      rows: rows,
      foldRows: foldRows,
      plusPool: plusPool,
      crowdChips: crowdChips,
      stats: { tuples: passed.length, discarded: discarded, violations: violations, needsPromptReview: needsPromptReview }
    };
  }

  return { assemble: assemble, LEVEL_LABEL: LEVEL_LABEL, LEVEL_RANK: LEVEL_RANK };
});
