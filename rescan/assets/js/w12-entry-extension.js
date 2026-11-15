document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const guide = document.querySelector('#entry-guide');
  if (!guide) return;

  const sceneGrid = document.querySelector('#scene-grid');
  const sceneStage = document.querySelector('#scene-stage');
  const recommendationStage = document.querySelector('#recommendation-stage');
  const recommendationResult = document.querySelector('#recommendation-result');
  if (!sceneGrid || !sceneStage || !recommendationStage || !recommendationResult) return;

  const state = { impact: null, domain: null };
  const scenes = {
    life: [
      { id:'w12-execution', label:'해야 할 일을 시작하거나 중단 뒤 돌아가기 어려워요', description:'준비만 길어지거나 잠깐 미룬 뒤 다시 시작하지 못합니다.', primary:'execution-reentry', related:['perfectionism','self-efficacy'] },
      { id:'w12-overload', label:'여러 역할이 겹쳐 쉬어도 할 일이 남아 있어요', description:'일·학업·가사·돌봄과 보이지 않는 준비 부담이 한쪽에 몰립니다.', primary:'role-overload', related:['burnout','relationship-boundaries'] },
      { id:'w12-digital', label:'휴대전화·영상·검색이 수면과 회복을 밀어내요', description:'잠깐 보려던 사용이 길어지고 집중과 휴식으로 돌아가기 어렵습니다.', primary:'digital-recovery', related:['sleep-hygiene','rumination'] },
      { id:'w12-attention', label:'집중이 자주 끊기고 다시 하던 일로 돌아가기 어려워요', description:'주의가 끊기는 원인을 진단하지 않고 수면·스트레스·디지털 자극을 먼저 살펴봅니다.', primary:'digital-recovery', related:['sleep-hygiene','stress'] }
    ],
    self: [
      { id:'w12-transition', label:'큰 변화 뒤 생활 리듬과 역할을 다시 잡기 어려워요', description:'이직·퇴직·진학·이사·관계 변화 뒤 일과와 연결을 새로 만드는 중입니다.', primary:'transition-adjustment', related:['resilience','life-satisfaction'] },
      { id:'w12-decision', label:'선택지가 많거나 틀릴까 걱정되어 결정을 계속 미뤄요', description:'결정 피로를 독립 진단하지 않고 생각 반복과 기준 압박을 먼저 구분합니다.', primary:'rumination', related:['perfectionism','anxiety-signals'] }
    ]
  };

  document.querySelectorAll('[data-impact]').forEach((button) => button.addEventListener('click', () => { state.impact = button.dataset.impact; }));
  document.querySelectorAll('[data-domain]').forEach((button) => button.addEventListener('click', () => { state.domain = button.dataset.domain; setTimeout(injectScenes, 0); }));

  const setProgress = (step) => document.querySelectorAll('[data-step-indicator]').forEach((item) => item.classList.toggle('is-current', item.dataset.stepIndicator === String(step)));

  async function loadIndex() {
    const response = await fetch('/rescan/data/index.json', { cache:'no-store' });
    if (!response.ok) throw new Error('목록을 불러오지 못했습니다.');
    return response.json();
  }

  function injectStyle() {
    if (document.querySelector('#w12-entry-style')) return;
    const style = document.createElement('style');
    style.id = 'w12-entry-style';
    style.textContent = `.w12-scene-card{width:100%;text-align:left;border:1px solid #d9e5e1;border-radius:18px;background:#fff;padding:18px;cursor:pointer}.w12-scene-card:hover,.w12-scene-card:focus-visible{border-color:#4e8074;box-shadow:0 8px 24px rgba(35,79,70,.1)}.w12-scene-card strong{display:block;margin-bottom:5px;font-size:1rem}.w12-scene-card p{margin:0;color:#64706d}.w12-recommend{padding:24px;border:1px solid #d9e5e1;border-radius:22px;background:#fff}.w12-recommend .w12-kicker{font-size:.76rem;font-weight:900;letter-spacing:.12em;color:#37685e}.w12-recommend h4{margin:7px 0 8px;font-size:1.45rem}.w12-recommend p{color:#596461}.w12-recommend a{display:inline-flex;margin-top:12px;padding:13px 18px;border-radius:13px;background:#315e55;color:#fff;font-weight:900;text-decoration:none}.w12-related{margin-top:18px;padding-top:16px;border-top:1px solid #e5ece9}.w12-related a{display:inline-flex;margin:6px 8px 0 0;padding:8px 11px;background:#edf5f2;color:#315e55;font-size:.86rem}.w12-support{margin-bottom:16px;padding:15px;border-left:5px solid #d89b42;background:#fff6df}`;
    document.head.appendChild(style);
  }

  function injectScenes() {
    injectStyle();
    const list = scenes[state.domain] || [];
    list.forEach((scene) => {
      if (sceneGrid.querySelector(`[data-w12-scene="${scene.id}"]`)) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'w12-scene-card';
      button.dataset.w12Scene = scene.id;
      button.innerHTML = `<strong>${scene.label}</strong><p>${scene.description}</p>`;
      button.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); renderRecommendation(scene); }, true);
      sceneGrid.appendChild(button);
    });
  }

  async function renderRecommendation(scene) {
    try {
      const index = await loadIndex();
      const byId = new Map((index.items || []).map((item) => [item.id, item]));
      const primary = byId.get(scene.primary);
      if (!primary) throw new Error('추천 항목이 아직 목록에 반영되지 않았습니다.');
      const related = scene.related.map((id) => byId.get(id)).filter(Boolean).slice(0, 2);
      const support = state.impact === 'support' ? `<div class="w12-support"><strong>점검보다 지원 연결이 먼저일 수 있습니다.</strong><p>기본생활이나 안전을 혼자 유지하기 어렵다면 아래 점검은 상황을 설명하는 보조 도구로만 사용하고, 가까운 사람과 전문·지역 지원체계에 현재 상태를 먼저 알리세요.</p></div>` : '';
      recommendationResult.innerHTML = `${support}<article class="w12-recommend"><span class="w12-kicker">첫 번째 추천</span><h4>${primary.title}</h4><p>${primary.subtitle}</p><a href="/rescan/checklist.html?id=${encodeURIComponent(primary.id)}">이 점검 시작하기 →</a>${related.length ? `<div class="w12-related"><strong>첫 점검 뒤 필요할 때만 함께 보기</strong><div>${related.map((item) => `<a href="/rescan/checklist.html?id=${encodeURIComponent(item.id)}">${item.title}</a>`).join('')}</div></div>` : ''}</article>`;
      sceneStage.hidden = true;
      recommendationStage.hidden = false;
      setProgress(3);
      recommendationStage.scrollIntoView({ behavior:'smooth', block:'start' });
    } catch (error) {
      recommendationResult.textContent = error.message;
    }
  }

  const observer = new MutationObserver(() => { if (!sceneStage.hidden) injectScenes(); });
  observer.observe(sceneGrid, { childList:true });
});
