# Pipeline Contracts: 001-bibi-compare

浏览器/Node 双端 UMD 模块。全部纯函数或可注入依赖的异步函数。

## 1. 抽取层 `demo/src/pipeline/extractor.js` → `BibiExtractor`

```js
/**
 * 从笔记抽取证据元组（PRD §3.2「忠实转述者」）。
 * @param {Object} p
 * @param {Note[]}   p.notes        本次参与抽取的笔记
 * @param {string[]} p.dimensions   请求抽取的维度名列表
 * @param {LLM}      p.llm          适配器 { complete({system,user}) → Promise<string> }
 * @returns {Promise<{ tuples: EvidenceTuple[], meta: { systemPrompt, userPromptChars } }>}
 */
async function extractFromNotes({ notes, dimensions, llm })
```

**契约**：
- system prompt 必须包含 PRD §3.2 抽取器铁律（只转述禁推断/元组五要素/未提及禁填充/保留情感强度/不判广告）。
- user prompt 含维度目录 JSON 与单篇笔记 JSON（逐篇调用）。
- 返回值逐条校验必填字段；LLM 返回非法 JSON → 抛错（由上层降级，demo 不触发）。

## 2. LLM 适配器 `demo/src/pipeline/llm-mock.js` → `createMockLLM()`

```js
const llm = createMockLLM();      // { complete } 与真实适配器同签名
```

**契约**：从 user prompt 正则解析 `note_id`；查 mock-tuples 表；仅返回请求维度内的元组；立即 resolve。

## 3. 汇编层 `demo/src/pipeline/assembler.js` → `BibiAssembler`

```js
/**
 * 把证据元组汇编为对比报告（PRD §3.2「证据陈列师」，全部为确定性规则）。
 * @param {Object} p
 * @param {string[]} p.skuIds  参与对比 SKU（2-3）
 * @param {string[]} p.dims    已选维度名
 * @param {EvidenceTuple[]} p.tuples
 * @param {Note[]} p.notes     用于 snippet 溯源校验
 * @param {Object} skuIndex    { [skuId]: SKU }（客观行直读参数）
 * @param {CategoryDimension[]} knowledgeTable
 * @returns {CompareReport}
 */
function assemble({ skuIds, dims, tuples, notes, skuIndex, knowledgeTable })
```

**规则契约**（= spec US3/US4，全部可测）：
1. 校验顺序：必填 → snippet⊆原文 → 结论↔snippet 分词交集≥1 → 导购词表（建议买|推荐|更值得|最优|闭眼入|性价比之王|无脑入）。后两者失败分别计 discarded / violations；discarded/(discarded+passed)>10% → needsPromptReview。
2. 合并键：`(skuId, dimension, crowd_tag, conclusion)`；组 lvl=最强（video_test>image_test>unbox>opinion）；lack = n<3；snips 排序 isReported 升序优先。
3. diff = 全部 skuIds 均有该维度证据 且 跨 SKU 结论去重数>1。
4. 行排序键 `(客观层优先, -diff, anyLack, hotRank)`：客观行置顶（F31），主观行内 diff→lack→hotRank。
5. 折叠：未选维度 × 全部 SKU 有证据 × 跨 SKU 唯一结论数=1 → foldRows。
6. plusPool = 知识表序 − 已选 − 折叠。
7. crowds 归一化映射：露营新手→新手、通勤党→通勤、含"158"→158、含"170"→170+；其余（通用/公园野餐党/自驾党）不入行级 crowds。
8. 客观行直读：价格 `¥{price}`；重量取 tags 匹配 `/[\d.]+kg/`；容纳人数取 tags 匹配 `/人$/`；tag=组内最小值（最低价/最轻），其余行不标。
9. 冲突并列：同 (sku,dim,crowd='通用') 多组 → 各组 divergent=true（渲染"证据存在分歧"）。

## 4. 管线入口 `demo/src/pipeline/index.js` → `BibiPipeline`

```js
/**
 * 生成对比报告（检索层 demo 化：直传该组 SKU 全部 mock 笔记，F37）。
 * @param {Object} p { skuIds, dimNames, llm? }   llm 缺省= createMockLLM()
 * @returns {Promise<CompareReport>}
 */
async function buildReport({ skuIds, dimNames, llm })

/** 追加维度：与初始维度同管线（F38）。返回新报告对象。 */
async function appendDimension({ report, dimName, llm })
```

## 5. 渲染层（report.html）

- 输入：`buildReport` 输出 + localStorage(bb_skus/bb_dims)。
- 页面职责仅剩：表格渲染（维度=行/商品=列）、折叠/展开、人群筛选重排、溯源半屏浮层、＋追加（调 appendDimension）、三选一收尾（内存态终局）。
- **禁止**：页内出现任何维度×商品×结论的硬编码数据。
