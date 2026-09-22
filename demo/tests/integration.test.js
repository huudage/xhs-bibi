const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildReport, appendDimension } = require('../src/pipeline/index.js');
const { SKUS } = require('../assets/demo.js');

const ALL = ['sku_tent_mgd', 'sku_tent_nhk', 'sku_tent_dcl'];
const DEFAULT = ['价格', '重量', '空间', '搭建体验'];

test('3件×默认4维：行序/分群/合并/客观标签/折叠/追加池/chips/统计', async () => {
  const r = await buildReport({ skuIds: ALL, dimNames: DEFAULT });
  assert.deepEqual(r.skuIds, ALL);
  assert.deepEqual(r.rows.map(x => x.dim), ['价格', '重量', '空间', '搭建体验']);

  const space = r.rows.find(x => x.dim === '空间');
  assert.equal(space.diff, true);
  assert.deepEqual(space.crowds, ['158', '170+']);
  const mgd = space.cells.sku_tent_mgd;
  assert.deepEqual(mgd.groups.map(g => g.crowd), ['170+', '158']);
  assert.equal(mgd.groups[0].n, 2);
  assert.equal(mgd.groups[0].lack, true); // PRD 铁律：证据<3条即标样本不足，n=2 仍标注
  assert.equal(mgd.groups[1].n, 1);
  assert.equal(mgd.groups[1].lack, true);
  const dcl = space.cells.sku_tent_dcl;
  assert.equal(dcl.groups[0].n, 2);
  assert.equal(dcl.groups[0].level, 'video_test');
  assert.equal(space.cells.sku_tent_nhk.groups[0].lack, true);

  const setup = r.rows.find(x => x.dim === '搭建体验');
  assert.equal(setup.cells.sku_tent_dcl.groups[0].level, 'unbox');
  assert.equal(setup.cells.sku_tent_nhk.groups[0].crowd, '露营新手');

  const price = r.rows.find(x => x.dim === '价格');
  assert.deepEqual(price.cells.sku_tent_dcl, { type: 'obj', value: '¥149', tag: '最低价' });
  const weight = r.rows.find(x => x.dim === '重量');
  assert.equal(weight.cells.sku_tent_nhk.value, '2.9kg');
  assert.equal(weight.cells.sku_tent_nhk.tag, '最轻');

  assert.deepEqual(r.foldRows.map(f => f.dim), ['防晒']);
  assert.equal(r.foldRows[0].conclusion, 'UPF50+，日常防晒够用');
  assert.deepEqual(r.plusPool, ['耐久性', '防水', '便携性', '容纳人数']);
  assert.deepEqual(r.crowdChips, [['全部', '全部'], ['158小个子', '158'], ['170+', '170+'], ['露营新手', '新手'], ['通勤党', '通勤']]);

  assert.equal(r.stats.tuples, 21);
  assert.equal(r.stats.discarded, 1);
  assert.equal(r.stats.violations, 1);
  assert.equal(r.stats.needsPromptReview, false);
});

test('2件SKU：排除未选SKU的笔记，chips 缺少新手', async () => {
  const r = await buildReport({ skuIds: ['sku_tent_mgd', 'sku_tent_dcl'], dimNames: DEFAULT });
  assert.equal(r.rows.length, 4);
  assert.deepEqual(r.crowdChips.map(c => c[1]), ['全部', '158', '170+', '通勤']);
  assert.deepEqual(r.foldRows.map(f => f.dim), ['防晒']);
  assert.ok(!r.rows.some(x => x.cells.sku_tent_nhk));
});

test('appendDimension 走同管线：便携性 diff、追加池收缩、原报告对象不变', async () => {
  const r = await buildReport({ skuIds: ALL, dimNames: DEFAULT });
  const r2 = await appendDimension({ report: r, dimName: '便携性' });
  assert.equal(r.rows.length, 4);
  assert.equal(r2.rows.length, 5);
  const port = r2.rows.find(x => x.dim === '便携性');
  assert.equal(port.diff, true);
  assert.deepEqual(port.crowds, ['通勤']);
  assert.deepEqual(r2.plusPool, ['耐久性', '防水', '容纳人数']);
  const dcl = port.cells.sku_tent_dcl.groups[0];
  assert.equal(dcl.n, 2);
  assert.equal(dcl.level, 'video_test');
  assert.equal(dcl.snips[0].noteId, 'note_t_012');
});

