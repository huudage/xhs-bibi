(function(root,factory){ if(typeof module==='object'&&module.exports) module.exports=factory(); else root.BibiExtractor=factory(); })(typeof self!=='undefined'?self:globalThis, function(){
  // PRD §3.2 维度抽取器「忠实转述者」系统提示词（原文铁律 + 输出格式约定）
  var SYSTEM_PROMPT = [
    '你是小红书笔记的维度抽取器。任务：从给定笔记中，抽取与指定品类知识表维度相关的陈述元组。',
    '',
    '铁律：',
    '1. 只抽取笔记明确陈述的内容，禁止推断、外推或用常识补全',
    '2. 每条元组必含：维度｜结论（忠实转述原文语义，不加工不强化）｜人群标签（作者/提及者的可识别特征：身高体重、肤质、使用场景；无法识别标"通用"）｜证据强度（实测视频/实测图文/开箱/观点陈述）｜原文片段（溯源用）',
    '3. 未提及的维度输出"未提及"，禁止填充',
    '4. 保留原文情感强度（"超级显白"保留强度词），不改写为你的语言',
    '5. 不判断笔记是否广告（报备标记由上游数据提供）',
    '',
    '输出格式：只输出一个 JSON 数组，不要输出任何其他内容。每个元素形如：',
    '{"dimension":"维度名","conclusion":"结论","crowd_tag":"人群标签","evidence_level":"video_test|image_test|unbox|opinion","snippet":"原文片段"}',
    '用户请求中未提及的维度不要输出任何元素。'
  ].join('\n');

  async function extractFromNotes(p){
    var notes = p.notes || [], dimensions = p.dimensions || [], llm = p.llm;
    var tuples = [], userPromptChars = 0;
    for (var i = 0; i < notes.length; i++) {
      var note = notes[i];
      var user = JSON.stringify({ dimensions: dimensions, note: note });
      userPromptChars += user.length;
      var raw = await llm.complete({ system: SYSTEM_PROMPT, user: user });
      var arr;
      try { arr = JSON.parse(raw); } catch (e) {
        throw new Error('LLM返回非法JSON（note ' + note.note_id + '）');
      }
      if (!Array.isArray(arr)) throw new Error('LLM返回非数组（note ' + note.note_id + '）');
      for (var j = 0; j < arr.length; j++) {
        var t = arr[j];
        if (!t || typeof t !== 'object') continue;
        if (typeof t.dimension !== 'string' || dimensions.indexOf(t.dimension) === -1) continue;
        var ok = ['conclusion', 'crowd_tag', 'evidence_level', 'snippet'].every(function(k){
          return typeof t[k] === 'string' && t[k];
        });
        if (!ok) continue;
        // note_id/sku_id 由抽取器按当前笔记补齐，LLM 无权指定笔记身份
        tuples.push({
          note_id: note.note_id,
          sku_id: note.sku_id,
          dimension: t.dimension,
          conclusion: t.conclusion,
          crowd_tag: t.crowd_tag,
          evidence_level: t.evidence_level,
          snippet: t.snippet
        });
      }
    }
    return { tuples: tuples, meta: { systemPrompt: SYSTEM_PROMPT, userPromptChars: userPromptChars } };
  }

  return { extractFromNotes: extractFromNotes };
});
