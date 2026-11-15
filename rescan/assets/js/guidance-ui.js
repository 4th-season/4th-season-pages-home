document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const app = document.querySelector('#checklist-app');
  if (!app || !window.ReScanGuidance || !window.ReScanScoring) return;

  const params = new URLSearchParams(location.search);
  const checklistId = params.get('id');
  if (!checklistId) return;

  const REPORT_VERSION = 'w13-20260804-2';

  let latestAnswers = null;
  let applyTimer = null;

  const loadJson = async (path, optional = false) => {
    const response = await fetch(path, { cache: 'no-store' });
    if (!response.ok) {
      if (optional && response.status === 404) return null;
      throw new Error(`데이터를 불러오지 못했습니다. (${response.status})`);
    }
    return response.json();
  };

  const dataPromise = (async () => {
    const index = await loadJson('/rescan/data/index.json');
    const item = Array.isArray(index.items) ? index.items.find((entry) => entry.id === checklistId) : null;
    if (!item || !item.dataPath) return null;

    const checklist = await loadJson(item.dataPath);
    const [guidance, report] = await Promise.all([
      loadJson(`/rescan/data/guidance/${encodeURIComponent(checklistId)}.json`, true),
      loadJson(`/rescan/data/reports/${encodeURIComponent(checklistId)}.json?v=${REPORT_VERSION}`, true)
    ]);

    const validGuidance = guidance && guidance.checklistId === checklistId ? guidance : null;
    const validReport = report && report.checklistId === checklistId ? report : null;
    if (!validGuidance && !validReport) return null;
    return { item, checklist, guidance: validGuidance, report: validReport };
  })().catch(() => null);

  const findResultBlock = (resultView, headingText) => [...resultView.querySelectorAll('.result-block')]
    .find((block) => block.querySelector('h3')?.textContent.trim() === headingText);

  const createTextElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text || '';
    return element;
  };

  const appendParagraphs = (container, paragraphs, className = '') => {
    const items = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    items.filter((text) => typeof text === 'string' && text.trim()).forEach((text) => {
      container.appendChild(createTextElement('p', className, text));
    });
  };

  const appendList = (container, values, className = 'report-list') => {
    const items = Array.isArray(values) ? values.filter((value) => typeof value === 'string' && value.trim()) : [];
    if (!items.length) return;
    const list = document.createElement('ul');
    list.className = className;
    items.forEach((text) => list.appendChild(createTextElement('li', '', text)));
    container.appendChild(list);
  };

  const normalizeReportBand = (report, band) => {
    if (!band) return null;
    if (report?.schemaVersion === '2.0.0') return band;
    return {
      ...band,
      label: band.label || band.kicker || '결과를 생활의 언어로 읽으면',
      summary: band.summary || band.opening || '',
      meaning: band.meaning || [],
      lifeScenes: band.lifeScenes || band.lifeReading || [],
      sustainingResources: band.sustainingResources || [],
      signals: band.signals || [],
      comfort: band.comfort || '',
      pause: band.pause || band.closing || '',
      experiment: band.experiment || null,
      lastingQuestion: band.lastingQuestion || '',
      helpNote: band.helpNote || '',
      safetyNote: band.safetyNote || ''
    };
  };

  const findReportBand = (report, total) => {
    if (!report || !Array.isArray(report.bands) || !Number.isFinite(total)) return null;
    const matched = report.bands.find((band) => Number.isFinite(band.min)
      && Number.isFinite(band.max)
      && total >= band.min
      && total <= band.max);
    return normalizeReportBand(report, matched);
  };

  const calculateReportSignal = (checklist, answers, calculation) => {
    if (!calculation?.blocked) return calculation;
    const scaleValues = (checklist.scale || []).map((item) => Number(item.value)).filter(Number.isFinite);
    if (!scaleValues.length) return calculation;
    const scaleMin = Math.min(...scaleValues);
    const scaleMax = Math.max(...scaleValues);
    const categories = {};
    let total = 0;

    for (const question of checklist.questions || []) {
      const raw = Number(answers[question.id]);
      if (!Number.isFinite(raw) || !scaleValues.includes(raw)) return calculation;
      const score = question.reverse ? scaleMax + scaleMin - raw : raw;
      total += score;
      const category = question.category || 'uncategorized';
      if (!categories[category]) categories[category] = { score: 0, count: 0, min: 0, max: 0, percent: 0 };
      categories[category].score += score;
      categories[category].count += 1;
    }

    Object.values(categories).forEach((category) => {
      category.min = scaleMin * category.count;
      category.max = scaleMax * category.count;
      const range = category.max - category.min;
      category.percent = range > 0 ? Math.round(((category.score - category.min) / range) * 100) : 0;
    });

    return {
      ...calculation,
      total,
      minTotal: scaleMin * (checklist.questions || []).length,
      maxTotal: scaleMax * (checklist.questions || []).length,
      categories,
      reportSignalOnly: true
    };
  };

  const createReportSection = (title, className, values, { list = false } = {}) => {
    const normalized = Array.isArray(values)
      ? values.filter((value) => typeof value === 'string' && value.trim())
      : (typeof values === 'string' && values.trim() ? [values] : []);
    if (!normalized.length) return null;

    const section = document.createElement('div');
    section.className = `report-section ${className}`;
    section.appendChild(createTextElement('h4', '', title));
    if (list) appendList(section, normalized);
    else appendParagraphs(section, normalized);
    return section;
  };

  const createOverview = (calculation, checklist) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'report-overview';
    wrapper.setAttribute('aria-label', '한눈에 보는 결과');

    const categories = Object.entries(calculation.categories || {}).map(([id, value]) => {
      const meta = (checklist.categories || []).find((category) => category.id === id);
      return { id, label: meta?.label || id, percent: Number(value.percent) || 0 };
    }).sort((a, b) => b.percent - a.percent);

    const total = createTextElement('div', 'report-overview-score', '');
    if (calculation.blocked) {
      total.appendChild(createTextElement('span', '', '이번 응답 안내'));
      total.appendChild(createTextElement('strong', '', '점수 판정 없음'));
    } else {
      total.appendChild(createTextElement('span', '', '이번 응답 총점'));
      total.appendChild(createTextElement('strong', '', `${calculation.total}점`));
    }
    wrapper.appendChild(total);

    if (categories.length) {
      const leading = categories.filter((row) => row.percent === categories[0].percent).map((row) => row.label).join(' · ');
      const stable = categories.filter((row) => row.percent === categories[categories.length - 1].percent).map((row) => row.label).join(' · ');
      const detail = document.createElement('div');
      detail.className = 'report-overview-detail';
      detail.appendChild(createTextElement('p', '', `상대적으로 두드러진 영역: ${leading}`));
      detail.appendChild(createTextElement('p', '', `비교적 부담이 낮게 나타난 영역: ${stable}`));
      wrapper.appendChild(detail);
    }

    const overviewNote = calculation.blocked
      ? '이 주제는 점수나 위험 수준을 판정하지 않습니다. 영역 차이는 최근 응답에서 반복된 생활 변화를 읽기 위한 내부 정리값입니다.'
      : '총점과 영역 차이는 최근 응답을 정리한 참고값이며, 한 사람의 성격·능력·가치를 판정하지 않습니다.';
    wrapper.appendChild(createTextElement('p', 'report-overview-note', overviewNote));
    return wrapper;
  };

  const createReportBlock = (report, band, calculation, checklist) => {
    const section = document.createElement('section');
    section.className = 'result-report';
    section.dataset.reportBand = `${band.min}-${band.max}`;
    section.dataset.reportSchema = report.schemaVersion || '1.0.0';

    const titleId = `result-report-title-${checklistId}`;
    section.setAttribute('aria-labelledby', titleId);
    section.appendChild(createTextElement('p', 'report-label', report.title || '나를 읽는 생활 리포트'));

    const reportTitle = createTextElement('h3', 'report-title', band.label || '결과를 생활의 언어로 읽으면');
    reportTitle.id = titleId;
    section.appendChild(reportTitle);

    appendParagraphs(section, band.summary, 'report-opening');
    section.appendChild(createOverview(calculation, checklist));

    [
      createReportSection('이 결과가 말하는 것', 'report-meaning', band.meaning),
      createReportSection('생활 장면으로 읽기', 'report-scenes', band.lifeScenes),
      createReportSection('내가 버텨온 방식', 'report-resources', band.sustainingResources, { list: true }),
      createReportSection('마음과 생활이 보내는 신호', 'report-signals', band.signals, { list: true }),
      createReportSection('지금의 나에게 건네는 말', 'report-comfort', band.comfort)
    ].filter(Boolean).forEach((block) => section.appendChild(block));

    if (typeof band.pause === 'string' && band.pause.trim()) {
      const pause = createTextElement('blockquote', 'report-pause', band.pause);
      pause.setAttribute('aria-label', '잠시 멈추는 여백');
      section.appendChild(pause);
    }

    if (band.experiment && typeof band.experiment.text === 'string' && band.experiment.text.trim()) {
      const experiment = document.createElement('div');
      experiment.className = 'report-section report-experiment';
      experiment.appendChild(createTextElement('h4', '', band.experiment.title || '다음 한 장면에서 시험해 볼 일'));
      experiment.appendChild(createTextElement('p', '', band.experiment.text));
      section.appendChild(experiment);
    }

    if (typeof band.lastingQuestion === 'string' && band.lastingQuestion.trim()) {
      const question = document.createElement('div');
      question.className = 'report-section report-question';
      question.appendChild(createTextElement('h4', '', '이번 결과에서 오래 남는 한 질문'));
      question.appendChild(createTextElement('p', '', band.lastingQuestion));
      section.appendChild(question);
    }

    if (typeof band.helpNote === 'string' && band.helpNote.trim()) {
      const help = document.createElement('div');
      help.className = 'report-help';
      help.appendChild(createTextElement('strong', '', '도움이 필요한 때'));
      help.appendChild(createTextElement('p', '', band.helpNote));
      section.appendChild(help);
    }

    if (typeof band.safetyNote === 'string' && band.safetyNote.trim()) {
      const safety = document.createElement('div');
      safety.className = 'report-safety';
      safety.appendChild(createTextElement('strong', '', '안전을 먼저 살펴볼 때'));
      safety.appendChild(createTextElement('p', '', band.safetyNote));
      section.appendChild(safety);
    }

    return section;
  };

  const createGuidanceBlock = (card) => {
    const responseType = card.response?.type || 'scene';
    const block = document.createElement('div');
    block.className = `result-block guidance-card guidance-${responseType}`;
    block.dataset.guidanceCard = card.id;

    block.appendChild(createTextElement('p', 'guidance-label', '응답 사이에서 함께 보이는 한 장면'));
    block.appendChild(createTextElement('h3', '', card.title));
    block.appendChild(createTextElement('p', 'guidance-scene', card.scene));

    if (card.response && card.response.text) {
      const response = document.createElement('div');
      response.className = 'guidance-response';
      response.appendChild(createTextElement('h4', '', card.response.title || '조금 더 머물러 볼 대목'));
      response.appendChild(createTextElement('p', '', card.response.text));
      block.appendChild(response);
    }
    return block;
  };

  const removeSupersededGenericBlocks = (resultView, band) => {
    if (band?.lastingQuestion) findResultBlock(resultView, '생활에서 다시 살펴볼 질문')?.remove();
    if (band?.experiment?.text) findResultBlock(resultView, '지금 시도할 수 있는 작은 행동')?.remove();
  };

  const applyGuidance = async () => {
    const resultView = app.querySelector('.result-view');
    if (!resultView || resultView.dataset.guidanceProcessed === 'true' || !latestAnswers) return;

    const data = await dataPromise;
    if (!data) return;

    let calculation;
    try {
      calculation = window.ReScanScoring.calculate(data.checklist, latestAnswers);
    } catch (error) {
      return;
    }

    const reportCalculation = calculateReportSignal(data.checklist, latestAnswers, calculation);
    const reportBand = findReportBand(data.report, reportCalculation.total);
    if (reportBand) {
      removeSupersededGenericBlocks(resultView, reportBand);
      const reportBlock = createReportBlock(data.report, reportBand, reportCalculation, data.checklist);
      const summary = resultView.querySelector('.result-summary');
      if (summary) summary.insertAdjacentElement('afterend', reportBlock);
      else resultView.prepend(reportBlock);
    }

    const card = data.guidance
      ? window.ReScanGuidance.selectCard(data.guidance, calculation, latestAnswers)
      : null;

    if (card) {
      const guidanceBlock = createGuidanceBlock(card);
      const methodBlock = findResultBlock(resultView, '결과 계산 안내');
      const readingBlock = findResultBlock(resultView, '함께 읽기');
      resultView.insertBefore(guidanceBlock, methodBlock || readingBlock || resultView.querySelector('.notice'));
    }

    resultView.dataset.guidanceProcessed = 'true';
  };

  const scheduleApply = (attempt = 0) => {
    if (!latestAnswers) return;
    if (applyTimer) clearTimeout(applyTimer);
    applyTimer = setTimeout(() => {
      applyTimer = null;
      if (app.querySelector('.result-view')) {
        applyGuidance();
      } else if (attempt < 120) {
        scheduleApply(attempt + 1);
      }
    }, attempt === 0 ? 0 : 50);
  };

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== 'rescan-form') return;
    latestAnswers = Object.fromEntries([...new FormData(form).entries()].map(([key, value]) => [key, Number(value)]));
    scheduleApply();
  }, true);

  const observer = new MutationObserver(() => {
    if (latestAnswers) scheduleApply();
  });
  observer.observe(app, { childList: true, subtree: true });
});