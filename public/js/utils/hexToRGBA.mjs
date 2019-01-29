export function hexToRGBA(hex, opacity, asArray = false) {
  
  let rgb = (function(res) {

    if(res) return (function(parts) {
        
      return parts;
        
    }(res.slice(1,4).map(function(val) { return parseInt(val, 16); })));
      
  }(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)));

  if(asArray) {
    return rgb ? [rgb[0], rgb[1], rgb[2], opacity] : [0,0,0,0];
  }
  
  return rgb ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`: '';
    
}