(function () {
	'use strict';

	// ==========================================
	// MODULE 1: Resume Screening Simulator
	// ==========================================
	var candNameEl = document.getElementById('cand-name');
	var gradYearEl = document.getElementById('grad-year');
	var careerGapEl = document.getElementById('career-gap');
	var pedigreeEl = document.getElementById('pedigree');

	var toggleMasking = document.getElementById('toggle-masking');
	var toggleOrthogonal = document.getElementById('toggle-orthogonal');
	var toggleParity = document.getElementById('toggle-parity');

	var rawScoreEl = document.getElementById('raw-score');
	var calibScoreEl = document.getElementById('calib-score');
	var rawMeterEl = document.getElementById('raw-meter');
	var fairMeterEl = document.getElementById('fair-meter');
	var dirBadgeEl = document.getElementById('dir-badge');
	var dirMetricEl = document.getElementById('dir-metric');
	var penaltyListEl = document.getElementById('penalty-list');

	function updateResumeAudit() {
		var name = candNameEl.value;
		var year = parseInt(gradYearEl.value, 10);
		var gap = careerGapEl.value;
		var school = pedigreeEl.value;

		var masking = toggleMasking.checked;
		var orthogonal = toggleOrthogonal.checked;
		var parity = toggleParity.checked;

		// Base candidate capability score
		var baseScore = 78;
		var rawModifier = 0;
		var penalties = [];

		// Name / Background proxy weights
		if (name === 'majority_male') {
			rawModifier += 7;
			penalties.push({ label: 'Statistical Archetype Affinity (Traditional Male)', val: '+7%', type: 'positive' });
		} else if (name === 'female_leader') {
			rawModifier -= 8;
			penalties.push({ label: 'Gendered Leadership Affinity ("Women in Tech" Penalty)', val: '-8%', type: 'negative' });
		} else if (name === 'diverse_male') {
			rawModifier -= 6;
			penalties.push({ label: 'Implicit Lexical Cosine Distance Penalty', val: '-6%', type: 'negative' });
		} else if (name === 'hispanic_male') {
			rawModifier -= 5;
			penalties.push({ label: 'Demographic Proxy Embedding Shift', val: '-5%', type: 'negative' });
		} else if (name === 'gender_neutral') {
			rawModifier -= 4;
			penalties.push({ label: 'Non-Conforming Profile Vector Distance', val: '-4%', type: 'negative' });
		}

		// Graduation Year (Age proxy)
		if (year <= 1995) {
			rawModifier -= 14;
			penalties.push({ label: 'Age Proxy Penalty (>25 yrs exp / "Overqualified" bias)', val: '-14%', type: 'negative' });
		} else if (year <= 2005) {
			rawModifier -= 7;
			penalties.push({ label: 'Mid-Career Seniority Shift', val: '-7%', type: 'negative' });
		} else if (year >= 2023) {
			rawModifier += 3;
			penalties.push({ label: 'Recent Graduate Entry Bias', val: '+3%', type: 'positive' });
		}

		// Career Gap
		if (gap === 'caregiving') {
			rawModifier -= 11;
			penalties.push({ label: 'Employment Gap Penalty (Parental/Caregiver Leave)', val: '-11%', type: 'negative' });
		} else if (gap === 'military') {
			rawModifier -= 4;
			penalties.push({ label: 'Non-Standard Skillset Translation Penalty', val: '-4%', type: 'negative' });
		} else if (gap === 'medical') {
			rawModifier -= 9;
			penalties.push({ label: 'Unexplained Continuity Flag', val: '-9%', type: 'negative' });
		} else {
			rawModifier += 4;
			penalties.push({ label: 'Uninterrupted Linear Career Progression', val: '+4%', type: 'positive' });
		}

		// Institutional Pedigree
		if (school === 'ivy') {
			rawModifier += 12;
			penalties.push({ label: 'Elite Institution Affinity (Ivy League)', val: '+12%', type: 'positive' });
		} else if (school === 'state') {
			rawModifier += 2;
			penalties.push({ label: 'Accredited Regional State University Baseline', val: '+2%', type: 'neutral' });
		} else if (school === 'community') {
			rawModifier -= 5;
			penalties.push({ label: 'Non-Traditional Higher Ed Penalty', val: '-5%', type: 'negative' });
		} else if (school === 'bootcamp') {
			rawModifier -= 8;
			penalties.push({ label: 'Alternative Education Filter Flag', val: '-8%', type: 'negative' });
		}

		var rawScore = Math.max(10, Math.min(99, baseScore + rawModifier));

		// Calculate Fair / Calibrated score based on toggles
		var fairModifier = rawModifier;
		if (masking) {
			// Strips demographic name & graduation year penalties
			fairModifier = fairModifier * 0.4;
		}
		if (orthogonal) {
			// Subspace projection zeroes out gendered & demographic vectors
			fairModifier = fairModifier * 0.15;
		}
		if (parity) {
			// Boosts score to demographic baseline
			fairModifier = Math.max(0, fairModifier);
		}

		var fairScore = Math.max(10, Math.min(99, Math.round(baseScore + fairModifier)));

		// Disparate Impact Ratio (DIR) relative to traditional archetype benchmark (~92)
		var dir = (fairScore / 92).toFixed(2);

		rawScoreEl.textContent = rawScore + '%';
		calibScoreEl.textContent = fairScore + '%';
		rawMeterEl.style.width = rawScore + '%';
		fairMeterEl.style.width = fairScore + '%';
		dirMetricEl.textContent = dir;

		if (parseFloat(dir) >= 0.80) {
			dirBadgeEl.className = 'audit-badge pass';
			dirBadgeEl.textContent = 'PASS: EEOC Compliant';
		} else {
			dirBadgeEl.className = 'audit-badge fail';
			dirBadgeEl.textContent = 'FAIL: Adverse Impact';
		}

		// Render penalty items
		penaltyListEl.innerHTML = '';
		penalties.forEach(function (p) {
			var li = document.createElement('li');
			li.className = 'penalty-item ' + p.type;
			li.innerHTML = '<span>' + p.label + '</span> <strong>' + p.val + '</strong>';
			penaltyListEl.appendChild(li);
		});
	}

	[candNameEl, gradYearEl, careerGapEl, pedigreeEl, toggleMasking, toggleOrthogonal, toggleParity].forEach(function (el) {
		el.addEventListener('change', updateResumeAudit);
	});
	updateResumeAudit();

	// ==========================================
	// MODULE 2: LLM Probability Explorer
	// ==========================================
	var promptPresetEl = document.getElementById('prompt-preset');
	var probBarsEl = document.getElementById('prob-bars');
	var llmInsightEl = document.getElementById('llm-insight-content');

	var promptData = {
		doctor: {
			title: 'Doctor Scenario',
			probs: [
				{ label: 'he', pct: 64 },
				{ label: 'she', pct: 28 },
				{ label: 'they', pct: 8 }
			],
			insight: 'Training data reflects historical medical workforce distributions from 20th-century texts, driving the model to assign over 2.2x greater next-token probability to masculine pronouns for physician titles unless neutralized.'
		},
		nurse: {
			title: 'Nurse Scenario',
			probs: [
				{ label: 'she', pct: 76 },
				{ label: 'he', pct: 16 },
				{ label: 'they', pct: 8 }
			],
			insight: 'Caregiving professions in public web text exhibit steep gender asymmetry. The next-token logit for feminine pronouns dominates by nearly 5:1, illustrating severe occupational stereotyping.'
		},
		executive: {
			title: 'CEO Scenario',
			probs: [
				{ label: 'he', pct: 71 },
				{ label: 'she', pct: 22 },
				{ label: 'they', pct: 7 }
			],
			insight: 'Corporate SEC filings and news scrapes over-index male Fortune 500 leadership, creating strong directional bias in executive role completions.'
		},
		assistant: {
			title: 'Executive Assistant Scenario',
			probs: [
				{ label: 'she', pct: 68 },
				{ label: 'they', pct: 18 },
				{ label: 'he', pct: 14 }
			],
			insight: 'Administrative support titles mirror historical secretarial associations, revealing persistent linguistic bias in generative drafting tools.'
		},
		programmer: {
			title: 'Software Architect Scenario',
			probs: [
				{ label: 'he', pct: 66 },
				{ label: 'she', pct: 21 },
				{ label: 'they', pct: 13 }
			],
			insight: 'Technical forums and open-source commit history reflect acute gender imbalance, which autoregressive models directly codify without targeted fine-tuning.'
		}
	};

	function updateLLMModule() {
		var key = promptPresetEl.value;
		var data = promptData[key];
		probBarsEl.innerHTML = '';

		data.probs.forEach(function (item) {
			var row = document.createElement('div');
			row.className = 'prob-bar-row';
			row.innerHTML = '<span class="prob-label">"' + item.label + '"</span>' +
				'<div class="prob-track"><div class="prob-fill" style="width: ' + item.pct + '%;"></div></div>' +
				'<span class="prob-pct">' + item.pct + '%</span>';
			probBarsEl.appendChild(row);
		});

		llmInsightEl.textContent = data.insight;
	}

	promptPresetEl.addEventListener('change', updateLLMModule);
	updateLLMModule();

	// ==========================================
	// MODULE 3: Accuracy Paradox & Class Imbalance
	// ==========================================
	var ratioSlider = document.getElementById('ratio-slider');
	var ratioDisplay = document.getElementById('ratio-display');
	var thresholdSlider = document.getElementById('threshold-slider');
	var thresholdDisplay = document.getElementById('threshold-display');
	var rebalanceRadios = document.querySelectorAll('input[name="rebalance-method"]');

	var statAccuracy = document.getElementById('stat-accuracy');
	var statMajRecall = document.getElementById('stat-maj-recall');
	var statMinRecall = document.getElementById('stat-min-recall');

	function updateImbalanceModule() {
		var majRatio = parseInt(ratioSlider.value, 10);
		var minRatio = 100 - majRatio;
		var threshold = parseInt(thresholdSlider.value, 10) / 100;

		ratioDisplay.textContent = majRatio + '% Majority / ' + minRatio + '% Minority';
		thresholdDisplay.textContent = threshold.toFixed(2);

		var method = 'none';
		rebalanceRadios.forEach(function (r) {
			if (r.checked) method = r.value;
		});

		// Compute simulated metrics
		var majRecall, minRecall, accuracy;

		if (method === 'none') {
			majRecall = Math.min(99.5, 95 + (1 - threshold) * 8);
			// Low recall on minority due to threshold suppression
			minRecall = Math.max(0.5, Math.min(85, (1 - threshold) * 50 * (minRatio / 30)));
			accuracy = ((majRecall * majRatio) + (minRecall * minRatio)) / 100;
		} else if (method === 'weights') {
			majRecall = Math.max(88, 92 - (threshold * 5));
			minRecall = Math.min(92, Math.max(50, 80 - (threshold * 25)));
			accuracy = ((majRecall * majRatio) + (minRecall * minRatio)) / 100;
		} else { // smote
			majRecall = Math.max(90, 94 - (threshold * 6));
			minRecall = Math.min(96, Math.max(65, 88 - (threshold * 20)));
			accuracy = ((majRecall * majRatio) + (minRecall * minRatio)) / 100;
		}

		statAccuracy.textContent = accuracy.toFixed(1) + '%';
		statMajRecall.textContent = majRecall.toFixed(1) + '%';
		statMinRecall.textContent = minRecall.toFixed(1) + '%';
	}

	ratioSlider.addEventListener('input', updateImbalanceModule);
	thresholdSlider.addEventListener('input', updateImbalanceModule);
	rebalanceRadios.forEach(function (r) {
		r.addEventListener('change', updateImbalanceModule);
	});
	updateImbalanceModule();
})();
