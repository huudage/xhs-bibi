(function(root,factory){ if(typeof module==='object'&&module.exports) module.exports=factory(); else root.BibiKnowledgeTable=factory(); })(typeof self!=='undefined'?self:globalThis, function(){
  var TABLE=[
    {id:'dim_tent_space',      category:'tent', name:'空间',    layer:'subjective', hot_rank:1, status:'preset'},
    {id:'dim_tent_setup',      category:'tent', name:'搭建体验', layer:'subjective', hot_rank:2, status:'preset'},
    {id:'dim_tent_price',      category:'tent', name:'价格',    layer:'objective', hot_rank:3, status:'preset'},
    {id:'dim_tent_weight',     category:'tent', name:'重量',    layer:'objective', hot_rank:4, status:'preset'},
    {id:'dim_tent_durability', category:'tent', name:'耐久性',  layer:'subjective', hot_rank:5, status:'preset'},
    {id:'dim_tent_waterproof', category:'tent', name:'防水',    layer:'subjective', hot_rank:6, status:'preset'},
    {id:'dim_tent_portable',   category:'tent', name:'便携性',  layer:'subjective', hot_rank:7, status:'preset'},
    {id:'dim_tent_uv',         category:'tent', name:'防晒',    layer:'subjective', hot_rank:8, status:'preset'},
    {id:'dim_tent_capacity',   category:'tent', name:'容纳人数', layer:'objective', hot_rank:9, status:'preset'},
    {id:'dim_suit_fit',        category:'suit', name:'版型与尺码', layer:'subjective', hot_rank:1, status:'preset'},
    {id:'dim_suit_fabric',     category:'suit', name:'面料与垂感', layer:'subjective', hot_rank:2, status:'preset'},
    {id:'dim_suit_price',      category:'suit', name:'价格',    layer:'objective', hot_rank:3, status:'preset'},
    {id:'dim_suit_slim',       category:'suit', name:'显瘦效果', layer:'subjective', hot_rank:4, status:'preset'},
    {id:'dim_suit_office',     category:'suit', name:'通勤适配', layer:'subjective', hot_rank:5, status:'preset'},
    {id:'dim_suit_wrinkle',    category:'suit', name:'抗皱表现', layer:'subjective', hot_rank:6, status:'preset'},
    {id:'dim_suit_composition',category:'suit', name:'面料成分', layer:'objective', hot_rank:7, status:'preset'}
  ];
  function byName(n){ for(var i=0;i<TABLE.length;i++) if(TABLE[i].name===n) return TABLE[i]; return null; }
  return { TABLE:TABLE, byName:byName };
});
