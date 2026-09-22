// 女装（西装）类目 mock 笔记：浏览器端并入 BibiNotes.NOTES（须在 notes-tent.js 之后加载），Node 端由 pipeline 显式 concat
(function(root){
  var NOTES=[
    {note_id:'note_s_001', sku_id:'sku_suit_zz', type:'video_test', is_purchased:true, is_reported:false, author_crowd:'166cm·通勤党',
     text:'致知oversize西装165+实测。落肩设计肩线下落3cm，我166穿刚好是松弛感，不显壮。155的朋友试了会压身高显矮，小个子慎入。羊毛混纺垂感在线，站着衣摆自然下垂不外扩。'},
    {note_id:'note_s_002', sku_id:'sku_suit_zz', type:'image_test', is_purchased:true, is_reported:false, author_crowd:'通勤党',
     text:'致知中长款西装通勤穿了一个月。抗皱在线，挤地铁坐一天后背只有轻微褶，挂一晚就平了。四粒扣敞开穿比扣上更显瘦。'},
    {note_id:'note_s_003', sku_id:'sku_suit_mx', type:'image_test', is_purchased:true, is_reported:false, author_crowd:'155cm·小个子通勤',
     text:'155小个子买茉寻修身版没翻车。修身收腰但不勒，常规长度刚好卡胯，不会像长款吃掉腿。袖长偏长要卷一圈才利落。'},
    {note_id:'note_s_004', sku_id:'sku_suit_mx', type:'video_test', is_purchased:false, is_reported:true, author_crowd:'品牌合作（报备商单）',
     text:'茉寻西装通勤实测（品牌合作，已报备）。涤纶混纺回弹不错，地铁上蹭出的褶抖一抖就散。一粒扣敞开穿随性，扣上通勤感强。'},
    {note_id:'note_s_005', sku_id:'sku_suit_prr', type:'video_test', is_purchased:true, is_reported:false, author_crowd:'155cm·微胖通勤',
     text:'155终于等到小码特调！品肉肉这版肩宽袖长都是按小个子调的，不用卷袖不用改。两粒扣扣上收腰明显，微胖也撑得起来，显瘦。'},
    {note_id:'note_s_006', sku_id:'sku_suit_prr', type:'opinion', is_purchased:false, is_reported:false, author_crowd:'同事视角·165+',
     text:'同事165+买了品肉肉同款说偏短，卡胯长度对高个子不友好，165+建议选长款。棉混纺摸着厚实，垂感比羊毛的差一点意思。'},
    {note_id:'note_s_007', sku_id:'sku_suit_mx', type:'image_test', is_purchased:true, is_reported:false, author_crowd:'通勤党',
     text:'茉寻这4.7分老实说有点虚。涤纶混纺透气一般，早秋天穿刚好，中午热的时候有点闷。垂感不如羊毛挺括，胜在好打理机洗不变形。'}
  ];
  if(typeof module==='object'&&module.exports){ module.exports={ NOTES:NOTES }; }
  else { root.BibiNotes.NOTES = root.BibiNotes.NOTES.concat(NOTES); }
})(typeof self!=='undefined'?self:globalThis);
