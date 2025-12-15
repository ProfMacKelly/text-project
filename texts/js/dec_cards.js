(function(){
  const contentEl = document.getElementById('content');
  const backBtn = document.getElementById('backBtn');
  const restartBtn = document.getElementById('restartBtn');

  let stage = 'start';
  let history = ['start'];

  const go = (next) => {
    stage = next;
    history.push(next);
    render();
  };

  const back = () => {
    if (history.length <= 1) return;
    history = history.slice(0, -1);
    stage = history[history.length - 1];
    render();
  };

  const restart = () => {
    stage = 'start';
    history = ['start'];
    render();
  };

  const branches = {
    start: {
      question: 'Identify the claim: What type of harm is alleged?',
      options: [
        { text: 'Personal Injury', next: 'duty' },
        { text: 'Property Damage', next: 'duty' },
        { text: 'Economic Loss', next: 'duty' },
        { text: 'Psychiatric Injury', next: 'duty' }
      ]
    },
    duty: {
      question: 'Did the defendant owe a duty of care (Caparo Test)?',
      options: [
        { text: 'Yes — Duty established', next: 'breach' },
        { text: 'No — No duty', next: 'noLiability' },
        { text: 'Special Duty (e.g. Professional, Public Authority)', next: 'breach' }
      ]
    },
    breach: {
      question: 'Did the defendant breach that duty?',
      options: [
        { text: 'Yes — Breach found', next: 'causation' },
        { text: 'No — Conduct was reasonable', next: 'noLiability' }
      ]
    },
    causation: {
      question: 'Did the breach cause the harm? ("But for" test)',
      options: [
        { text: 'Yes — Causation established', next: 'remoteness' },
        { text: 'No — Harm would have occurred anyway', next: 'noLiability' },
        { text: 'Multiple or complex causes', next: 'remoteness' }
      ]
    },
    remoteness: {
      question: 'Was the damage too remote?',
      options: [
        { text: 'No — Foreseeable damage', next: 'defenses' },
        { text: 'Yes — Too remote', next: 'noLiability' },
        { text: 'Thin skull rule applies', next: 'defenses' }
      ]
    },
    defenses: {
      question: 'Are there any defenses?',
      options: [
        { text: 'Contributory Negligence', next: 'policy' },
        { text: 'Volenti (Assumption of Risk)', next: 'noLiability' },
        { text: 'No valid defense', next: 'policy' }
      ]
    },
    policy: {
      question: 'Do policy considerations support or limit liability?',
      options: [
        { text: 'Policy supports liability', next: 'liable' },
        { text: 'Policy limits liability', next: 'noLiability' },
        { text: 'Mixed — Balance fairness and justice', next: 'liable' }
      ]
    },
    liable: {
      result: '✅ Defendant is liable in negligence.',
      restart: true
    },
    noLiability: {
      result: '❌ No liability in negligence — one or more elements not satisfied.',
      restart: true
    }
  };

  function render(){
    const current = branches[stage];
    if (!current) return;

    let html = '';
    if (current.question){
      html += '<h2 class="question">' + current.question + '</h2>';
      html += '<div class="options">';
      current.options.forEach(function(opt, i){
        html += '<button class="option-btn" data-next="' + opt.next + '">' + opt.text + '</button>';
      });
      html += '</div>';
    } else {
      html += '<div class="result">' + current.result + '</div>';
    }
    contentEl.innerHTML = html;

    // Wire option clicks
    contentEl.querySelectorAll('.option-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        go(this.getAttribute('data-next'));
      });
    });

    // Update controls
    backBtn.disabled = history.length <= 1;
  }

  backBtn.addEventListener('click', back);
  restartBtn.addEventListener('click', restart);

  render();
})();