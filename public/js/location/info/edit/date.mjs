import _xyz from '../../../_xyz.mjs';

import valChange from './valChange.mjs';

import datepicker from 'js-datepicker';

export default (record, entry) => {

  if(entry.type === 'datetime') entry.value = formatDateTime(entry.value);
  if(entry.type === 'date') entry.value = formatDate(entry.value);

  let input = _xyz.utils.createElement({
    tag: 'input',
    options: {
      value: entry.value || '',
      type: 'text'
    },
    appendTo: entry.val,
    eventListener: {
      event: 'input',
      funct: e => {
        //valChange(e.target, record, entry); 
      }
    }
  });

  pickDate(input, record, entry);

};

export function formatDate(str){

  let d = new Date(str),
    options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },
    loc = 'en-GB';

  return d ? d.toLocaleDateString(loc, options) : false;
}

export function formatDateTime(str){
  let d = new Date(str),
    options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },
    loc = 'en-GB';
  return d ? d.toLocaleDateString(loc, options) + ', ' + d.toLocaleTimeString(loc) : false;
}

export function meltDateStr(str){ // from beautiful string to sql-date format
  let _d = new Date(str),
    dd = _d.getDate(),
    mm = _d.getMonth()+1,
    yyyy = _d.getFullYear();
  
  if(dd<10) 
  { dd=`0${dd}`; } 
  if(mm<10) { mm=`0${mm}`; } 
  
  return `${yyyy}-${mm}-${dd}`;
}

export function pickDate(element, record, entry){

  return datepicker(element, {
    position: 'tr',
    formatter: function(el, date, instance) {
        
      let _d = new Date(date), dateStr;
        
      if(entry.type === 'date') dateStr = formatDate(_d);
      if(entry.type === 'datetime') dateStr = formatDateTime(_d);
        
      el.value = dateStr;
        
    },
    onSelect: function(el, date, instance){
      entry.val = meltDateStr(date);
      console.log(entry.val);
    }
  });

}

