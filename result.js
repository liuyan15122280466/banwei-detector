/* 班味检测仪 - 结果页逻辑（三轴嘴替版：27 型精神状态鉴定） */
(function () {
  /* ---------- 读取本场答题数据 ---------- */
  var answers = [];
  var quiz = [];
  try {
    answers = JSON.parse(sessionStorage.getItem('bw_answers') || '[]');
    quiz = JSON.parse(sessionStorage.getItem('bw_quiz') || '[]');
  } catch (e) {}

  /* 题库兜底：拿不到本场题目（或旧数据没有 axis 字段）时，按题库固定顺序推断每题所属轴
     题库顺序：摸鱼 11 题 / 内耗 10 题 / 发疯 10 题 */
  function pseudoQuiz(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
      arr.push({ axis: i < 11 ? 'moyu' : (i < 21 ? 'neihao' : 'fafeng') });
    }
    return arr;
  }
  var quizOk = Array.isArray(quiz) && quiz.length > 0 &&
    quiz.some(function (q) { return q && q.axis; });
  if (!quizOk) quiz = [];

  if (!Array.isArray(answers) || answers.length === 0) {
    /* 没有答题记录：生成一份“班味本味”演示数据，保证页面可直接访问不空白 */
    if (quiz.length === 0) quiz = pseudoQuiz(31);
    var quota = { moyu: 5, neihao: 5, fafeng: 5 };
    var LEAN = { moyu: [9, 2, 2], neihao: [2, 9, 2], fafeng: [2, 2, 9] };
    var AWAY = { moyu: [2, 9, 2], neihao: [9, 2, 2], fafeng: [9, 2, 2] };
    answers = quiz.map(function (q) {
      var ax = (q && LEAN[q.axis]) ? q.axis : 'moyu';
      if (quota[ax] > 0) { quota[ax]--; return { text: 'demo', s: LEAN[ax].slice() }; }
      return { text: 'demo', s: AWAY[ax].slice() };
    });
  } else if (quiz.length !== answers.length) {
    quiz = pseudoQuiz(answers.length);
  }

  /* ---------- 三轴计分（MBTI 式独立轴） ----------
     每道题只属于一个轴（questions.js 的 axis 字段）：
     选中选项的“灵魂倾向”（s 向量 argmax，0摸鱼/1内耗/2发疯）
     与题目所属轴一致时该轴 +1。三轴互不干扰，27 型全部可达 */
  var IDX = { moyu: 0, neihao: 1, fafeng: 2 };
  var count = { moyu: 0, neihao: 0, fafeng: 0 };
  var total = { moyu: 0, neihao: 0, fafeng: 0 };
  answers.forEach(function (a, i) {
    var q = quiz[i] || {};
    var ax = q.axis;
    if (!IDX.hasOwnProperty(ax)) return;
    total[ax]++;
    if (!a || !Array.isArray(a.s) || a.s.length < 3) return;
    var best = 0;
    for (var k = 1; k < 3; k++) if (a.s[k] > a.s[best]) best = k;
    if (best === IDX[ax]) count[ax]++;
  });

  /* ---------- 三轴分级：高≥7 / 中 4-6 / 低≤3 ---------- */
  function levelOf(c) { return c >= 7 ? 2 : (c >= 4 ? 1 : 0); }
  var LV_TXT = ['低', '中', '高'];
  var mL = levelOf(count.moyu), nL = levelOf(count.neihao), fL = levelOf(count.fafeng);
  var typeIdx = mL * 9 + nL * 3 + fL; /* 0~26 */

  /* ---------- 27 型嘴替标签 ----------
     下标 [摸鱼级][内耗级][发疯级]（0=低 1=中 2=高），标签即嘴替 */
  var TYPES = [
    [ /* 摸鱼·低：活全你干 */
      [ /* 内耗·低 */
        { name: '班味绝缘体', desc: '摸鱼不会，内耗不会，发疯不敢', quote: '全公司只有你在认真上班，建议把你供起来镇楼。' },
        { name: '绷不住学徒', desc: '干活最卖力，偶尔也想掀桌', quote: '你的发疯是限量款，一年发售两次，每次都吓坏全组。' },
        { name: '定时炸弹卷王', desc: '卷得明明白白，疯得轰轰烈烈', quote: '干最狠的活，发最疯的疯，睡最香的觉，说的就是你。' }
      ],
      [ /* 内耗·中 */
        { name: '哑巴亏专业户', desc: '活最多，话最少，委屈全咽肚里', quote: '你什么都没说，但你的黑眼圈替你都招了。' },
        { name: '职场受气包', desc: '锅全是你背，疯只敢在心里发', quote: '表面：好的收到。内心：凭什么？？（音量 0.3）' },
        { name: '憋疯的卷王', desc: '白天拼命干活，晚上疯狂 emo', quote: '你的精神状态：一半在加班，一半在写辞职信。' }
      ],
      [ /* 内耗·高 */
        { name: '沉默的螺丝钉', desc: '不摸鱼不反抗，默默把自己拧紧', quote: '你是公司最稳的螺丝钉，可惜锈了也没人管。' },
        { name: '高压锅员工', desc: '内耗满格，发疯临界，全靠仙气吊着', quote: '你不是没情绪，你只是把情绪都腌进了工位。' },
        { name: '炸毛劳模', desc: '干活第一，内耗第一，发疯也第一', quote: '你是绷到极限的皮筋：要么弹回去，要么当场断给大家看。' }
      ]
    ],
    [ /* 摸鱼·中：半躺半卷 */
      [
        { name: '半躺养生派', desc: '活照干，鱼照摸，心态稳如老狗', quote: '打工中庸之道传人：干得比摸鱼多，摸得比卷王欢。' },
        { name: '佛系发疯选手', desc: '平时岁月静好，绷不住就疯一下', quote: '你的发疯是养生式的：定期排一排，不伤肝不伤心。' },
        { name: '工位显眼包', desc: '摸鱼随缘，内耗为零，发疯管够', quote: '同事看你：这人疯了吧。你看同事：你们怎么还不疯。' }
      ],
      [
        { name: '全国统一打工人', desc: '有点摸鱼，有点内耗，总体稳定', quote: '摸鱼会愧疚，内耗会自愈，周一想辞职但还是会起床。' },
        { name: '班味本味', desc: '摸鱼、内耗、发疯均衡发展', quote: '你不是有班味，你就是班味成精，建议直接来检测仪上班。' },
        { name: '攒疯型选手', desc: '攒够委屈就发一次大的，周期准点', quote: '你的发疯周期和发工资一样准，全组都学会看日历躲你。' }
      ],
      [
        { name: '心累摸鱼党', desc: '鱼是摸了，但全程心跳加速', quote: '你摸的不是鱼，是十分钟惊心动魄的带薪心悸。' },
        { name: '精神离职预备役', desc: '身在工位，魂在远方', quote: '肉体已签到，灵魂还在家躺着，双方暂时互不打扰。' },
        { name: '行走的情绪过山车', desc: '摸鱼时内耗，内耗完发疯，无限循环', quote: '你的精神状态一天四季：早上春天，中午寒冬，下午直接末日。' }
      ]
    ],
    [ /* 摸鱼·高：带薪躺平学十级 */
      [
        { name: '摸鱼宗师', desc: '摸鱼界扫地僧，稳稳地躺', quote: '你把上班过成了带薪度假，老板还以为你很忙。' },
        { name: '带薪发疯艺术家', desc: '摸鱼为主，偶尔发疯调节气氛', quote: '你的工位就是舞台：上一秒带薪如厕，下一秒带薪表演。' },
        { name: '疯鱼得水', desc: '摸鱼到极致，发疯到通透，零内耗', quote: '你才是真清醒：工资是老板的，快乐是自己的。' }
      ],
      [
        { name: '愧疚式摸鱼人', desc: '鱼摸得很熟练，摸完忏悔半天', quote: '摸鱼十分钟，忏悔一小时：鱼没摸好，人也没躺好。' },
        { name: '薛定谔的打工人', desc: '摸鱼怕发现，干活想摸鱼，反复横跳', quote: '不看工牌都不知道，自己今天是在上班还是在渡劫。' },
        { name: '精神状态领先版', desc: '摸鱼是日常，发疯是习惯', quote: '同事还在内耗，你已经在疯，精神状态领先一个版本。' }
      ],
      [
        { name: '辞职信收藏家', desc: '辞职信写了 38 版，一版没发', quote: '你的勇气全用来写辞职信了，可惜全都存进了草稿箱。' },
        { name: '死循环打工人', desc: '摸鱼因为累，内耗因为摸鱼', quote: '摸鱼是因为累，内耗是因为摸鱼，发疯是因为内耗，完美闭环。' },
        { name: '赛博疯人院院长', desc: '三轴全拉满，班味宇宙中心', quote: '检测仪看到你的数据直接死机：建议你来当检测仪本仪。' }
      ]
    ]
  ];
  var type = TYPES[mL][nL][fL];
  var code = '鱼' + LV_TXT[mL] + '·耗' + LV_TXT[nL] + '·疯' + LV_TXT[fL];

  /* ---------- 班味指数：逐题累加选项原始分 + min-max 归一化 ----------
     旧版按“三轴 argmax 命中率平均”算，但三轴互斥、此消彼长，
     平均值永远挤在 0.4 附近 → 指数永远 40~60 → 永远“中度感染”。
     新版：内耗/发疯分把班味熏浓（相对每题“最淡~最浓”区间归一），
     摸鱼分把班味冲淡（作扣减项）——语义正确，5 个等级全部可达 */
  function ratio(c, t) { return t > 0 ? c / t : 0; }
  var raw = { neihao: 0, fafeng: 0, moyu: 0 };
  var capSum = 0;   /* 每题最浓组合之和（内耗+发疯可达上限） */
  var minSum = 0;   /* 每题最淡组合之和（内耗+发疯可达下限） */
  var capMoyu = 0;  /* 每题摸鱼分的可达上限 */
  answers.forEach(function (a, i) {
    if (!a || !Array.isArray(a.s) || a.s.length < 3) return;
    raw.neihao += a.s[1];
    raw.fafeng += a.s[2];
    raw.moyu += a.s[0];
    var opts = (quiz[i] && quiz[i].options) || null;
    if (opts && opts.length) {
      var mx = 0, mn = 99, mm = 0;
      opts.forEach(function (o) {
        if (!o || !Array.isArray(o.s) || o.s.length < 3) return;
        mx = Math.max(mx, o.s[1] + o.s[2]);
        mn = Math.min(mn, o.s[1] + o.s[2]);
        mm = Math.max(mm, o.s[0]);
      });
      capSum += mx || 18;
      minSum += mn < 99 ? mn : 5;
      capMoyu += mm || 9;
    } else {
      capSum += 18; /* 演示兜底数据没有 options，用题库典型上下限 */
      minSum += 5;
      capMoyu += 9;
    }
  });
  var nf = Math.max(0, raw.neihao + raw.fafeng - minSum);
  var nfSpan = Math.max(1, capSum - minSum);
  var banwei = Math.round(
    nf / nfSpan * 95 -
    (raw.moyu / Math.max(1, capMoyu)) * 15 + 12
  );
  banwei = Math.max(3, Math.min(98, banwei));

  /* ---------- 六维图鉴：逐题累加选项里的真实分值 ----------
     旧版雷达按“argmax 命中数”画图，每轴只有 0/1 计数，形状几乎不动；
     这里把 31 题选项里 6 个灵魂侧面的原始分全部累加，每个维度都是
     0~100 的连续值——选不同答案，六边形就长不一样 */
  var DIMS = ['摸鱼力', '精神内耗', '发疯欲', '扛锅力', '搞钱欲', '班味浓度'];
  var score6 = [0, 0, 0, 0, 0, 0];
  answers.forEach(function (a) {
    if (!a || !Array.isArray(a.s) || a.s.length < 3) return;
    var m = a.s[0], nh = a.s[1], ff = a.s[2];
    score6[0] += m;
    score6[1] += nh;
    score6[2] += ff;
    var sum3 = m + nh + ff;
    score6[3] += (10 - Math.max(m, ff)) * 0.6 + nh * 0.4;
    score6[4] += Math.min(10, sum3 * 0.55);
    score6[5] += Math.min(10, sum3 * 0.75);
  });
  var nAns = Math.max(1, answers.length);
  for (var s6 = 0; s6 < 6; s6++) {
    score6[s6] = Math.max(4, Math.min(100, Math.round(score6[s6] / (nAns * 10) * 100)));
  }

  /* ---------- 昵称 ---------- */
  var NICKS = ['无名打工狗', '工位钉子户', '带薪困倦选手', '咖啡因战士', '摸鱼预备党员', '键盘侠本侠', '会议室幽灵', '周报文学家'];
  var nick = NICKS[Math.floor(Math.random() * NICKS.length)];
  try {
    var savedNick = sessionStorage.getItem('bw_nick');
    if (savedNick) nick = savedNick;
    else sessionStorage.setItem('bw_nick', nick);
  } catch (e) {}

  /* ---------- 报告编号 ---------- */
  var no = 'NO.BW-' + String(Date.now()).slice(-6);

  function setTxt(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  setTxt('reportNo', no);
  setTxt('userNick', nick);

  /* ---------- 判定词 ---------- */
  var verdict;
  if (banwei >= 80) verdict = '班味浓度：爆表级 ☢️';
  else if (banwei >= 60) verdict = '班味浓度：重度超标';
  else if (banwei >= 40) verdict = '班味浓度：中度感染';
  else if (banwei >= 20) verdict = '班味浓度：轻度携带';
  else verdict = '班味浓度：几乎没味？';
  setTxt('verdictChip', verdict);

  /* ---------- 四宫格：三轴计数 + 班味指数 ---------- */
  function setStat(id, barId, val, barPct) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
    var bar = document.getElementById(barId);
    if (bar) setTimeout(function () { bar.style.width = barPct + '%'; }, 300);
  }
  setStat('statMoyu', 'barMoyu', count.moyu + '/' + total.moyu, Math.round(ratio(count.moyu, total.moyu) * 100));
  setStat('statBeiguo', 'barBeiguo', count.neihao + '/' + total.neihao, Math.round(ratio(count.neihao, total.neihao) * 100));
  setStat('statFafeng', 'barFafeng', count.fafeng + '/' + total.fafeng, Math.round(ratio(count.fafeng, total.fafeng) * 100));
  setStat('statBanwei', 'barBanwei', String(banwei), banwei);

  /* ---------- 精神型号（27 型主判定，可分享） ---------- */
  setTxt('rTypeName', type.name);
  setTxt('rTypeCode', code + ' · 27 型之 ' + (typeIdx + 1));
  setTxt('rTypeDesc', type.desc);

  /* ---------- 嘴替金句 ---------- */
  setTxt('rComment', type.quote);

  /* ---------- 结果标签 ---------- */
  var badges = [
    [ratio(count.moyu, total.moyu), '带薪摸鱼冠军', '工位生存学十级学者'],
    [ratio(count.neihao, total.neihao), '脑内小剧场台长', '一个眼神能脑补八十集连续剧'],
    [ratio(count.fafeng, total.fafeng), '发疯文学十级', '已掌握疯言疯语的高级语法']
  ];
  var top = badges[0];
  badges.forEach(function (b) { if (b[0] > top[0]) top = b; });
  var chips = [
    { name: type.name, desc: type.desc },
    { name: '精神型号', desc: code },
    { name: top[1], desc: top[2] }
  ];
  var tagBox = document.getElementById('rTags');
  if (tagBox) {
    chips.forEach(function (c, i) {
      var chip = document.createElement('div');
      chip.className = 'tag-chip tag-c' + (i % 3);
      chip.innerHTML = '<b></b><span></span>';
      chip.querySelector('b').textContent = c.name;
      chip.querySelector('span').textContent = c.desc;
      tagBox.appendChild(chip);
    });
  }

  /* ---------- 六维图鉴：Canvas 雷达（真实分值驱动 + 生长动画） ---------- */
  var DW = 360, DH = 340, RN = 6;
  function rPt(cx, cy, r, i) {
    var ang = -Math.PI / 2 + i * 2 * Math.PI / RN;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  }
  function paintRadar(ctx, W, H, values, t) {
    var cx = W / 2, cy = H / 2 + 6, R = Math.min(W, H) * 0.34;
    var ring, i, p;
    for (ring = 4; ring >= 1; ring--) {
      ctx.beginPath();
      for (i = 0; i <= RN; i++) {
        p = rPt(cx, cy, R * ring / 4, i % RN);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
      ctx.strokeStyle = ring === 4 ? '#1d1d1f' : '#e3e3e0';
      ctx.lineWidth = ring === 4 ? 2 : 1;
      ctx.stroke();
    }
    ctx.font = '600 13px "PingFang SC", sans-serif';
    ctx.fillStyle = '#1d1d1f';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (i = 0; i < RN; i++) {
      p = rPt(cx, cy, R, i);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(p[0], p[1]);
      ctx.strokeStyle = '#e3e3e0';
      ctx.lineWidth = 1;
      ctx.stroke();
      var lp = rPt(cx, cy, R + 24, i);
      ctx.fillText(DIMS[i], lp[0], lp[1]);
    }
    ctx.beginPath();
    for (i = 0; i <= RN; i++) {
      var v = Math.max(4, values[i % RN]) / 100 * t;
      p = rPt(cx, cy, R * v, i % RN);
      if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(198,244,50,0.4)';
    ctx.fill();
    ctx.strokeStyle = '#1d1d1f';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    for (i = 0; i < RN; i++) {
      var vv = Math.max(4, values[i]) / 100 * t;
      p = rPt(cx, cy, R * vv, i);
      ctx.beginPath();
      ctx.arc(p[0], p[1], 4, 0, Math.PI * 2);
      ctx.fillStyle = '#1d1d1f';
      ctx.fill();
    }
  }
  /* 供海报调用：离屏 2x 高清导出 */
  function radarToDataUrl() {
    var c = document.createElement('canvas');
    c.width = DW * 2; c.height = DH * 2;
    var ctx = c.getContext('2d');
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    paintRadar(ctx, DW, DH, score6, 1);
    return c.toDataURL('image/png');
  }
  var radarCv = document.getElementById('radar');
  if (radarCv) {
    var radarAnimated = false;
    var drawRadar = function (t) {
      var dpr = window.devicePixelRatio || 1;
      var ctx = radarCv.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, DW, DH);
      paintRadar(ctx, DW, DH, score6, t);
    };
    var fitRadar = function () {
      var wrap = radarCv.parentNode;
      var scale = Math.min(1, (wrap.clientWidth || DW) / DW);
      var dpr = window.devicePixelRatio || 1;
      radarCv.width = DW * dpr;
      radarCv.height = DH * dpr;
      radarCv.style.width = Math.round(DW * scale) + 'px';
      radarCv.style.height = Math.round(DH * scale) + 'px';
    };
    var animateRadar = function () {
      if (radarAnimated) return;
      radarAnimated = true;
      var t0 = null;
      var step = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 900);
        drawRadar(1 - Math.pow(1 - p, 3));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    fitRadar();
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { animateRadar(); io.disconnect(); }
        });
      }, { threshold: 0.3 });
      io.observe(radarCv);
    } else {
      animateRadar();
    }
    var rzT;
    window.addEventListener('resize', function () {
      clearTimeout(rzT);
      rzT = setTimeout(function () {
        fitRadar();
        drawRadar(radarAnimated ? 1 : 0.001);
      }, 150);
    });
  }

  /* ---------- html2canvas 海报生成（9:16 专属海报） ---------- */
  var shareBtn = document.getElementById('btnShare');
  var modal = document.getElementById('posterModal');
  var posterImg = document.getElementById('posterImg');
  var tip = document.getElementById('shareTip');
  var generating = false;
  var lastPosterBlob = null;

  /* SVG 插画转 PNG data URL（html2canvas 无法直接渲染外部 SVG） */
  function svgToPngUrl(url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        try {
          var c = document.createElement('canvas');
          c.width = 800; c.height = 600;
          c.getContext('2d').drawImage(img, 0, 0, 800, 600);
          resolve(c.toDataURL('image/png'));
        } catch (e) { reject(e); }
      };
      img.onerror = function () { reject(new Error('插画加载失败')); };
      img.src = url;
    });
  }

  /* 等待图片完成解码，避免 html2canvas 截到空白图 */
  function waitImgReady(img) {
    if (img.decode) return img.decode().catch(function () {});
    return new Promise(function (resolve) {
      if (img.complete) return resolve();
      img.onload = resolve;
      img.onerror = resolve;
    });
  }

  /* 页面加载时预转换插画，点击生成时无需等待 */
  var warmPng = null;
  svgToPngUrl('assets/result.svg').then(function (u) { warmPng = u; }).catch(function () {});

  /* 海报内容：判定 + 27 型称号 + 金句 + 三轴数据 + 型号 + 二维码 */
  function fillSharePoster(pngUrl) {
    setTxt('spNo', no);
    var sv = document.getElementById('spVerdict');
    if (sv) sv.innerHTML = '<span>' + verdict + '</span>';
    setTxt('spTitle', type.name);
    setTxt('spTitleSub', 'TYPE ' + (typeIdx + 1) + ' / 27');
    setTxt('spQuote', type.quote);
    setTxt('spMoyu', count.moyu + '/' + total.moyu);
    setTxt('spFafeng', count.fafeng + '/' + total.fafeng);
    setTxt('spBanwei', String(banwei));
    setTxt('spTagName', '精神型号 ' + code);
    setTxt('spTagDesc', '摸鱼' + LV_TXT[mL] + ' · 内耗' + LV_TXT[nL] + ' · 发疯' + LV_TXT[fL]);
    document.getElementById('spImg').src = pngUrl;
    var spRadar = document.getElementById('spRadar');
    if (spRadar) spRadar.src = radarToDataUrl();
  }

  /* 二维码：优先本地库（直接读 canvas，同步可靠），失败时降级为在线服务 */
  function qrSrc() {
    var url = 'https://liuyan15122280466.github.io/banwei-detector/';
    if (window.QRCode) {
      try {
        var c = document.createElement('div');
        new QRCode(c, { text: url, width: 108, height: 108, correctLevel: QRCode.CorrectLevel.M });
        var canvasEl = c.querySelector('canvas');
        if (canvasEl && canvasEl.width > 0) {
          return canvasEl.toDataURL('image/png');
        }
        var img = c.querySelector('img');
        if (img && img.src && img.src.indexOf('data:') === 0) {
          return img.src;
        }
      } catch (e) {}
    }
    return 'https://api.qrserver.com/v1/create-qr-code/?size=108x108&data=' + encodeURIComponent(url);
  }

  shareBtn.addEventListener('click', function () {
    if (generating) return;
    generating = true;
    shareBtn.classList.add('loading');
    tip.textContent = '海报生成中，请稍候…';

    var poster = document.getElementById('sharePoster');
    poster.classList.add('poster-render');
    var usePng = warmPng;
    var prep = usePng
      ? Promise.resolve(usePng)
      : svgToPngUrl('assets/result.svg');
    prep
      .then(function (pngUrl) {
        fillSharePoster(pngUrl);
        var el = document.getElementById('spQrImg');
        el.src = qrSrc();
        return waitImgReady(el);
      })
      .then(function () {
        return waitImgReady(document.getElementById('spImg'));
      })
      .then(function () {
        var spRadar = document.getElementById('spRadar');
        return spRadar && spRadar.src ? waitImgReady(spRadar) : null;
      })
      .then(function () {
        return html2canvas(poster, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f6f6f2',
          width: 540,
          height: 960
        });
      })
      .then(function (out) {
        var data = out.toDataURL('image/png');
        posterImg.src = data;
        document.getElementById('posterDownload').href = data;
        modal.hidden = false;
        tip.textContent = '点「保存图片」存入相册/本地，或长按图片保存';
        out.toBlob(function (blob) { lastPosterBlob = blob; }, 'image/png');
      })
      .catch(function (err) {
        console.error(err);
        tip.textContent = '生成失败，请重试或截图保存';
      })
      .finally(function () {
        poster.classList.remove('poster-render');
        generating = false;
        shareBtn.classList.remove('loading');
      });
  });

  /* 保存图片：手机调系统分享面板（可直接存相册），电脑走真实文件下载，
     微信内置浏览器不支持两者，提示长按图片保存 */
  document.getElementById('posterDownload').addEventListener('click', function (e) {
    var ua = navigator.userAgent || '';
    var isWeChat = /MicroMessenger/i.test(ua);
    if (isWeChat) {
      e.preventDefault();
      tip.textContent = '微信内无法直接下载：请长按上方海报图片 →「保存图片」';
      return;
    }
    if (!lastPosterBlob) return; /* 海报还没生成完，让浏览器走默认 href 下载 */
    e.preventDefault();
    var fname = '班味浓度报告.png';

    /* 手机：调起系统分享面板，iOS/安卓均可「存储到相册」 */
    var nav = navigator;
    var canShareFiles = nav.canShare && nav.canShare({ files: [] });
    if (canShareFiles && nav.share) {
      var file = new File([lastPosterBlob], fname, { type: 'image/png' });
      nav.share({ files: [file], title: '我的班味浓度报告' })
        .catch(function () {}); /* 用户取消分享不算错误 */
      return;
    }

    /* 桌面：Blob URL 触发真实下载（data: URL 过长会被 Safari 拒绝） */
    var url = URL.createObjectURL(lastPosterBlob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    tip.textContent = '已开始下载「班味浓度报告.png」';
  });

  document.getElementById('posterClose').addEventListener('click', function () {
    modal.hidden = true;
  });
  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.hidden = true;
  });

  document.getElementById('btnRetry').addEventListener('click', function () {
    try {
      sessionStorage.removeItem('bw_answers');
      sessionStorage.removeItem('bw_quiz');
      sessionStorage.removeItem('bw_nick');
    } catch (e) {}
    location.href = 'quiz.html';
  });
})();
