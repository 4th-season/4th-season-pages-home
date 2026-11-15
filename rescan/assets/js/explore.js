document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const sceneMap = {
    life: [
      { id: 'stress', label: '긴장과 부담이 계속 쌓여요', why: '생활 전반에서 압박과 회복 저하가 반복되는지 먼저 확인합니다.', secondary: ['burnout', 'sleep-hygiene'] },
      { id: 'burnout', label: '쉬어도 지치고 해야 할 일이 버거워요', why: '일·학습·돌봄에서 소진이 누적되는 패턴을 먼저 살펴봅니다.', secondary: ['stress', 'sleep-hygiene'] },
      { id: 'sleep-hygiene', label: '잠드는 시간, 수면의 질, 기상이 흔들려요', why: '수면 습관과 생활 리듬이 회복을 방해하는지 먼저 확인합니다.', secondary: ['stress', 'burnout'] }
    ],
    emotion: [
      { id: 'emotion-regulation', label: '감정이 커지면 다루기 어려워요', why: '감정을 알아차리고 충동을 조절하며 회복하는 과정을 먼저 살펴봅니다.', secondary: ['anger-regulation', 'emotional-expression'] },
      { id: 'anxiety-signals', label: '걱정과 긴장이 쉽게 멈추지 않아요', why: '걱정·긴장·회피가 집중과 생활에 미치는 영향을 먼저 살펴봅니다.', secondary: ['rumination', 'stress'] },
      { id: 'depressive-signals', label: '의욕과 흥미가 줄고 생활이 무거워요', why: '의욕·흥미·피로와 생활 기능의 변화를 조심스럽게 확인합니다.', secondary: ['sleep-hygiene', 'support-resources'] },
      { id: 'anger-regulation', label: '화가 커지고 표현한 뒤 후회해요', why: '분노가 커지는 장면과 표현, 진정 뒤 회복 과정을 먼저 살펴봅니다.', secondary: ['emotion-regulation', 'conflict-coping'] },
      { id: 'rumination', label: '같은 걱정과 후회가 계속 반복돼요', why: '생각 반복이 집중과 회복을 얼마나 붙잡는지 먼저 확인합니다.', secondary: ['anxiety-signals', 'self-criticism'] }
    ],
    relationship: [
      { id: 'relationship-boundaries', label: '부탁과 거절 사이에서 자주 지쳐요', why: '배려와 책임 사이에서 내 한계가 어떻게 흔들리는지 먼저 살펴봅니다.', secondary: ['assertiveness', 'relationship-reciprocity'] },
      { id: 'emotional-expression', label: '내 감정을 말로 전하기 어려워요', why: '감정을 알아차리고 상대에게 전달하는 방식을 먼저 살펴봅니다.', secondary: ['assertiveness', 'emotion-regulation'] },
      { id: 'social-connectedness', label: '사람은 있지만 외롭고 내 자리가 없어요', why: '연락 가능한 관계와 소속감, 일상 공유 자원을 먼저 살펴봅니다.', secondary: ['support-resources', 'relationship-reciprocity'] },
      { id: 'assertiveness', label: '의견·부탁·거절을 분명히 말하기 어려워요', why: '공격적이지 않게 내 입장과 한계를 표현하는 방식을 먼저 살펴봅니다.', secondary: ['relationship-boundaries', 'emotional-expression'] },
      { id: 'conflict-coping', label: '갈등이 생기면 피하거나 크게 부딪혀요', why: '회피와 격화 사이에서 사실과 요구를 조정하는 방식을 먼저 살펴봅니다.', secondary: ['anger-regulation', 'assertiveness'] },
      { id: 'relationship-reciprocity', label: '관계가 한쪽의 희생으로 유지되는 것 같아요', why: '관심·책임·결정이 한쪽으로만 흐르는지 먼저 살펴봅니다.', secondary: ['relationship-boundaries', 'support-resources'] },
      { id: 'support-resources', label: '도움을 요청할 사람이나 방법이 떠오르지 않아요', why: '지원 경로와 요청·수용·활용의 장벽을 먼저 살펴봅니다.', secondary: ['social-connectedness', 'self-efficacy'] }
    ],
    self: [
      { id: 'self-esteem', label: '나를 존중하기 어렵고 비교가 잦아요', why: '나를 평가하는 기준과 자기존중의 흔들림을 먼저 살펴봅니다.', secondary: ['self-criticism', 'life-satisfaction'] },
      { id: 'self-efficacy', label: '해낼 수 있다는 믿음이 약해졌어요', why: '시작·문제 해결·재시도에 대한 믿음을 먼저 살펴봅니다.', secondary: ['resilience', 'perfectionism'] },
      { id: 'perfectionism', label: '기준이 높아 시작과 마무리가 어려워요', why: '경직된 기준과 실수 두려움이 미루기와 불만족으로 이어지는지 먼저 살펴봅니다.', secondary: ['self-criticism', 'self-efficacy'] },
      { id: 'self-criticism', label: '실수 뒤 나를 심하게 몰아붙여요', why: '자책과 자기처벌이 회복을 방해하는 방식을 먼저 살펴봅니다.', secondary: ['self-esteem', 'perfectionism'] },
      { id: 'resilience', label: '어려움 뒤 다시 회복하기가 어려워요', why: '감정과 생활을 추스르고 다시 움직이는 과정을 먼저 살펴봅니다.', secondary: ['self-efficacy', 'support-resources'] },
      { id: 'life-satisfaction', label: '생활의 만족과 앞으로의 방향이 흐릿해요', why: '생활 안정·관계·역할·방향에서 유지되는 것과 부족한 것을 나누어 살펴봅니다.', secondary: ['self-efficacy', 'resilience'] }
    ]
  };

  const impactCopy = {
    explore: '현재 생활은 대체로 유지되고 있으므로, 문제를 찾기보다 나를 이해하고 유지할 자원을 확인하는 방식으로 시작합니다.',
    repeated: '생활은 이어 가고 있지만 같은 불편이 반복되므로, 가장 에너지를 많이 쓰게 만드는 장면부터 좁혀 봅니다.',
    disrupted: '생활 일부가 흔들리고 있으므로, 성향 해석보다 수면·일·관계 등 실제로 줄어든 기능과 연결된 점검을 먼저 봅니다.',
    support: '기본생활 유지가 어렵다면 점검 결과보다 지원 연결이 우선입니다. 아래 추천은 현재 상태를 설명할 말을 찾기 위한 보조 자료로 사용합니다.',
    unsure: '생활 영향 정도를 정하지 않아도 됩니다. 가장 먼저 달라졌거나 지금 가장 신경 쓰이는 장면에서 출발합니다.'
  };

  let allItems = [];
  let selectedImpact = '';
  let selectedDomain = '';
  let selectedScene = null;

  const guide = document.querySelector('#entry-guide');
  const stages = {
    impact: document.querySelector('#impact-stage'),
    domain: document.querySelector('#domain-stage'),
    scene: document.querySelector('#scene-stage'),
    recommendation: document.querySelector('#recommendation-stage')
  };
  const sceneGrid = document.querySelector('#scene-grid');
  const recommendationResult = document.querySelector('#recommendation-result');
  const supportFirstNote = document.querySelector('#support-first-note');
  const domainIntro = document.querySelector('#domain-intro');

  const setProgress = (step) => {
    document.querySelectorAll('[data-step-indicator]').forEach((item) => {
      const number = Number(item.dataset.stepIndicator);
      item.classList.toggle('is-current', number === step);
      item.classList.toggle('is-done', number < step);
    });
  };

  const showStage = (name, step) => {
    Object.entries(stages).forEach(([key, section]) => {
      if (section) section.hidden = key !== name;
    });
    setProgress(step);
    const heading = stages[name]?.querySelector('h3');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    guide?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderScenes = (domain) => {
    if (!sceneGrid) return;
    sceneGrid.innerHTML = (sceneMap[domain] || []).map((scene) => `<button class="scene-card" type="button" data-scene-id="${escapeHtml(scene.id)}"><strong>${escapeHtml(scene.label)}</strong><span>이 장면과 가까운 점검 찾기 →</span></button>`).join('');
  };

  const itemById = (id) => allItems.find((item) => item.id === id);

  const renderRecommendation = () => {
    if (!selectedScene || !recommendationResult) return;
    const primary = itemById(selectedScene.id);
    if (!primary) {
      recommendationResult.innerHTML = '<div class="panel"><p>추천 항목을 불러오지 못했습니다. 아래 직접 찾기에서 검사 이름을 검색해 주세요.</p></div>';
      return;
    }

    const related = (selectedScene.secondary || []).map(itemById).filter(Boolean).slice(0, 2);
    const supportNotice = selectedImpact === 'support'
      ? '<div class="recommendation-alert"><strong>점검보다 지원 연결이 먼저입니다.</strong><p>현재 상태를 가까운 사람이나 의료·상담·학교·직장·지역 지원체계에 알린 뒤, 이 점검은 상황을 정리하는 보조 자료로 사용하세요.</p></div>'
      : '';
    const relatedHtml = related.length
      ? `<div class="recommendation-related"><h4>첫 점검 뒤 필요할 때만 이어서 볼 항목</h4><div class="recommendation-related-grid">${related.map((item) => `<a href="/rescan/checklist.html?id=${encodeURIComponent(item.id)}"><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.subtitle)}</small></a>`).join('')}</div></div>`
      : '';

    recommendationResult.innerHTML = `${supportNotice}<div class="recommendation-primary"><p class="recommendation-kicker">가장 먼저 볼 점검</p><h4>${escapeHtml(primary.title)}</h4><p>${escapeHtml(selectedScene.why)}</p><div class="recommendation-context"><strong>이 경로를 권하는 이유</strong><p>${escapeHtml(impactCopy[selectedImpact] || impactCopy.unsure)}</p></div><a class="button primary" href="/rescan/checklist.html?id=${encodeURIComponent(primary.id)}">${escapeHtml(primary.title)} 시작하기 →</a></div>${relatedHtml}<p class="recommendation-limit">이 추천은 진단이나 중증도 판정이 아닙니다. 현재 고른 생활 장면과 가장 가까운 출발점 하나만 제안합니다.</p>`;
  };

  if (guide) {
    guide.addEventListener('click', (event) => {
      const impactButton = event.target.closest('[data-impact]');
      if (impactButton) {
        selectedImpact = impactButton.dataset.impact;
        selectedDomain = '';
        selectedScene = null;
        if (domainIntro) domainIntro.textContent = impactCopy[selectedImpact] || impactCopy.unsure;
        if (supportFirstNote) supportFirstNote.hidden = selectedImpact !== 'support';
        showStage('domain', 2);
        return;
      }

      const domainButton = event.target.closest('[data-domain]');
      if (domainButton) {
        selectedDomain = domainButton.dataset.domain;
        selectedScene = null;
        renderScenes(selectedDomain);
        showStage('scene', 2);
        return;
      }

      const sceneButton = event.target.closest('[data-scene-id]');
      if (sceneButton) {
        selectedScene = (sceneMap[selectedDomain] || []).find((scene) => scene.id === sceneButton.dataset.sceneId) || null;
        renderRecommendation();
        showStage('recommendation', 3);
      }
    });

    document.querySelector('#back-to-impact')?.addEventListener('click', () => showStage('impact', 1));
    document.querySelector('#back-to-domain')?.addEventListener('click', () => showStage('domain', 2));
    document.querySelector('#back-to-scene')?.addEventListener('click', () => showStage('scene', 2));
    document.querySelector('#restart-entry')?.addEventListener('click', () => {
      selectedImpact = '';
      selectedDomain = '';
      selectedScene = null;
      showStage('impact', 1);
    });
  }

  const searchInput = document.querySelector('#topic-search');
  const filters = document.querySelector('#topic-filters');
  const reset = document.querySelector('#topic-reset');
  const list = document.querySelector('#checklist-list');
  const empty = document.querySelector('#topic-empty');

  if (searchInput && filters && list) {
    const activeCategory = () => filters.querySelector('[aria-pressed="true"]')?.dataset.category || '전체';
    const hasFinderSelection = () => Boolean(searchInput.value.trim()) || activeCategory() !== '전체';

    const ensureCategoryFilters = () => {
      const existing = new Set([...filters.querySelectorAll('button[data-category]')].map((button) => button.dataset.category));
      [...new Set(allItems.map((item) => item.category).filter(Boolean))].forEach((category) => {
        if (existing.has(category)) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.category = category;
        button.setAttribute('aria-pressed', 'false');
        button.textContent = category;
        filters.appendChild(button);
      });
    };

    const renderFinder = () => {
      const term = searchInput.value.trim().toLowerCase();
      const category = activeCategory();

      if (!hasFinderSelection()) {
        list.innerHTML = '<div class="finder-placeholder"><strong>전체 목록은 자동으로 펼치지 않습니다.</strong><p>검사 이름을 입력하거나 위 분류 하나를 선택하면 해당 항목만 표시됩니다.</p></div>';
        if (empty) empty.hidden = true;
        return;
      }

      const visible = allItems.filter((item) => {
        const categoryMatch = category === '전체' || item.category === category;
        const text = [item.title, item.subtitle, ...(item.keywords || [])].join(' ').toLowerCase();
        return categoryMatch && text.includes(term);
      });

      list.innerHTML = visible.map((item) => {
        const ready = item.status === 'published' && item.dataPath;
        const href = ready ? `/rescan/checklist.html?id=${encodeURIComponent(item.id)}` : '#';
        const disabled = ready ? '' : 'aria-disabled="true" tabindex="-1"';
        return `<a class="card${ready ? '' : ' is-planned'}" href="${href}" ${disabled}><span class="tag">${ready ? '점검 가능' : '준비 중'}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.subtitle)}</p><span class="go">${ready ? '자가점검 시작 →' : '준비 중'}</span></a>`;
      }).join('');
      if (empty) empty.hidden = visible.length > 0;
    };

    const listGuard = new MutationObserver(() => {
      if (!hasFinderSelection() && list.querySelector('.card')) renderFinder();
    });
    listGuard.observe(list, { childList: true });

    fetch('/rescan/data/index.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error(`목록을 불러오지 못했습니다. (${response.status})`);
        return response.json();
      })
      .then((data) => {
        allItems = (data.items || []).filter((item) => item.status !== 'hidden');
        ensureCategoryFilters();
        renderFinder();
      })
      .catch(() => {
        list.innerHTML = '<div class="panel"><p>심리 검사 목록을 불러오지 못했습니다.</p></div>';
      });

    searchInput.addEventListener('input', renderFinder);
    filters.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-category]');
      if (!button) return;
      filters.querySelectorAll('button[data-category]').forEach((item) => item.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      renderFinder();
    });
    reset?.addEventListener('click', () => {
      searchInput.value = '';
      filters.querySelectorAll('button[data-category]').forEach((item) => item.setAttribute('aria-pressed', item.dataset.category === '전체' ? 'true' : 'false'));
      renderFinder();
      searchInput.focus();
    });
  }

  const app = document.querySelector('#checklist-app');
  if (!app) return;

  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex,follow');
    return;
  }

  fetch('/rescan/data/index.json', { cache: 'no-store' })
    .then((response) => response.json())
    .then((data) => {
      const item = (data.items || []).find((entry) => entry.id === id);
      if (!item) return;
      const canonical = `https://4th-season.com/rescan/checklist.html?id=${encodeURIComponent(id)}`;
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;

      const setMeta = (selector, attribute, value) => {
        let element = document.querySelector(selector);
        if (!element) {
          element = document.createElement('meta');
          const match = selector.match(/\[(?:property|name)="([^"]+)/);
          if (attribute === 'property') element.setAttribute('property', match?.[1] || '');
          else element.name = match?.[1] || '';
          document.head.appendChild(element);
        }
        element.setAttribute('content', value);
      };

      setMeta('meta[name="description"]', 'name', item.subtitle);
      setMeta('meta[property="og:title"]', 'property', `${item.title} | Re:Scan 심리 검사`);
      setMeta('meta[property="og:description"]', 'property', item.subtitle);
      setMeta('meta[property="og:url"]', 'property', canonical);
      setMeta('meta[property="og:image"]', 'property', 'https://4th-season.com/assets/map-note.png');
      document.querySelector('meta[name="robots"]')?.setAttribute('content', item.status === 'published' ? 'index,follow' : 'noindex,follow');
    })
    .catch(() => {});
});
