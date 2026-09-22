---
version: 1.0
name: xhs-bibi-design-system
description: 小红书「比比」AI维度对比功能演示的设计系统。宿主层复刻小红书移动端设计语言——品牌红 #FF2442 只用于交易动作与选中态，白底画布、PingFang SC、软圆角卡片、瀑布流内容卡片。功能层（比比）的核心设计原则是「视觉中立」：结论永远是墨色，不用品牌色渲染任何商品判断；证据元数据用冷色系（蓝=证据强度、灰=人群标签），警示信息用琥珀橙（样本不足/证据分歧/报备商单）；品牌红只出现在价格、入口与决策终局CTA——中立性（PRD F30 只陈列不裁决）被编码进色彩语义本身，裁决权视觉上始终属于用户的「三选一」收尾卡。

colors:
  # —— 品牌与文本 ——
  brand: "#FF2442"            # 小红书红：CTA、价格、选中态、入口角标。全站唯一品牌电压
  brand-deep: "#D81E3C"       # 品牌红文本变体：白/浅粉底上可读的深红（收尾卡标题、链接、分享按钮）
  brand-soft: "#FFF0F2"       # 品牌红浅底：选中 chip、提示条底色
  brand-line: "#FFC9D2"       # 品牌红描边：选中 chip 描边、追加维度虚线框、收尾卡边框
  brand-wash: "#FFF7F8"       # 收尾卡渐变起点
  brand-grad: "linear-gradient(90deg,#FF6034,#FF2442)"   # 购买CTA渐变（立即购买）
  ink: "#222222"              # 一级文本：结论、标题。结论永不染品牌色
  body: "#333333"             # 正文
  sub: "#999999"              # 次要信息：销量、参数、来源
  sub-2: "#777777"            # 人群标签灰
  hint: "#C8C8CC"             # 最弱文本：演示标注、护栏统计行
  # —— 画布与表面 ——
  canvas: "#FFFFFF"           # 页面画布。宿主页面几乎全白
  surface: "#F4F4F6"          # 分区块底、chip 底、搜索框底、参数卡底（画布下唯一灰表面）
  surface-2: "#FAFAFA"        # 证据片段底（比 surface 更轻一级，仅溯源引用块用）
  hairline: "#F0F0F2"         # 默认分隔线、卡片描边
  hairline-2: "#E5E5E8"       # 强分隔线：引用块竖线、grabber、演示标注描边
  # —— 证据语义色（比比独有）——
  evidence: "#5B92C9"         # 证据强度标签：实测视频/图文/开箱/观点。冷蓝=事实的可信度
  evidence-bg: "#EEF6FF"
  crowd: "#777777"            # 人群标签：158/170+/露营新手/通勤。中性灰=人群是事实不是判断
  crowd-bg: "#F2F2F4"
  warn: "#E8732D"             # 注意态：样本不足、证据存在分歧、报备商单。琥珀橙=提示掂量，不是否定
  warn-bg: "#FFF0E8"
  warn-bg-2: "#FFEEE1"
  # —— 功能与禁用 ——
  disabled-bg: "#E6E6E9"
  disabled-fg: "#B9B9BD"
  on-brand: "#FFFFFF"
  scrim: "rgba(0,0,0,.45)"    # 浮层遮罩
  link: "#3D8FC4"             # 次级动作链接：换一换、查看原笔记

typography:
  family: "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif"
  title:    { fontSize: 17px, fontWeight: 700, color: ink }                     # 导航标题、章节标题、收尾卡标题
  emphasis: { fontSize: 14px, fontWeight: 600, lineHeight: 1.45, color: ink }   # 报告结论、客观参数值——主角文本
  body:     { fontSize: 13px,   fontWeight: 400, lineHeight: 1.5, color: body } # 正文、chips、按钮（卡片标题用600变体）
  meta:     { fontSize: 11px,   fontWeight: 400, color: sub }                   # 销量、来源、参数、辅助说明
  tag:      { fontSize: 10px,   fontWeight: 400 }                               # 语义标签、演示标注、脚注
  price:    { fontSize: 16px,   fontWeight: 700, color: brand }                 # 价格（详情页26px）。全站唯一允许"喊"的文本

