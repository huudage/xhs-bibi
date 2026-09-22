# Tasks: 001-bibi-compare

**约定**：测试先行（每个测试任务先跑确认 FAIL 再实现）；每任务完成即勾选。

## Phase 1: 数据与夹具

- [x] T001 [US2] `demo/src/data/knowledge-table.js`：帐篷 9 维度目录（data-model §1 顺序与 hot_rank）
- [x] T002 [US2] `demo/src/data/notes-tent.js`：12 篇 mock 笔记（t_001…t_012；t_011 报备商单；snippet 所需原文句全部内嵌）
- [x] T003 [US2] `demo/src/data/mock-tuples.js`：抽取结果查表（每笔记 0-N 条元组；snippet=原文子串；t_011 报备元组并入耐久组）

## Phase 2: 测试（先红）

- [x] T010 [US2] `demo/tests/extractor.test.js`：prompt 含铁律关键词；mockLLM 按 note_id 返回；未选维度零元组；元组字段齐
- [x] T011 [US3] `demo/tests/assembler.test.js`：分群/合并/lack/diff 判定/折叠/plusPool/报备降权/幻觉丢弃/红线拒收/客观行标签/无数据/通用冲突并列/行排序/crowds 归一化
- [x] T012 [US1] `demo/tests/integration.test.js`：buildReport 3件×4维（行数/折叠/追加池/统计）；2 件 SKU；appendDimension 走同管线
- [x] T013 运行 `node --test demo/tests/` 确认全部 FAIL（模块未实现）

## Phase 3: 管线实现（转绿）

- [x] T020 [US2] `demo/src/pipeline/llm-mock.js`：createMockLLM（同签名，正则取 note_id 查表）
- [x] T021 [US2] `demo/src/pipeline/extractor.js`：extractFromNotes（真实 prompt 组装+注入+解析校验）
- [x] T022 [US3/US4] `demo/src/pipeline/assembler.js`：assemble 九条规则契约
- [x] T023 [US1] `demo/src/pipeline/index.js`：buildReport / appendDimension
- [x] T024 `node --test demo/tests/` 全绿

## Phase 4: 渲染接线与回归

- [x] T030 [US1] `demo/dimensions.html`：维度 chips 改由知识表驱动（layer 分组 + hot_rank 前4预勾），选择写入 bb_dims
- [x] T031 [US1] `demo/report.html`：删除硬编码 ROWS/FOLD_ROW/PLUS_POOL，改 consume buildReport；＋追加调 appendDimension；折叠/人群筛选/溯源/收尾交互保留
- [x] T032 浏览器回归：链路A（点点预填3件）与链路B（星标篮2-3件）报告渲染；＋追加维度；人群筛选重排；溯源浮层；折叠行展开
- [x] T033 文档同步：board-A 新增 F40；PRD §4.2 标注管线已真实落地；项目记忆更新

## Dependencies

T010-T012 依赖 T001-T003（夹具被测试引用）；T020-T024 依赖测试先红；T030-T032 依赖 T024。
