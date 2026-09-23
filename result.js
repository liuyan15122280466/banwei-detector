/* 班味检测仪 - 结果页逻辑 */
(function () {
  var DIMS = ['摸鱼浓度', '背锅指数', '发疯值', '内耗值', '搞钱欲', '恋爱脑'];

  /* ---------- 读取答案 ---------- */
  var answers = [];
  try { answers = JSON.parse(sessionStorage.getItem('bw_answers') || '[]'); } catch (e) {}
  if (!Array.isArray(answers) || answers.length === 0) {
    /* 没有答题记录：生成一份演示数据，保证页面可直接访问不空白 */
    answers = QUESTIONS_DEMO();
  }

  function QUESTIONS_DEMO() {
    var arr = [];
    for (var i = 0; i < 20; i++) arr.push({ text: 'demo', s: [5, 5, 5, 5, 5, 5] });
    return arr;
  }

  /* ---------- 统计六维得分（0-100） ---------- */
  var sum = [0, 0, 0, 0, 0, 0];
  answers.forEach(function (a) {
    if (!a || !a.s) return;
    for (var i = 0; i < 6; i++) sum[i] += (a.s[i] || 0);
  });
  var maxRaw = answers.length * 10;
  var score = sum.map(function (v) {
    return Math.round(v / maxRaw * 100);
  });

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
  document.getElementById('reportNo').textContent = no;
  document.getElementById('userNick').textContent = nick;

  /* ---------- 四宫格 ---------- */
  function pctText(v) { return v + '%'; }
  function level10(v) { return Math.max(1, Math.round(v / 10)) + '/10'; }
  function fafengText(v) {
    if (v >= 85) return '已爆炸💥';
    if (v >= 60) return '即将爆炸';
    if (v >= 35) return '冒烟中';
    return '稳定如狗';
  }
  function gongziText(v) {
    if (v >= 80) return '遥遥无期';
    if (v >= 55) return '月底见';
    if (v >= 30) return '快到了';
    return '已到账';
  }

  var moyu = score[0], beiguo = score[1], fafeng = score[2], neihao = score[3], gaoqian = score[4], lianai = score[5];

  function setStat(id, barId, val, barPct) {
    document.getElementById(id).textContent = val;
    var bar = document.getElementById(barId);
    setTimeout(function () { bar.style.width = barPct + '%'; }, 300);
  }
  setStat('statMoyu', 'barMoyu', pctText(moyu), moyu);
  setStat('statBeiguo', 'barBeiguo', level10(beiguo), beiguo);
  setStat('statFafeng', 'barFafeng', fafengText(fafeng), fafeng);
  setStat('statGongzi', 'barGongzi', gongziText(gaoqian), Math.max(12, gaoqian));

  /* ---------- 判定词 ---------- */
  var verdict;
  var banwei = Math.round((moyu * 0.9 + beiguo * 0.8 + fafeng + neihao * 1.1 + (100 - gaoqian) * 0.2) / 4);
  if (banwei >= 80) verdict = '班味浓度：爆表级 ☢️';
  else if (banwei >= 60) verdict = '班味浓度：重度超标';
  else if (banwei >= 40) verdict = '班味浓度：中度感染';
  else if (banwei >= 20) verdict = '班味浓度：轻度携带';
  else verdict = '班味浓度：几乎没味？';
  document.getElementById('verdictChip').textContent = verdict;

  /* ---------- 毒舌点评 ---------- */
  var comment;
  if (banwei >= 80) {
    comment = '恭喜你，班味已经渗透到 DNA 层面。你的工位散发着一种“生人勿近”的气场，连保洁阿姨都想给你多倒一杯热水。建议：立刻打开请假软件，你的灵魂比你的 KPI 更需要抢救。';
  } else if (banwei >= 60) {
    comment = '你的班味浓度已超过安全阈值。白天是熟练的社畜，晚上是emo的诗人，朋友圈仅老板可见的分组里藏着你全部的委屈。别硬撑了，今晚早点睡，明天继续。';
  } else if (banwei >= 40) {
    comment = '你处于“半人半班”的量子叠加态：上班时偶尔摸鱼，摸鱼时偶尔愧疚。好在你还记得自己是个活人，会准时吃饭、偶尔下班。保持住，别让班味占领高地。';
  } else if (banwei >= 20) {
    comment = '班味轻微携带者。你摸鱼有度、背锅有限，居然还保留着下班后的生活，实属打工人中的稀缺品种。请守护好这份松弛感，它比年终奖珍贵。';
  } else {
    comment = '几乎检测不到班味？！要么你是刚入职的萌新，要么你已经实现财富自由。无论哪种，请留下你的联系方式，全公司打工狗都想向你取经。';
  }
  document.getElementById('rComment').textContent = comment;

  /* ---------- 标签体系 ---------- */
  var TAGS = [
    { min: 78, dim: 0, name: '摸鱼宗师', desc: '在老板眼皮子底下完成了自己的副业' },
    { min: 60, dim: 0, name: '带薪拉屎大师', desc: '厕所隔间是你的第二工位' },
    { min: 78, dim: 1, name: '背锅侠', desc: '天塌下来有你顶着，功劳全是别人的' },
    { min: 60, dim: 1, name: '老好人预备役', desc: '“不好意思”是你的口头禅' },
    { min: 78, dim: 2, name: '稳定发疯', desc: '表面情绪稳定，内心早已炸成烟花' },
    { min: 60, dim: 2, name: '发疯预备役', desc: '距离掀桌只差一次无效加班' },
    { min: 78, dim: 3, name: '职场丧尸', desc: '肉体在岗，灵魂已离职' },
    { min: 60, dim: 3, name: '精神内耗王', desc: '老板一个眼神，你脑补了一整季宫斗剧' },
    { min: 78, dim: 4, name: '人间清醒搞钱机', desc: '每一分钱都花在刀刃上' },
    { min: 60, dim: 4, name: '副业卷王', desc: '主业是副业的休息时间' },
    { min: 70, dim: 5, name: '办公室恋爱脑', desc: '上班的动力来自前台的 TA' },
    { min: 50, dim: 5, name: '嗑糖达人', desc: '别人的爱情，你操着亲妈的心' }
  ];
  var dims = [moyu, beiguo, fafeng, neihao, gaoqian, lianai];
  var gotTags = TAGS.filter(function (t) { return dims[t.dim] >= t.min; })
    .map(function (t) { return t.name; });
  /* 保底标签 */
  if (gotTags.length === 0) {
    gotTags = banwei >= 50 ? ['间歇性正常'] : ['人间清醒'];
  } else if (gotTags.length > 3) {
    gotTags = gotTags.slice(0, 3);
  }
  var TAG_DESC = {
    '摸鱼宗师': '在老板眼皮子底下完成了自己的副业',
    '带薪拉屎大师': '厕所隔间是你的第二工位',
    '背锅侠': '天塌下来有你顶着，功劳全是别人的',
    '老好人预备役': '“不好意思”是你的口头禅',
    '稳定发疯': '表面情绪稳定，内心早已炸成烟花',
    '发疯预备役': '距离掀桌只差一次无效加班',
    '职场丧尸': '肉体在岗，灵魂已离职',
    '精神内耗王': '老板一个眼神，你脑补了一整季宫斗剧',
    '人间清醒搞钱机': '每一分钱都花在刀刃上',
    '副业卷王': '主业是副业的休息时间',
    '办公室恋爱脑': '上班的动力来自前台的 TA',
    '嗑糖达人': '别人的爱情，你操着亲妈的心',
    '间歇性正常': '偶尔像个人，大部分时间是吗喽',
    '人间清醒': '看透职场，但依然热爱生活'
  };
  var tagBox = document.getElementById('rTags');
  gotTags.forEach(function (name, i) {
    var chip = document.createElement('div');
    chip.className = 'tag-chip tag-c' + (i % 3);
    chip.innerHTML = '<b></b><span></span>';
    chip.querySelector('b').textContent = name;
    chip.querySelector('span').textContent = TAG_DESC[name] || '';
    tagBox.appendChild(chip);
  });

  /* ---------- 雷达图 ---------- */
  var canvas = document.getElementById('radar');
  var ctx = canvas.getContext('2d');
  var DW = 360, DH = 340;
  var W = DW, H = DH;
  var cx = W / 2, cy = H / 2 + 6, R = Math.min(W, H) * 0.34;
  var N = 6;
  var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#C6F432';

  function fitRadar() {
    var wrap = canvas.parentNode;
    var cssW = Math.min(DW, Math.max(200, wrap.clientWidth || DW));
    var scale = cssW / DW;
    var dpr = window.devicePixelRatio || 1;
    W = DW; H = DH;
    cx = W / 2; cy = H / 2 + 6; R = Math.min(W, H) * 0.34;
    canvas.width = Math.round(DW * scale * dpr);
    canvas.height = Math.round(DH * scale * dpr);
    canvas.style.width = Math.round(DW * scale) + 'px';
    canvas.style.height = Math.round(DH * scale) + 'px';
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
  }

  function drawRadar(values) {
    ctx.clearRect(0, 0, W, H);
    var angle = function (i) { return Math.PI * 2 / N * i - Math.PI / 2; };

    /* 网格 */
    for (var ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      for (var i = 0; i <= N; i++) {
        var a = angle(i % N);
        var r = R * ring / 4;
        var x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = ring === 4 ? '#1d1d1f' : '#e3e3e0';
      ctx.lineWidth = ring === 4 ? 2 : 1;
      ctx.stroke();
    }
    /* 轴线 */
    for (var i = 0; i < N; i++) {
      var a = angle(i);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.strokeStyle = '#e3e3e0';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    /* 数据面 */
    ctx.beginPath();
    for (var i = 0; i <= N; i++) {
      var a = angle(i % N);
      var v = Math.max(6, values[i % N]) / 100;
      var x = cx + Math.cos(a) * R * v, y = cy + Math.sin(a) * R * v;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(198, 244, 50, 0.4)';
    ctx.fill();
    ctx.strokeStyle = '#1d1d1f';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    /* 数据点 */
    for (var i = 0; i < N; i++) {
      var a = angle(i);
      var v = Math.max(6, values[i]) / 100;
      var x = cx + Math.cos(a) * R * v, y = cy + Math.sin(a) * R * v;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#1d1d1f';
      ctx.fill();
    }
    /* 维度标签 */
    ctx.fillStyle = '#1d1d1f';
    ctx.font = '600 13px "PingFang SC", "HarmonyOS Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < N; i++) {
      var a = angle(i);
      var lx = cx + Math.cos(a) * (R + 26);
      var ly = cy + Math.sin(a) * (R + 24);
      ctx.fillText(DIMS[i], lx, ly);
    }
  }

  /* 雷达图生长动画 */
  var radarAnimated = false;
  fitRadar();
  function animateRadar() {
    if (radarAnimated) return;
    radarAnimated = true;
    var start = null, dur = 900;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var ease = 1 - Math.pow(1 - p, 3);
      drawRadar(score.map(function (v) { return v * ease; }));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var radarZone = document.querySelector('.r-radar-zone');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateRadar(); io.disconnect(); }
      });
    }, { threshold: 0.3 });
    io.observe(radarZone);
  } else {
    animateRadar();
  }
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      fitRadar();
      drawRadar(score);
    }, 150);
  });

  /* ---------- html2canvas 海报生成（9:16 专属海报） ---------- */
  var shareBtn = document.getElementById('btnShare');
  var modal = document.getElementById('posterModal');
  var posterImg = document.getElementById('posterImg');
  var tip = document.getElementById('shareTip');
  var generating = false;

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

  /* 只填重点结论：判定词 + 两项核心数据 + 主标签 */
  function fillSharePoster(pngUrl) {
    document.getElementById('spNo').textContent = no;
    document.getElementById('spVerdict').textContent = verdict;
    document.getElementById('spMoyu').textContent = pctText(moyu);
    document.getElementById('spFafeng').textContent = fafengText(fafeng);
    document.getElementById('spTagName').textContent = gotTags[0];
    document.getElementById('spTagDesc').textContent = TAG_DESC[gotTags[0]] || '';
    document.getElementById('spImg').src = pngUrl;
  }

  shareBtn.addEventListener('click', function () {
    if (generating) return;
    generating = true;
    shareBtn.classList.add('loading');
    tip.textContent = '海报生成中，请稍候…';

    var poster = document.getElementById('sharePoster');
    var usePng = warmPng;
    var prep = usePng
      ? Promise.resolve(usePng)
      : svgToPngUrl('assets/result.svg');
    prep
      .then(function (pngUrl) {
        fillSharePoster(pngUrl);
        return waitImgReady(document.getElementById('spImg'));
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
        tip.textContent = '长按保存海报图片，收获打工人共鸣';
      })
      .catch(function (err) {
        console.error(err);
        tip.textContent = '生成失败，请重试或截图保存';
      })
      .finally(function () {
        generating = false;
        shareBtn.classList.remove('loading');
      });
  });

  document.getElementById('posterClose').addEventListener('click', function () {
    modal.hidden = true;
  });
  modal.addEventListener('click', function (e) {
    if (e.target === modal) modal.hidden = true;
  });

  document.getElementById('btnRetry').addEventListener('click', function () {
    try { sessionStorage.removeItem('bw_answers'); sessionStorage.removeItem('bw_nick'); } catch (e) {}
    location.href = 'quiz.html';
  });
})();