rounded:
  tag: 4px        # 语义标签
  thumb: 10px     # 缩略图
  card: 12px      # 卡片、对比单元格、抽屉内条目
  panel: 14px     # 攻略卡、SKU卡、参数区
  sheet: 18px     # 半屏浮层上圆角
  pill: 999px     # 胶囊按钮、chip、搜索框

spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px

elevation:
  card: none                                          # 内容卡片无阴影，靠白底+留白分隔
  sticky: "0 2px 6px rgba(0,0,0,.04)"                 # 吸顶元素
  float: "0 10px 34px rgba(0,0,0,.2)"                 # 吸底浮条
  rail: "0 4px 14px rgba(255,36,66,.35)"              # 比比右缘竖条（品牌色投影）
  fab: "0 6px 18px rgba(255,36,66,.4)"                # 发布按钮

components:
  # —— 宿主层（复刻小红书）——
  tab-bar:
    backgroundColor: "{colors.canvas}"
    activeColor: "{colors.ink}"
    inactiveColor: "#666666"
    underline: 18x3px {colors.brand} 圆角2px
  chip:
    backgroundColor: "{colors.surface-2}"
    textColor: "#444444"
    rounded: "{rounded.pill}"
    padding: 7px 14px
    fontSize: 13px
  chip-selected:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand}"
    borderColor: "{colors.brand}"
  note-card:           # 瀑布流笔记卡
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.card}"
    cover: 渐变占位+emoji（demo 无图约束）
  product-card:        # 市集商品卡
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.card}"
    price: "{typography.price}"
    promo-tag: warn色系小标签
  bottom-nav:
    backgroundColor: "{colors.canvas}"
    height: ~52px
    shadow: "0 -2px 12px rgba(0,0,0,.06)"
  # —— 功能层（比比）——
  bibi-rail:           # 比比右缘竖条（入口B）：市集+商品详情页两页常驻
    position: 右缘垂直居中（top 44%），writing-mode 竖排「比比」
    background: "linear-gradient(180deg,#ff6a82,{colors.brand})"
    shadow: "{elevation.rail}"
    rounded: 14px 0 0 14px
    badge: 无数量角标（用户拍板 F39）
  bibi-drawer:         # 购物车抽屉（比比入口B，F46 与购物车合并；F48 口径回调：收集侧称购物车，比比仅指比较界面与右缘竖条）
    width: 300px
    rounded: 16px 0 0 16px
    item-active-bg: "#FFF6F7"
    checkbox: 20px圆形，选中 {colors.brand} + ✓（勾选参与对比）
    footer: hint行左侧（跨类目提示/中立声明）+ 右侧「去点点搜搜 ↗」链接（{colors.link} 次级动作色，F49——真实版落搜索输入页，demo直落mock泛搜页+toast标注）
    cta: 胶囊主按钮 {colors.brand}，禁用态 {colors.disabled-bg}/{colors.disabled-fg}
  sku-card-selectable: # 泛搜SKU卡（多选）
    borderColor: "{colors.hairline}" → 选中 "{colors.brand}"
    selectedBg: "#FFFAFA"
    checkbox: 20px圆形，选中 {colors.brand} + ✓
  dim-chip:            # 维度选择chip
    extends: chip
    selected: chip-selected + ✓
  compare-rows:        # 对比报告（行卡制）：维度为行、商品为列
    rowHead: 维度名14px/700 + 层级10px角标 + 「差」红角标
    cellGrid: repeat(var(--n),1fr)，列间8px
    cell: 白底 + 1px hairline + 12px圆角 + 12px内边距（微卡片，非表格格）
    conclusion: "{typography.emphasis}" 墨色600，绝不染品牌色
    objective-value: 16px/700 墨色（带事实标签时染红=价格语义位）
    group-divider: 组间 1px dashed hairline（卡内分群，卡外不用虚线）
    fold-row: "{colors.sub}" 折叠行
    plus-row: 1.5px dashed {colors.brand-line}，{colors.brand} 文案
  tag-semantic:        # 证据语义标签（统一10px/圆角4px）
    level: "{colors.evidence}" on "{colors.evidence-bg}"    # 证据强度
    crowd: "{colors.crowd}" on "{colors.crowd-bg}"          # 人群
    warn: "{colors.warn}" on "{colors.warn-bg}"             # 样本不足/分歧
  evidence-sheet:      # 溯源半屏浮层
    rounded: "{rounded.sheet}"
    snippet: surface-3底 + 3px左侧竖线 + 原文引号
    source: note_id + 报备商单warn标注 + 查看原笔记link
  end-card:            # 三选一收尾卡（决策终局）
    background: "linear-gradient(160deg,{colors.brand-wash},#FFEEF1)"
    border: 1px {colors.brand-line}
    title: "{colors.brand-deep}" 16px
    buttons: 描边式 {colors.brand-deep}，「都没那么好」为弱化链接
  float-bar:           # 吸底比一比浮条
    width: 360px
    rounded: 26px
    shadow: "{elevation.float}"
  toast:
    backgroundColor: "rgba(0,0,0,.78)"
    textColor: "{colors.on-brand}"
    rounded: 16px
    dismiss: 手动关闭（✕ 按钮），不自动消失；多条纵向堆叠于 #toast-wrap（F51）
  loading-mask:
    backgroundColor: "rgba(255,255,255,.96)"
    spinner: 3.5px {colors.brand-line}底 + {colors.brand}顶

