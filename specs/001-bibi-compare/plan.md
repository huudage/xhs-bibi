# Implementation Plan: 001-bibi-compare

**架构对齐**：PRD §4.2 管线图。本计划只实现「检索层(mock) → 抽取层 → 汇编层 → 渲染层」中可真实落地的部分。

## 1. 技术选型与理由

| 决策 | 选择 | 理由 |
|------|------|------|
| 语言/运行时 | ES5+ JavaScript（UMD 模块） | demo 为静态 HTML（file:// 打开，ES Module 会被 CORS 拦截）；测试用 Node 24 内置 `node --test`，零依赖零构建 |
| LLM 接入 | 依赖注入适配器 `complete({system, user}) → Promise<json字符串>` | PRD §4.2 关键决策②：mock 适配器与真实接口同签名，接真接口只换适配器 |
| 抽取层 | **真实代码**：组装 PRD §3.2 系统提示词 + 解析/校验 LLM 返回；LLM 本体为 mock 查表 | prompt 与解析链路是真实资产，直接迁移到真 LLM |
| 汇编层 | **全真实**纯函数规则代码 | spec US3 的全部规则可确定性测试——这正是"抽取质量"的评测载体 |
| 渲染层 | report.html 消费管线 JSON 重写数据来源，UI 交互（折叠/筛选/溯源/收尾）保持既有实现 | 交互形态已验收，只换数据层 |

## 2. 模块布局

```
demo/
  src/
    data/knowledge-table.js   # 品类知识表（帐篷）：维度目录+layer+hot_rank（PRD §4.3 CategoryDimension）
    data/notes-tent.js        # mock笔记库 12 篇（PRD §4.2.1 例子A，snippet=原文子串）
    data/mock-tuples.js       # mockLLM 的"抽取结果"查表：note_id → 证据元组数组（含1条报备）
    pipeline/extractor.js     # 抽取器：真实 prompt 组装+LLM注入+解析（PRD §3.2 忠实转述者）
    pipeline/llm-mock.js      # mockLLM 适配器（同签名；从 user prompt 解析 note_id 查表返回）
    pipeline/assembler.js     # 汇编器：校验/合并/分群/冲突并列/样本标注/差异排序/折叠/降权/红线/客观行
    pipeline/index.js         # buildReport({skuIds, dimNames, llm}) → 报告JSON（检索层mock=直传全部笔记）
  tests/
    extractor.test.js  assembler.test.js  integration.test.js
```

- UMD 骨架：`(function(root,factory){ if(typeof module==='object'&&module.exports) module.exports=factory(); else root.<NAME>=factory(); })(typeof self!=='undefined'?self:globalThis, function(){...return api})`
- 页面加载顺序：`src/data/*` → `src/pipeline/*` → 页面脚本。

## 3. 关键算法（汇编层）

1. **元组校验**（先于一切）：必填字段齐 → snippet ⊆ 笔记原文 → 结论与 snippet 分词交集≥1 → 结论不含导购词表。失败计入 `stats.discarded / stats.violations`；discarded/总数>10% → `meta.needsPromptReview=true`。
2. **客观行**（规则层）：价格=`¥{price}`，重量/容纳人数从 tags 正则提取（`/[\d.]+kg/`、`/人$/`）；事实标签=组内 min 计算。
3. **主观行**：按 (sku, dim) 收元组 → 按 (crowd_tag, conclusion) 合并 → 组内 lvl 取最强、n 计数、lack=(n<3)、snips 排序=(isReported 升序, 级别降序, note 序)。
4. **冲突并列**：同 (sku,dim,crowd) 出现多个不同 conclusion 组且 crowd=通用 → 组间标 divergent；不同 crowd → 正常分群（这就是分群本身）。
5. **diff 判定**：该维度下**全部参与 SKU 均有证据** 且 跨 SKU 结论集合>1 → diff=true（F17"商品间有差异且证据充分"的可测化）。
6. **行排序**：`(客观层优先, -diff, anyLack, hotRank)`——客观行置顶（F31 客观上/主观下）；主观行内 diff 置前，同为非 diff 时无 lack 者优先（"样本不足排序下沉"，PRD §5），再按热度。
7. **折叠行**：未选维度中，"全部 SKU 均有证据 且 跨 SKU 唯一结论数=1"者 → foldRows；渲染为"结论一致（点开看）"。
8. **plusPool**：知识表序 − 已选 − 折叠。
9. **crowds 归一化**：露营新手→新手、通勤党→通勤、含158→158、含170→170+；通用/公园野餐党/自驾党等无 chip 键者不进行级 crowds。

## 4. 测试策略（test-first）

- extractor：prompt 含铁律关键词；mockLLM 按 note_id 返回元组；未提及维度零元组。
- assembler：US3/US4 逐条断言（分群/合并/lack/diff/折叠/降权/幻觉丢弃/红线拒收/客观标签/无数据/冲突并列/排序/crowds）。
- integration：buildReport 3件×4维度 → 4行+防晒折叠+追加池[耐久性,防水,便携性,容纳人数]；2件 SKU；追加维度重跑管线产出新行。

## 5. Phase -1 Gates（spec-kit 简约门）

- Simplicity：单"项目"（demo 静态站），无新框架、无构建、无新依赖 ✓
- Anti-Abstraction：不为"未来品类"抽象注册机制——知识表就是数据文件，加品类=加文件 ✓（接口签名留扩展点即可）
- Test-First：先写测试并确认失败，再实现 ✓

## 6. 风险

- 硬编码版面内容与管线产出存在微小差异（如 便携性 追加后按规则会带「差」角标）——以规则产出为准，属 spec 正确行为，向用户说明。
