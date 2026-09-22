const { test } = require('node:test');
const assert = require('node:assert/strict');
const { assemble } = require('../src/pipeline/assembler.js');

const KT = [
  { name: '空间', layer: 'subjective', hot_rank: 1 },
  { name: '搭建体验', layer: 'subjective', hot_rank: 2 },
  { name: '价格', layer: 'objective', hot_rank: 3 },
  { name: '重量', layer: 'objective', hot_rank: 4 },
  { name: '防晒', layer: 'subjective', hot_rank: 5 },
  { name: '容纳人数', layer: 'objective', hot_rank: 6 },
];
const SKU_INDEX = {
  a: { price: 100, tags: ['2人', '2.0kg', 'UPF50+'] },
  b: { price: 200, tags: ['3人', '3.0kg', 'UPF50+'] },
};
const NOTES = [
  { note_id: 'n1', sku_id: 'a', is_purchased: true, is_reported: false, text: '空间很大，一家人坐得下。收纳短，塞后备箱方便。大太阳不晒，UPF50+防晒够用。' },
  { note_id: 'n2', sku_id: 'b', is_purchased: true, is_reported: false, text: '空间很大，一家人坐得下。大太阳不晒，UPF50+防晒够用。' },
  { note_id: 'n3', sku_id: 'b', is_purchased: true, is_reported: false, text: '空间小了点，两个人刚好。大太阳不晒，UPF50+防晒够用。' },
  { note_id: 'n4', sku_id: 'a', is_purchased: true, is_reported: false, text: '背上就走，地铁通勤不累。' },
  { note_id: 'n5', sku_id: 'a', is_purchased: false, is_reported: true, text: '空间很大，一家人坐得下。' },
  { note_id: 'n6', sku_id: 'a', is_purchased: true, is_reported: false, text: '空间很大，一家人坐得下。' },
  { note_id: 'n7', sku_id: 'b', is_purchased: true, is_reported: false, text: '空间很大，一家人坐得下。' },
];
const T = (note, sku, dim, conclusion, crowd, level, snippet) =>
  ({ note_id: note, sku_id: sku, dimension: dim, conclusion, crowd_tag: crowd, evidence_level: level, snippet });
const run = (tuples, dims, skuIds = ['a', 'b']) =>
  assemble({ skuIds, dims, tuples, notes: NOTES, skuIndex: SKU_INDEX, knowledgeTable: KT });

test('客观行直读参数：价格/重量/容纳人数，事实标签只有最低价/最轻', () => {
  const r = run([], ['价格', '重量', '容纳人数']);
  const price = r.rows.find(x => x.dim === '价格');
  assert.equal(price.layer, '客观');
  assert.deepEqual(price.cells.a, { type: 'obj', value: '¥100', tag: '最低价' });
  assert.equal(price.cells.b.value, '¥200');
  assert.equal(price.cells.b.tag, undefined);
  const weight = r.rows.find(x => x.dim === '重量');
  assert.equal(weight.cells.a.value, '2.0kg');
  assert.equal(weight.cells.a.tag, '最轻');
  assert.equal(weight.cells.b.tag, undefined);
  const cap = r.rows.find(x => x.dim === '容纳人数');
  assert.equal(cap.cells.a.value, '2人');
  assert.equal(cap.cells.b.value, '3人');
  assert.equal(cap.cells.a.tag, undefined);
});

test('同维度不同人群分群，行级 crowds 归一化并生成 chips', () => {
  const tuples = [
    T('n1', 'a', '空间', '空间很大', '170+', 'video_test', '空间很大，一家人坐得下。'),
    T('n2', 'b', '空间', '空间很大', '通勤党', 'image_test', '空间很大，一家人坐得下。'),
  ];
  const r = run(tuples, ['空间']);
  const row = r.rows[0];
  assert.deepEqual(row.crowds, ['170+', '通勤']);
  assert.deepEqual(r.crowdChips.map(c => c[1]), ['全部', '170+', '通勤']);
  assert.equal(row.cells.a.groups.length, 1);
  assert.equal(row.cells.b.groups.length, 1);
});

