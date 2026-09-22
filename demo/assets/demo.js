var SKUS = {
  sku_tent_mgd: {
    id:'sku_tent_mgd', category:'tent', brand:'牧高笛', name:'牧高笛（MobiGarden）零动155 速开帐篷 一室一厅 3-5人 防晒防雨公园野营帐篷',
    short:'零动155', price:259, priceTag:'券后¥239', sold:'已售2.3万+', starCount:'4.8',
    tags:['速开3s','一室一厅','3-5人','PU2000mm','UPF50+','3.4kg'],
    emoji:'⛺', grad:['#9ed4f2','#3d8fc4'], flag:'新'
  },
  sku_tent_nhk: {
    id:'sku_tent_nhk', category:'tent', brand:'挪客户外', name:'挪客户外（Naturehike）ango 三人帐篷 铝合金杆 四面开窗 全景透气露营帐篷',
    short:'ango三人款', price:279, priceTag:'券后¥259', sold:'已售8600+', starCount:'4.9',
    tags:['铝合金杆','四面开窗','3人','PU3000mm','2.9kg'],
    emoji:'🏕️', grad:['#b2e0b6','#4caf6d'], flag:''
  },
  sku_tent_dcl: {
    id:'sku_tent_dcl', category:'tent', brand:'迪卡侬', name:'迪卡侬（DECATHLON）Quechua 2秒速开帐篷 2人 两门两窗 公园野餐遮阳帐篷',
    short:'Quechua 2秒', price:149, priceTag:'直降¥50', sold:'已售6.9万+', starCount:'4.7',
    tags:['玻纤杆','两门两窗','2人','PU2000mm','3.3kg'],
    emoji:'🌴', grad:['#f7cf96','#e8963f'], flag:''
  },
  sku_tent_cml: {
    id:'sku_tent_cml', category:'tent', brand:'骆驼', name:'骆驼（CAMEL）全自动液压帐篷 一室一厅 3-4人 公园速开露营帐篷',
    short:'骆驼液压3-4人', price:199, priceTag:'券后¥189', sold:'已售1.4万+', starCount:'4.8',
    tags:['液压自动杆','3-4人','PU3000mm','4.5kg'],
    emoji:'🐪', grad:['#f2dcc2','#c98d5e'], flag:'', notes:3
  },
  sku_tent_txz: {
    id:'sku_tent_txz', category:'tent', brand:'探险者', name:'探险者（TANXIANZHE）便携速开帐篷 2人 超轻公园野餐遮阳帐篷',
    short:'探险者超轻2人', price:129, priceTag:'直降¥20', sold:'已售3.1万+', starCount:'4.6',
    tags:['速开','2人','PU1500mm','2.2kg'],
    emoji:'🍂', grad:['#d8e4f5','#8aa8d6'], flag:'', notes:3
  },
  sku_suit_zz: {
    id:'sku_suit_zz', category:'suit', brand:'致知', name:'致知（ZHIZHI）宽松oversize羊毛混纺西装外套 女落肩通勤春秋薄款',
    short:'致知oversize西装', price:899, priceTag:'券后¥849', sold:'已售2.1万+', starCount:'4.8',
    tags:['oversize','羊毛混纺','四粒扣','中长款','165+友好'],
    emoji:'🧥', grad:['#e3d5f7','#a98fd8'], flag:'新', notes:2
  },
  sku_suit_mx: {
    id:'sku_suit_mx', category:'suit', brand:'茉寻', name:'茉寻（MOXUN）修身通勤西装女 单排一粒扣 涤纶混纺上班正装外套',
    short:'茉寻修身西装', price:499, priceTag:'券后¥469', sold:'已售9800+', starCount:'4.7',
    tags:['修身','涤纶混纺','单排一粒扣','常规长度','通勤'],
    emoji:'🥼', grad:['#f2d5d9','#d892a2'], flag:'', notes:3
  },
  sku_suit_prr: {
    id:'sku_suit_prr', category:'suit', brand:'品肉肉', name:'品肉肉（PINROUROU）小个子短款棉混纺西装女 155小码修身两粒扣通勤外套',
    short:'品肉肉小个子西装', price:329, priceTag:'直降¥50', sold:'已售1.6万+', starCount:'4.9',
    tags:['小码特调','棉混纺','两粒扣','短款','155友好'],
    emoji:'👗', grad:['#d9e8f7','#8fb8dd'], flag:'', notes:2
  }
};
var SKU_ORDER = ['sku_tent_mgd','sku_tent_nhk','sku_tent_dcl'];
var SKU_POOL = ['sku_tent_mgd','sku_tent_nhk','sku_tent_dcl','sku_tent_cml','sku_tent_txz','sku_suit_zz','sku_suit_mx','sku_suit_prr'];

function skuList(){ return SKU_ORDER.map(k=>SKUS[k]); }
function getParam(name){ return new URLSearchParams(location.search).get(name); }
function store(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function load(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch(e){ return d } }
function toast(msg){
  let w=document.getElementById('toast-wrap');
  if(!w){ w=document.createElement('div'); w.id='toast-wrap'; document.body.appendChild(w); }
  const t=document.createElement('div'); t.className='toast';
  const s=document.createElement('span'); s.textContent=msg;
  const x=document.createElement('span'); x.className='toast-x'; x.textContent='✕';
  x.onclick=()=>t.remove();
  t.appendChild(s); t.appendChild(x); w.appendChild(t);
}
function skuThumbHtml(s,cls){ return `<div class="${cls||'sku-thumb'}" style="background:linear-gradient(135deg,${s.grad[0]},${s.grad[1]})">${s.emoji}</div>`; }
if (typeof module==='object' && module.exports) { module.exports = { SKUS, SKU_ORDER, SKU_POOL }; }
