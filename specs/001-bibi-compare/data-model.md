# Data Model: 001-bibi-compare

实体字段与 PRD §4.3 对齐；`*` 为管线内部新增实体。

## 1. 品类知识表 CategoryDimension（src/data/knowledge-table.js）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | dim_tent_space 等 |
| category | enum | demo 仅 `tent` |
| name | string | 展示名（空间/搭建体验/…） |
| layer | enum | objective / subjective |
| hot_rank | int | 热门预勾与排序依据（默认勾选=前4） |
| status | enum | demo 全部 `preset` |

帐篷知识表（按 hot_rank）：空间(主观,1) 搭建体验(主观,2) 价格(客观,3) 重量(客观,4) 耐久性(主观,5) 防水(主观,6) 便携性(主观,7) 防晒(主观,8) 容纳人数(客观,9)。

## 2. Mock笔记 Note（src/data/notes-tent.js）

| 字段 | 类型 | 说明 |
|------|------|------|
| note_id | string | note_t_001…note_t_012 |
| sku_id | string | 关联 SKU |
| type | enum | video_test / image_test / unbox / opinion |
| is_purchased / is_reported | bool | F11 标记；note_t_011 为报备商单（降权演示） |
| author_crowd | string | 作者自述人群（展示标"来自作者分享"，§7） |
| text | string | 笔记原文；**所有元组 snippet 必须为其子串** |

## 3. 证据元组 EvidenceTuple（src/data/mock-tuples.js，抽取层输出）

| 字段 | 类型 | 说明 |
|------|------|------|
| note_id / sku_id / dimension | string | dimension=知识表维度名 |
| conclusion | string | 忠实转述结论 |
| crowd_tag | string | 158 / 170+ / 露营新手 / 通勤党 / 公园野餐党 / 自驾党 / 通用 |
| evidence_level | enum | video_test / image_test / unbox / opinion（可与笔记 type 不同：unbox 笔记里的观点陈述） |
| snippet | string | 原文子串（溯源） |

## 4. *报告行 CompareRow（汇编层输出，渲染层消费）

```
CompareReport = {
  skuIds: string[],                          // 2-3 件
  rows: CompareRow[],                        // 已选维度，按排序规则
  foldRows: FoldRow[],                       // 未选但结论全一致
  plusPool: string[],                        // 可追加维度名
  crowdChips: [label, key][],                // 人群筛选chips（含"全部"）
  stats: { tuples, discarded, violations, needsPromptReview }
}
CompareRow = {
  dim, layer: '客观'|'主观', diff: bool, crowds: string[], hotRank,
  cells: { [skuId]: ObjCell | EvCell | null }   // null=无数据
}
ObjCell = { type:'obj', value: string, tag?: '最低价'|'最轻' }
EvCell  = { type:'ev', groups: Group[] }
Group   = { conclusion, crowd, n, level, lack: n<3, divergent?: bool,
            snips: [{ text, noteId, isReported, isPurchased }] }
FoldRow = { dim, conclusion, layer }
```

## 5. *LLM 适配器接口（依赖注入）

```
llm = { complete({ system, user }) → Promise<string(JSON数组)> }
```

mock 适配器：从 user prompt 中解析 note_id，查 mock-tuples 表返回该笔记元组。真实适配器（未来）替换此处，业务代码零改。

## 6. 对比任务 CompareTask（PRD §4.3，demo 仅以 bb_skus/bb_dims + 终局内存态预演）

entry 枚举：`diandian_card / product_bibi`（F25/F39）。