test('appendDimension 耐久性：无数据SKU、报备合并降权、导购拒收计入统计', async () => {
  const r = await buildReport({ skuIds: ALL, dimNames: DEFAULT });
  const r2 = await appendDimension({ report: r, dimName: '耐久性' });
  const dur = r2.rows.find(x => x.dim === '耐久性');
  assert.equal(dur.diff, false);
  assert.equal(dur.cells.sku_tent_nhk, null);
  const mgd = dur.cells.sku_tent_mgd.groups[0];
  assert.equal(mgd.n, 2);
  assert.equal(mgd.snips[0].noteId, 'note_t_001');
  assert.equal(mgd.snips[1].noteId, 'note_t_011');
  assert.equal(mgd.snips[1].isReported, true);
  assert.equal(r2.stats.violations, 1);
});

const SUITS = ['sku_suit_zz', 'sku_suit_mx', 'sku_suit_prr'];
const SUIT_DEFAULT = ['版型与尺码', '面料与垂感', '价格', '显瘦效果']; // 热度前4预选

test('3件西装×默认4维：类目隔离/客观置顶/155·165+分群/统计', async () => {
  const r = await buildReport({ skuIds: SUITS, dimNames: SUIT_DEFAULT });
  // 客观行（价格）置顶，主观行按 diff → hotRank
  assert.deepEqual(r.rows.map(x => x.dim), ['价格', '版型与尺码', '面料与垂感', '显瘦效果']);

  const price = r.rows.find(x => x.dim === '价格');
  assert.deepEqual(price.cells.sku_suit_prr, { type: 'obj', value: '¥329', tag: '最低价' });
  assert.equal(price.cells.sku_suit_zz.value, '¥899');
  assert.ok(!price.cells.sku_suit_zz.tag);

  // 版型与尺码：155/165+ 人群分歧是西装类目核心分群（F36）
  const fit = r.rows.find(x => x.dim === '版型与尺码');
  assert.equal(fit.diff, true);
  const zz = fit.cells.sku_suit_zz;
  assert.deepEqual(zz.groups.map(g => g.crowd), ['165+', '155']);
  const prr = fit.cells.sku_suit_prr;
  assert.equal(prr.groups[0].crowd, '155'); // video_test 小码特调排在 opinion 短款卡胯前
  assert.equal(prr.groups[1].crowd, '165+');
  assert.equal(zz.groups[0].lack, true); // PRD 铁律：n=1 标样本不足

  const fabric = r.rows.find(x => x.dim === '面料与垂感');
  assert.equal(fabric.diff, true);
  assert.equal(fabric.cells.sku_suit_zz.groups[0].crowd, '通用');
  assert.equal(fabric.cells.sku_suit_prr.groups[0].level, 'opinion');

  const slim = r.rows.find(x => x.dim === '显瘦效果');
  assert.equal(slim.diff, false);
  assert.equal(slim.cells.sku_suit_mx, null); // 茉寻无显瘦证据

  // 类目边界（F46）：追加池/折叠只含西装维度，帐篷维度不混入
  assert.deepEqual(r.foldRows, []);
  assert.deepEqual(r.plusPool, ['通勤适配', '抗皱表现', '面料成分']);

  assert.equal(r.stats.tuples, 16);
  assert.equal(r.stats.discarded, 0);
  assert.equal(r.stats.violations, 0);
  assert.equal(r.stats.needsPromptReview, false);
});

test('西装追加面料成分：客观行取自商品标签，无最低价类标签', async () => {
  const r = await buildReport({ skuIds: SUITS, dimNames: SUIT_DEFAULT });
  const r2 = await appendDimension({ report: r, dimName: '面料成分' });
  const comp = r2.rows.find(x => x.dim === '面料成分');
  assert.equal(comp.layer, '客观');
  assert.deepEqual(comp.cells.sku_suit_zz, { type: 'obj', value: '羊毛混纺' });
  assert.equal(comp.cells.sku_suit_mx.value, '涤纶混纺');
  assert.equal(comp.cells.sku_suit_prr.value, '棉混纺');
  assert.ok(!Object.values(comp.cells).some(c => c && c.tag)); // 非数值维度不产生事实极值标签（F30）
  assert.deepEqual(r2.plusPool, ['通勤适配', '抗皱表现']);
  assert.equal(r.rows.length, 4);
});

test('西装追加通勤适配：报备商单结论组透传 isReported', async () => {
  const r = await buildReport({ skuIds: SUITS, dimNames: SUIT_DEFAULT });
  const r2 = await appendDimension({ report: r, dimName: '通勤适配' });
  const off = r2.rows.find(x => x.dim === '通勤适配');
  const mx = off.cells.sku_suit_mx;
  assert.equal(mx.groups.length, 2);
  const reported = mx.groups.find(g => g.conclusion.indexOf('通勤感强') !== -1);
  assert.equal(reported.snips[0].isReported, true);
  assert.equal(off.cells.sku_suit_prr, null);
});
