/* AI Bias & Algorithmic Fairness Audit Lab Interactivity */

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

		// Base candidate capability score (Everyone is well qualified at baseline ~78)
		var baseScore = 78;
		var rawModifier = 0;
		var penalties = [];

		// Name & Demographic Proxy Weights
		if (name === 'majority_male') {
			rawModifier += 7;
			penalties.push({ label: 'Traditional Background Match (matches most historical hires)', val: '+7% bonus', type: 'positive' });
		} else if (name === 'female_leader') {
			rawModifier -= 8;
			penalties.push({ label: '"Women in Tech" Club Title Penalty (flagged as non-standard keyword)', val: '-8% penalty', type: 'negative' });
		} else if (name === 'diverse_male') {
			rawModifier -= 6;
			penalties.push({ label: 'Non-traditional phrasing / civic fellowship keyword penalty', val: '-6% penalty', type: 'negative' });
		} else if (name === 'hispanic_male') {
			rawModifier -= 5;
			penalties.push({ label: 'First-gen scholar title penalty', val: '-5% penalty', type: 'negative' });
		} else if (name === 'gender_neutral') {
			rawModifier -= 4;
			penalties.push({ label: 'Gender-neutral wording penalty (less frequent in historical hires)', val: '-4% penalty', type: 'negative' });
		}

		// Graduation Year (Age Proxy)
		if (year <= 1995) {
			rawModifier -= 14;
			penalties.push({ label: 'Graduation Year Penalty (>25 yrs exp / assumed "overqualified")', val: '-14% penalty', type: 'negative' });
		} else if (year <= 2005) {
			rawModifier -= 6;
			penalties.push({ label: 'Graduation Year Penalty (>15 yrs exp)', val: '-6% penalty', type: 'negative' });
		} else if (year >= 2023) {
			rawModifier -= 2;
			penalties.push({ label: 'Recent Grad Entry Penalty (<2 yrs exp)', val: '-2% penalty', type: 'negative' });
		} else {
			rawModifier += 4;
			penalties.push({ label: 'Sweet-Spot Experience Bonus (Mid-Career 8-10 yrs)', val: '+4% bonus', type: 'positive' });
		}

		// Career Gap
		if (gap === 'caregiving') {
			rawModifier -= 11;
			penalties.push({ label: 'Resume Gap Penalty (Parental / Family Caregiving leave)', val: '-11% penalty', type: 'negative' });
		} else if (gap === 'military') {
			rawModifier -= 4;
			penalties.push({ label: 'Service Transition Penalty (Military skills phrasing mismatch)', val: '-4% penalty', type: 'negative' });
		} else if (gap === 'medical') {
			rawModifier -= 9;
			penalties.push({ label: 'Employment Gap Penalty (Medical recovery period)', val: '-9% penalty', type: 'negative' });
		} else {
			rawModifier += 3;
			penalties.push({ label: 'Continuous Employment Bonus (Zero career interruptions)', val: '+3% bonus', type: 'positive' });
		}

		// Education Pedigree
		if (school === 'ivy') {
			rawModifier += 8;
			penalties.push({ label: 'Elite Institution Brand Bonus (Ivy League keyword)', val: '+8% bonus', type: 'positive' });
		} else if (school === 'community') {
			rawModifier -= 7;
			penalties.push({ label: 'Community College Route Penalty', val: '-7% penalty', type: 'negative' });
		} else if (school === 'bootcamp') {
			rawModifier -= 8;
			penalties.push({ label: 'Self-Taught / Open Source Path Penalty', val: '-8% penalty', type: 'negative' });
		} else {
			rawModifier += 1;
			penalties.push({ label: 'State University Benchmark (GVSU / Regional State)', val: '+1% neutral', type: 'positive' });
		}

		var rawScore = Math.min(99, Math.max(30, baseScore + rawModifier));
		var fairScore = rawScore;

		// Apply Toggles
		if (masking) {
			// Strip name and school pedigree
			fairScore = baseScore;
			if (gap === 'none') fairScore += 2;
			if (year >= 2010 && year <= 2020) fairScore += 3;
		}

		if (orthogonal) {
			// Neutralize demographic and gender bias vectors
			if (fairScore < 76) fairScore += 10;
		}

		if (parity) {
			// Ensure passing rate satisfies 80% rule
			fairScore = Math.max(82, fairScore);
		}

		// Disparate Impact Ratio (DIR)
		var benchmarkScore = 88; // traditional archetype baseline
		var dir = (fairScore / benchmarkScore).toFixed(2);
		if (parseFloat(dir) > 1.0) dir = '1.00';

		rawScoreEl.textContent = rawScore + '%';
		calibScoreEl.textContent = fairScore + '%';
		rawMeterEl.style.width = rawScore + '%';
		fairMeterEl.style.width = fairScore + '%';
		dirMetricEl.textContent = dir;

		if (parseFloat(dir) >= 0.80) {
			dirBadgeEl.className = 'audit-badge pass';
			dirBadgeEl.textContent = 'PASS: 80% Rule Satisfied';
		} else {
			dirBadgeEl.className = 'audit-badge fail';
			dirBadgeEl.textContent = 'FAIL: Adverse Bias Detected';
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
			insight: 'Because older medical articles and classic literature wrote "he" after "doctor" over twice as often, the model guesses "he" 64% of the time, even though over half of modern medical students are women.'
		},
		nurse: {
			title: 'Nurse Scenario',
			probs: [
				{ label: 'she', pct: 76 },
				{ label: 'he', pct: 16 },
				{ label: 'they', pct: 8 }
			],
			insight: 'Caregiving and nursing titles in public web text skew heavily female. The model guesses "she" almost 5 times more often than "he", repeating the historical stereotype.'
		},
		executive: {
			title: 'CEO Scenario',
			probs: [
				{ label: 'he', pct: 71 },
				{ label: 'she', pct: 22 },
				{ label: 'they', pct: 7 }
			],
			insight: 'Business news and corporate filings over-index male leadership, so the model assumes a Chief Executive is male over 70% of the time.'
		},
		assistant: {
			title: 'Executive Assistant Scenario',
			probs: [
				{ label: 'she', pct: 68 },
				{ label: 'they', pct: 18 },
				{ label: 'he', pct: 14 }
			],
			insight: 'Secretarial and administrative titles lean heavily toward "she" in historical articles, showing how easily job assumptions get baked into automated writing assistants.'
		},
		programmer: {
			title: 'Software Architect Scenario',
			probs: [
				{ label: 'he', pct: 66 },
				{ label: 'she', pct: 21 },
				{ label: 'they', pct: 13 }
			],
			insight: 'Tech forums and open-source commit history have historical gender imbalances, which standard language models blindly copy unless engineers explicitly calibrate them.'
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
	// MODULE 3: Class Imbalance & The Accuracy Trap
	// ==========================================
	var ratioSlider = document.getElementById('ratio-slider');
	var thresholdSlider = document.getElementById('threshold-slider');
	var ratioDisplay = document.getElementById('ratio-display');
	var thresholdDisplay = document.getElementById('threshold-display');

	var statAccuracy = document.getElementById('stat-accuracy');
	var statMajRec = document.getElementById('stat-maj-rec');
	var statMinRec = document.getElementById('stat-min-rec');
	var minRecNote = document.getElementById('min-rec-note');
	var statEod = document.getElementById('stat-eod');
	var eodNote = document.getElementById('eod-note');
	var imbalanceTakeaway = document.getElementById('imbalance-takeaway');

	function updateImbalance() {
		var majPct = parseInt(ratioSlider.value, 10);
		var minPct = 100 - majPct;
		var threshold = parseInt(thresholdSlider.value, 10) / 100;

		ratioDisplay.textContent = majPct + '% Majority / ' + minPct + '% Minority';
		thresholdDisplay.textContent = threshold.toFixed(2);

		var method = document.querySelector('input[name="rebalance-method"]:checked').value;

		var majCatch = Math.min(99, Math.round(98 - (threshold - 0.50) * 30));
		var minCatch = Math.max(5, Math.round(minPct * 1.8 - (threshold - 0.50) * 45));

		if (method === 'weights') {
			minCatch = Math.min(92, minCatch + 45);
			majCatch = Math.max(86, majCatch - 6);
		} else if (method === 'smote') {
			minCatch = Math.min(95, minCatch + 60);
			majCatch = Math.max(90, majCatch - 3);
		}

		var overallAcc = ((majCatch * majPct + minCatch * minPct) / 100).toFixed(1);
		var eod = Math.abs((majCatch - minCatch) / 100).toFixed(2);

		statAccuracy.textContent = overallAcc + '%';
		statMajRec.textContent = majCatch + '%';
		statMinRec.textContent = minCatch + '%';
		statEod.textContent = eod;

		if (minCatch < 40) {
			minRecNote.textContent = '(Virtually ignored by model!)';
			minRecNote.style.color = '#ef4444';
		} else if (minCatch < 75) {
			minRecNote.textContent = '(Needs attention)';
			minRecNote.style.color = '#f59e0b';
		} else {
			minRecNote.textContent = '(Fair & balanced)';
			minRecNote.style.color = '#22c55e';
		}

		if (parseFloat(eod) <= 0.08) {
			eodNote.textContent = '(Clean & Fair: Gap < 0.08)';
			eodNote.style.color = '#22c55e';
		} else {
			eodNote.textContent = '(Unfair Gap: Target < 0.05)';
			eodNote.style.color = '#ef4444';
		}

		if (method === 'none' && minCatch < 35) {
			imbalanceTakeaway.innerHTML = '<strong>The Big Takeaway:</strong> Notice how overall accuracy stays high (' + overallAcc + '%) even though the model is failing ' + (100 - minCatch) + '% of the minority group! Try turning on <strong>SMOTE Balancing</strong> to force the algorithm to treat both groups fairly.';
		} else if (method === 'smote') {
			imbalanceTakeaway.innerHTML = '<strong>SMOTE In Action:</strong> By generating balanced training examples for the minority group, the model learned to recognize qualified candidates in both groups, dropping the fairness gap down to ' + eod + '!';
		} else {
			imbalanceTakeaway.innerHTML = '<strong>Cost Weighting In Action:</strong> Penalizing the algorithm harder for making mistakes on minority cases improved the catch rate to ' + minCatch + '%.';
		}
	}

	ratioSlider.addEventListener('input', updateImbalance);
	thresholdSlider.addEventListener('input', updateImbalance);
	document.querySelectorAll('input[name="rebalance-method"]').forEach(function (radio) {
		radio.addEventListener('change', updateImbalance);
	});

	updateImbalance();
})();
