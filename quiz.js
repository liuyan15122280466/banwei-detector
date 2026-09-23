/* 班味检测仪 - 答题逻辑 */
(function () {
  /* 全量 31 题都上，只洗牌打乱顺序，每次开测体验不重样 */
  var QUESTIONS_PICKED = (function () {
    try {
      var pool = QUESTIONS.slice();
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
      }
      return pool;
    } catch (e) { return QUESTIONS.slice(); }
  })();
  var total = QUESTIONS_PICKED.length;
  var idx = 0;
  var answers = [];

  var elNow = document.getElementById('qNow');
  var elTitle = document.getElementById('qTitle');
  var elScene = document.getElementById('qScene');
  var elOptions = document.getElementById('qOptions');
  var elDots = document.getElementById('qDots');
  var elFill = document.getElementById('batteryFill');
  var elBatteryText = document.getElementById('batteryText');
  var btnPrev = document.getElementById('btnPrev');
  var qCard = document.getElementById('qCard');
  var elTotal = document.querySelector('.quiz-count span');

  /* 生成底部圆点导航 */
  for (var d = 0; d < total; d++) {
    var dot = document.createElement('i');
    dot.className = 'dot';
    elDots.appendChild(dot);
  }
  var dots = elDots.children;

  function batteryPct() {
    return Math.max(0, Math.round((1 - idx / total) * 100));
  }

  function renderBattery() {
    var pct = batteryPct();
    elFill.style.width = pct + '%';
    elFill.classList.toggle('low', pct <= 25);
    var label;
    if (pct > 80) label = '生命电量 ' + pct + '%';
    else if (pct > 60) label = '电量 ' + pct + '% · 刚开完晨会';
    else if (pct > 40) label = '电量 ' + pct + '% · 灵魂开始飘';
    else if (pct > 20) label = '电量 ' + pct + '% · 全靠意志力';
    else label = '电量 ' + pct + '% · 即将关机';
    elBatteryText.textContent = label;
  }

  function renderDots() {
    for (var i = 0; i < total; i++) {
      dots[i].className = 'dot' + (i < idx ? ' done' : i === idx ? ' cur' : '');
    }
  }

  function render() {
    var q = QUESTIONS_PICKED[idx];
    elNow.textContent = idx + 1;
    if (elTotal) elTotal.textContent = '/' + total;
    elScene.textContent = q.scene;
    elTitle.textContent = q.title;
    elOptions.innerHTML = '';
    q.options.forEach(function (opt, oi) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt-btn';
      b.innerHTML = '<span class="opt-key">' + 'ABC'[oi] + '</span><span class="opt-text"></span>';
      b.querySelector('.opt-text').textContent = opt.text;
      b.addEventListener('click', function () { pick(opt, b); });
      elOptions.appendChild(b);
    });
    /* 恢复已选状态 */
    if (answers[idx] != null) {
      var savedIdx = q.options.findIndex(function (o) { return o.text === answers[idx].text; });
      if (savedIdx > -1) elOptions.children[savedIdx].classList.add('picked');
    }
    btnPrev.classList.toggle('disabled', idx === 0);
    renderBattery();
    renderDots();
    /* 入场动画 */
    qCard.classList.remove('enter');
    void qCard.offsetWidth;
    qCard.classList.add('enter');
  }

  function pick(opt, btn) {
    if (btn.classList.contains('picked')) return;
    btn.classList.add('picked');
    answers[idx] = { text: opt.text, s: opt.s };
    setTimeout(function () {
      if (idx < total - 1) { idx++; render(); }
      else { finish(); }
    }, 260);
  }

  function finish() {
    /* 把本场题目与答案一起存给结果页（此前在此处误删 bw_answers，导致结果页永远拿不到真实作答） */
    try {
      sessionStorage.setItem('bw_answers', JSON.stringify(answers));
      sessionStorage.setItem('bw_quiz', JSON.stringify(QUESTIONS_PICKED));
    } catch (e) {}
    var mask = document.getElementById('scanMask');
    var bar = document.getElementById('scanBar');
    var txt = document.getElementById('scanText');
    mask.hidden = false;
    var msgs = [
      '正在提取班味样本…',
      '检测到高浓度班味…',
      '正在分析摸鱼行为轨迹…',
      '正在测量内耗深度…',
      '正在捕捉发疯前兆…',
      '正在生成嘴替报告…'
    ];
    var p = 0;
    var timer = setInterval(function () {
      p += Math.random() * 14 + 6;
      if (p > 100) p = 100;
      bar.style.width = p + '%';
      txt.textContent = msgs[Math.min(msgs.length - 1, Math.floor(p / 18))];
      if (p >= 100) {
        clearInterval(timer);
        setTimeout(function () {
          location.href = 'result.html';
        }, 420);
      }
    }, 240);
  }

  btnPrev.addEventListener('click', function () {
    if (idx === 0) return;
    idx--;
    render();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key >= '1' && e.key <= '3') {
      var i = parseInt(e.key, 10) - 1;
      if (elOptions.children[i]) elOptions.children[i].click();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      idx--; render();
    }
  });

  render();
})();