---

## Overview

这是小红书站内功能「比比」（AI维度对比）的演示设计系统，一套代码里住着两种设计语言：

1. **宿主层**（首页/市集/商品页/泛搜）复刻小红书移动端：纯白画布、瀑布流内容卡片、圆角商品卡、品牌红 `#FF2442` 承载全部交易动作。宿主层的任务是"看起来就是小红书"——用户不该察觉自己进入了演示。
2. **功能层**（维度选择/对比报告）是寄生在宿主里的新功能，设计任务不是"像小红书"而是"可信"——报告页是这个产品的灵魂，它的每一个视觉决策都在回答同一个问题：**怎么让用户相信这份报告没有在卖东西**。收集侧（购物车抽屉）沿用宿主层购物车心智，不引入新词（F48：用户不理解「比比」是什么，收集侧称购物车，进入比较界面才称比比）。

**Key Characteristics:**

- **中立性编码进色彩语义（全系统最重要的规则）**：品牌红只出现在三类位置——价格、入口/CTA、决策终局卡。**结论文本永远是墨色** `#222`，一个商品的证据再好也不会变红变绿。AI 不做判断的立场（PRD F30「只陈列不裁决」）不是写在免责声明里，而是用户扫一眼配色就能感知到。
- **冷色证据、暖色警示的二元语义**：证据强度用冷蓝（`evidence`）、人群用中性灰（`crowd`）——它们是"事实"的口吻；样本不足/证据分歧/报备商单用琥珀橙（`warn`）——它们是"请掂量"的口吻，但橙色永远不用于否定某个商品。
- **宿主用密度、功能用留白**：首页/市集是信息密度型页面（瀑布流、双列网格、金刚区）；比比的三张页面（抽屉/选维度/报告）刻意留白更大、层级更少——决策场景需要的视觉安静和种草场景需要的视觉热闹是反的。
- **软圆角无硬角**：标签 4px、缩略图 10px、卡片 12px、面板 14px、浮层 18px、chip/按钮全胶囊。全站没有一处直角。
- **单一品牌电压**：绝大多数像素是白+灰+墨，品牌红像小红书本体一样稀缺——这既是宿主复刻的要求，也强化了功能层的中立感。

## Colors