test('合并：同人群同结论合并，级别取最强，n<3 标样本不足，报备证据排后', () => {
  const tuples = [
    T('n5', 'a', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('n1', 'a', '空间', '空间很大', '通用', 'opinion', '空间很大，一家人坐得下。'),
  ];
  const g = run(tuples, ['空间']).rows[0].cells.a.groups[0];
  assert.equal(g.n, 2);
  assert.equal(g.level, 'video_test');
  assert.equal(g.lack, true);
  assert.equal(g.snips[0].noteId, 'n1');
  assert.equal(g.snips[1].noteId, 'n5');
  assert.equal(g.snips[1].isReported, true);
  assert.equal(g.snips[0].isReported, false);

  const three = tuples.concat([T('n6', 'a', '空间', '空间很大', '通用', 'opinion', '空间很大，一家人坐得下。')]);
  assert.equal(run(three, ['空间']).rows[0].cells.a.groups[0].lack, false);
});

test('diff 判定：全部SKU有证据且结论有差异；缺证据SKU为无数据', () => {
  const same = [
    T('n1', 'a', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('n2', 'b', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。'),
  ];
  assert.equal(run(same, ['空间']).rows[0].diff, false);
  const diff = same.concat([T('n3', 'b', '空间', '空间小了点', '通用', 'image_test', '空间小了点，两个人刚好。')]);
  assert.equal(run(diff, ['空间']).rows[0].diff, true);
  const missing = [T('n1', 'a', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。')];
  const r = run(missing, ['空间']);
  assert.equal(r.rows[0].diff, false);
  assert.equal(r.rows[0].cells.b, null);
});

test('折叠：未选维度全部SKU有证据且唯一结论=1；plusPool=知识表序-已选-折叠', () => {
  const uv = [
    T('n1', 'a', '防晒', 'UPF50+，防晒够用', '通用', 'video_test', '大太阳不晒，UPF50+防晒够用。'),
    T('n2', 'b', '防晒', 'UPF50+，防晒够用', '通用', 'image_test', '大太阳不晒，UPF50+防晒够用。'),
  ];
  const r = run(uv, ['空间']);
  assert.deepEqual(r.foldRows.map(f => f.dim), ['防晒']);
  assert.equal(r.foldRows[0].conclusion, 'UPF50+，防晒够用');
  assert.deepEqual(r.plusPool, ['搭建体验', '价格', '重量', '容纳人数']);

  const uvDiff = uv.concat([T('n3', 'b', '防晒', '防晒一般', '通用', 'image_test', '大太阳不晒，UPF50+防晒够用。')]);
  const r2 = run(uvDiff, ['空间']);
  assert.equal(r2.foldRows.length, 0);
  assert.ok(r2.plusPool.includes('防晒'));
});

test('幻觉校验：snippet非原文/note缺失/sku错配/结论与原文无交集 → discarded', () => {
  const tuples = [
    T('n1', 'a', '空间', '空间很大', '通用', 'video_test', '原文里没有这句。'),
    T('n1', 'a', '搭建体验', '和原文毫无交集', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('nx', 'a', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('n2', 'a', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。'),
  ];
  const r = run(tuples, ['空间', '搭建体验']);
  assert.equal(r.stats.discarded, 4);
  assert.equal(r.stats.tuples, 0);
  assert.equal(r.rows[0].cells.a, null);
  assert.equal(r.stats.needsPromptReview, true);
});

test('中立红线：结论含导购词拒收并计 violations', () => {
  const tuples = [
    T('n1', 'a', '空间', '空间很大，建议买', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('n2', 'b', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。'),
  ];
  const r = run(tuples, ['空间']);
  assert.equal(r.stats.violations, 1);
  assert.equal(r.stats.tuples, 1);
  assert.equal(r.rows[0].cells.a, null);
  assert.equal(r.rows[0].cells.b.type, 'ev');
});

test('同人群（通用）结论冲突 → divergent 并列陈列；不同人群正常分群', () => {
  const t1 = [
    T('n1', 'a', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('n5', 'a', '空间', '空间有点挤', '通用', 'image_test', '空间很大，一家人坐得下。'),
  ];
  const groups = run(t1, ['空间']).rows[0].cells.a.groups;
  assert.equal(groups.length, 2);
  assert.ok(groups.every(g => g.divergent === true));

  const t2 = [
    T('n1', 'a', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('n5', 'a', '空间', '空间有点挤', '170+', 'image_test', '空间很大，一家人坐得下。'),
  ];
  const groups2 = run(t2, ['空间']).rows[0].cells.a.groups;
  assert.equal(groups2.length, 2);
  assert.ok(groups2.every(g => !g.divergent));
});

test('行排序：客观置顶 → 主观内diff优先 → 无lack优先 → hotRank', () => {
  const tuples = [
    T('n1', 'a', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('n5', 'a', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('n6', 'a', '空间', '空间很大', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('n2', 'b', '空间', '空间小了点', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('n3', 'b', '空间', '空间小了点', '通用', 'video_test', '空间小了点，两个人刚好。'),
    T('n7', 'b', '空间', '空间小了点', '通用', 'video_test', '空间很大，一家人坐得下。'),
    T('n4', 'a', '搭建体验', '背着就走很方便', '通勤党', 'image_test', '背上就走，地铁通勤不累。'),
  ];
  const r = run(tuples, ['空间', '搭建体验', '价格', '重量']);
  assert.deepEqual(r.rows.map(x => x.dim), ['价格', '重量', '空间', '搭建体验']);
});

test('人群归一化映射：露营新手→新手、通勤党→通勤、158→158、170→170+', () => {
  const tuples = [
    T('n4', 'a', '搭建体验', '背着就走很方便', '通勤党', 'image_test', '背上就走，地铁通勤不累。'),
  ];
  const r = run(tuples, ['搭建体验']);
  assert.deepEqual(r.rows[0].crowds, ['通勤']);
  assert.deepEqual(r.crowdChips, [['全部', '全部'], ['通勤党', '通勤']]);
});
