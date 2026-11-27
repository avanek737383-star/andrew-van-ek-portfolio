(function(){
 'use strict';var target=document.getElementById('coin-evaluation');if(!target)return;
 var experiment=null,proof=null;var pct=x=>(x*100).toFixed(2)+'%';
 function renderProcessGuide(){
  var process=document.getElementById('coin-process').value;
  var guides={
   fair:{title:'Fair coin: every toss starts fresh',description:'Heads and tails each have a 50% chance, whatever happened before. Past results do not give the AI a predictive advantage.',example:'Example: even after H H H, the next outcome is still equally likely to be H or T. H means heads; T means tails.',takeaway:'Watch for: short runs can favor either player by luck. More flips do not create a pattern in a fair process.'},
   persistent:{title:'Tiny repeating tendency: the last face has a slight edge',description:'The next result repeats the previous face 51.5% of the time, on average. If the last flip was heads, heads is a little more likely next. The difference from 50% is small and can be hard to spot in a short game.',example:'Example: after T, the next result has a 51.5% chance of T and a 48.5% chance of H. Either can happen.',takeaway:'Compare with a simple strategy: always guess the last face. It already has 51.5% expected accuracy under this rule; beating a 50% guess is not enough to show the AI adds value.'},
   alternation:{title:'Switching tendency: changes of side are more likely',description:'This invented rule makes a switch more likely: 58% after a face appears once, and 82% after it repeats twice or more. It is a pattern we deliberately added, not a measurement of human behavior or real coins.',example:'Example: after H H, the next result has an 82% chance of T. That still leaves an 18% chance of another H.',takeaway:'Compare with a simple strategy: always guess the opposite of the last face. A pattern can help that simple rule as well as an AI. A likely result is not a guaranteed one.'}
  };
  var guide=guides[process];
  document.getElementById('coin-rule-title').textContent=guide.title;
  document.getElementById('coin-process-explanation').textContent=guide.description;
  document.getElementById('coin-process-example').textContent=guide.example;
  document.getElementById('coin-process-takeaway').textContent=guide.takeaway;
 }
 function render(){
  renderProcessGuide();
  if(!experiment)return;
  var rule=document.getElementById('coin-test-rule').value;
  var result=experiment.results[rule],selected=document.getElementById('coin-model').value,run=result[selected],c=run.confusion;
  document.getElementById('current-eval-value').textContent=pct(run.accuracy)+' · '+run.n.toLocaleString()+' held-out synthetic test rows';
  document.getElementById('coin-training-summary').textContent='New candidate: '+experiment.sizes.train.toLocaleString()+' training rows, '+experiment.sizes.validation.toLocaleString()+' validation rows; '+experiment.training.completedEpochs+' epochs recorded, checkpoint '+experiment.training.selectedEpoch+' selected by validation loss. The '+experiment.sizes.test.toLocaleString()+'-row test set was evaluated after selection.';
  target.replaceChildren();
  var p=document.createElement('p');p.textContent='Same final test rows for both models. Selected model: '+(selected==='candidate'?'controlled retraining candidate':'recovered original')+'. Test subset: '+rule+'. This table is separate from your current play session.';target.appendChild(p);
  var table=document.createElement('table');table.className='evidence-table';
  var rows=[['Measure','Result / calculation'],['Recovered original',pct(result.original.accuracy)],['Controlled retrain',pct(result.candidate.accuracy)],['Always repeat previous face',pct(run.alwaysRepeatAccuracy)],['Always switch from previous face',pct(run.alwaysSwitchAccuracy)],['Selected model accuracy',(c.tp+c.tn)+' correct ÷ '+run.n+' = '+pct(run.accuracy)],['Selected model 95% Wilson interval',pct(run.wilson95[0])+' to '+pct(run.wilson95[1])],['Heads correctly guessed as heads',String(c.tp)],['Tails correctly guessed as tails',String(c.tn)],['Tails incorrectly guessed as heads',String(c.fp)],['Heads incorrectly guessed as tails',String(c.fn)],['Binary cross-entropy',run.bce.toFixed(4)]];
  rows.forEach((row,i)=>{var tr=document.createElement('tr');row.forEach(value=>{var cell=document.createElement(i?'td':'th');cell.textContent=value;tr.appendChild(cell)});table.appendChild(tr)});target.appendChild(table);
  var tableHelp=document.createElement('details');var tableHelpTitle=document.createElement('summary');tableHelpTitle.textContent='Help with table terms and calculations';tableHelp.appendChild(tableHelpTitle);var glossary=document.createElement('p');glossary.textContent='Reading the table: accuracy is the share of correct guesses. Always-repeat and always-switch are simple comparison strategies, called baselines. The 95% Wilson interval shows sampling uncertainty in this recorded score; it is not a prediction for every future session. Binary cross-entropy measures how the model scores the correct outcomes; lower is better on the same test data.';tableHelp.appendChild(glossary);target.appendChild(tableHelp);
  var note=document.createElement('p');note.textContent='These are observed scores on invented rules. They do not establish an advantage on real coins or people, and a difference between two scores is not automatically statistically significant. The interval describes sampling uncertainty for this run, not uncertainty about every possible deployment.';target.appendChild(note);
  if(proof){var old=document.createElement('p');old.textContent='Recovered original validation: '+(proof.reproducedValidation.confusion.tp+proof.reproducedValidation.confusion.tn)+' correct out of 1,200 = '+pct(proof.reproducedValidation.accuracy)+'. The reconstructed seed-42 rows match the saved validation counts. This validation split was monitored during training, so it is not an untouched final test.';target.appendChild(old)}
  var stamp=document.createElement('p');stamp.className='metric-source';stamp.textContent='Candidate experiment recorded '+new Date(experiment.generatedAt).toLocaleString()+'. Dataset SHA-256: '+experiment.datasetSha256;target.appendChild(stamp);
 }
 renderProcessGuide();
 Promise.all([fetch('data/coin/transparent-training.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json()}),fetch('data/coin/reconstruction.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error();return r.json()})]).then(values=>{experiment=values[0];proof=values[1];render()}).catch(()=>{target.textContent='The evaluation artifact could not be loaded. No substitute score is shown.';document.getElementById('current-eval-value').textContent='Evaluation unavailable'});
 ['coin-process','coin-model','coin-test-rule'].forEach(id=>document.getElementById(id).addEventListener('change',render));
})();