### 品牌
- **brand** `#FF2442`：小红书红。CTA 背景、价格数字、选中态、tab 下划线、比比入口竖条、发布按钮。全站唯一品牌电压。
- **brand-deep** `#D81E3C`：品牌红的文本变体。浅粉底上仍可读，用于收尾卡标题、泛搜攻略内链接、分享按钮文字。
- **brand-soft / brand-line / brand-wash**：品牌红的三个浅度衍生——选中 chip 底/描边、收尾卡渐变底。所有"红"的场景都能在这四档里找到，不允许再发明新的红。

### 文本
- **ink** `#222` / **body** `#333` / **sub** `#999` / **hint** `#C8C8CC`：四级墨阶。结论、标题用 ink；正文用 body；销量、参数、来源用 sub；演示标注与护栏统计行用 hint（最弱一级，刻意让"这是演示"和"这是后台护栏"低调）。

### 证据语义色（比比功能层独有）
- **evidence** `#5B92C9` on **evidence-bg** `#EEF6FF`：证据强度标签（实测视频/实测图文/开箱/观点）。冷蓝=可核验事实的口吻。
- **crowd** `#777` on **crowd-bg** `#F2F2F4`：人群标签（158/170+/露营新手/通勤）。灰=人群是作者自述的事实，不是平台画像也不是判断。
- **warn** `#E8732D` on **warn-bg** `#FFF0E8`：样本不足、证据存在分歧、报备商单。同色也复用于宿主层的促销标签（券后/立减）——两处语义一致："这里需要你多看一眼"，而非"这里不好"。

### 表面与分隔
- **canvas** `#FFFFFF` 为页面画布；**surface** `#F4F4F6` 为画布下唯一灰表面（chip/搜索框/参数卡/大分区块底）；**surface-2** `#FAFAFA` 仅用于证据片段底。画布下只两级灰，级差肉眼可辨。
- 分隔线两档：hairline `#F0F0F2`（卡片描边、默认分隔）、hairline-2 `#E5E5E8`（引用块竖线、grabber 等需要一点存在感的线）。

## Typography

全站单一字体栈（系统 PingFang SC 优先），靠字重和字号分层，无第二字体。**字阶只有 5 级**（17→10px，跨度1.7倍），任何位置都能报出自己属于哪一级：

| 层级 | 规格 | 用途 |
|---|---|---|
| title | 17px / 700 | 导航标题、章节标题、收尾卡标题 |
| emphasis | 14px / 600 / 1.45 | **报告结论**、客观参数值——内容主角，刻意用平静字重 |
| body | 13px / 400–600 / 1.5 | 正文、chips、按钮标签、商品卡标题（600变体） |
| meta | 11px / 400 | 销量、来源、参数、辅助说明 |
| tag | 10px / 400 | 证据语义标签、演示标注、脚注 |

价格豁免（16–26px / 700 红）——全站唯一允许"喊"的文本。

字重纪律：正文 400、标题与结论 600、CTA 与价格 700。**结论不用 700**——它是最重要的内容，却刻意用最平静的字重呈现。字阶纪律：**禁止 12 / 12.5 / 13.5 / 15.5 等中间字号**——8级挤在6.5px里的字阶眼睛排不出名次，5级才叫层级。

## Layout

- **画布**：390px 手机框居中于深灰 `#18181c` 桌面底，带状态栏（时刻/信号/WiFi/电池均为 CSS 绘制）。所有页面在此框内滚动。
- **宿主页**：顶部 tab/搜索区吸顶 → 内容流 → 底部导航/吸底浮条。瀑布流双列 10px 列距，商品双列网格 10px 间距。
- **比比页面**：导航栏（返回+标题+演示角标）吸顶 → 粘性商品头卡 → 内容 → 收尾卡 → 护栏统计行 → 脚注。**左右留白 16px**，区块间距走 4px 基数刻度（4/8/12/16/24/32）。
- **对比报告结构（行卡制，2026-09-21排版改版）**：每个维度行 = **行首标题行**（维度名 14px/700 + 层级角标 + 「差」角标）+ **商品单元格微卡网格**（N 列等分，`--n` CSS 变量驱动，2–3 列自适应）。维度名不再挤在侧边标签列里——结论是主角，主角拿整行宽度；单元格=白底 hairline 描边 12px 圆角微卡片，列与列之间靠卡片边界分隔而非虚线。差异行置前、一致行折叠、追加维度行收尾。

