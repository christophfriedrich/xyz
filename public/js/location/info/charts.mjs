import Chart from 'chart.js';

import _xyz from '../../_xyz.mjs';

export default (group) => {

  const graph = _xyz.utils.createElement({
    tag: 'div',
    style: {
      position: 'relative'
    }
  });

  const canvas = _xyz.utils.createElement({
    tag: 'canvas',
    appendTo: graph
  });

  const labels = group.fields.map(field => field.label);

  const data = group.fields.map(field => field.value);

  //let _default_options = 
      
  new Chart(canvas, {
    type: group.chart.type || 'line',
    data: {
      labels: labels,
      datasets: [{
        label: group.label,
        backgroundColor: group.chart.backgroundColor || '#cf9',
        borderColor: group.chart.borderColor || '#079e00',
        data: data
      }]
    },
    options: {
      responsive: true,
      legend: {
        display: group.chart.legend
      },
      scales: {
        yAxes: [
          {
            ticks: {
              callback: (label, index, labels) => {
                return group.chart.unit ? units(group, label) : label;
              }
            },
            scaleLabel: {
              display: (group.chart.unit ? true : false),
              labelString: (group.chart.unit ? scale(group) : false)
            }
          }
        ]
      }
    }
  });

  return graph;
};


function scale(group){
  let _scale;
  switch(group.chart.unit){
  case 'k': _scale = '1k = 1 000'; break;
  case 'M': _scale = '1M = 1 000 000'; break;
  }
  return _scale;
}

function units(group, label){
  let _label;
  switch(group.chart.unit){
  case 'k': _label = label/1000 + 'k'; break;
  case 'M': _label = label/1000000 + 'M'; break;
  }
  return _label;
}