## Elevation

全站只有四档投影且全部有语义：吸顶 `sticky`（几乎无感）、吸底浮条 `float`、品牌入口 `rail`/`fab`（比比竖条＋发布按钮，品牌色投影，是全站唯一的彩色阴影）。**内容卡片零阴影**——小红书的内容流靠白底和留白分隔，不靠投影；报告页同理，证据的可信度不来自"浮起来"。

## Components

关键组件规格见 frontmatter `components`。几个跨页面的一致性规则：

- **入口 B（比比竖条 + 购物车勾选开比，F47/F48 用户拍板 2026-09-22）**：右缘竖条回归并扩到**市集+商品详情页两页**常驻（垂直「比比」品牌红渐变，无数量角标）——竖条即「比比」的入口。**口径边界（F48）**：收集侧沿用购物车叫法（用户不理解「比比」是什么）——商品页顶栏/底栏 🛒 图标（带数量角标）、市集金刚区「购物车」与两页竖条唤起同一抽屉，抽屉标题「购物车 · 勾选开比」；条目圆形勾选框即「参与对比」，市集 ☆ 与「加入购物车」写入同一 `bb_cart`。进入比较界面（维度选择/对比报告）后才出现「比比」叫法。跨类目勾选触发时自动排除其他类目并 toast 说明，主导类目以当前浏览商品为准（市集页以首个勾选为准）。
- **三处"比一比"CTA**（泛搜浮条/购物车抽屉/维度页）共享同一胶囊样式与文案模板「比一比这 N 件 →」/「比一比勾选的 N 件」，禁用态文案精确到差几件（「再勾1件就可以比啦」）。
- **溯源浮层**：结论 + 语义标签行 + 逐条证据片段（灰底+左侧竖线+引号+note_id+查看原笔记）。报备商单标注排在 note_id 后，橙色但不加粗——提示存在但不渲染审判。
- **收尾卡**：全站唯一允许大面积浅粉渐变的组件。三选一按钮为描边式而非实心——"买/不买/再看看"视觉上平权，实心会暗示其中一个更正确。
- **加载态**：白幕 + 品牌色 spinner + 「正在翻 N 篇笔记」——用真实 mock 笔记数，让等待本身讲述管线在工作。

## Do's and Don'ts

**Do**
- 结论、证据、人群标签保持墨色/冷色/灰色——让数据自己说话
- 品牌红稀缺使用：一处屏幕最多一个红色 CTA
- 客观行事实标签只用「最低价」「最轻」这类可验证表述
- 所有浮层、抽屉、浮条进出带 0.25–0.3s 缓动

**Don't**
- **永远不要用品牌红/绿色渲染某个商品的结论**（红=好或差都是裁决）
- 不用「最优」「推荐」「性价比之王」等词做任何视觉强调（F30 导购词表）
- 不给"买"按钮比"不买"更强的视觉权重
- 报备商单不用删除线/红色叉等否定性视觉——只降权陈列
- 演示标注（「演示Demo·数据虚构」）不可省略，但永远用最弱色 hint

## Responsive Behavior

演示锁定 390px 单一画布（iPhone 口径），不做响应式。桌面打开时手机框居中、两侧留深灰底。

## Known Gaps

- 商品图为 emoji + 渐变占位（无真实图片资产，mock 约束 F36）；接真实数据时替换为图片，占位层已独立成 `skuThumbHtml` 一处
- 图标大量使用 emoji（购物车/客服/金刚区）；上线版需换图标库
- 状态栏为静态装饰（时刻手写），不做实时
- 无深色模式；小红书本体深色模式下品牌红需换 `#FF5C72`，本演示未实现
