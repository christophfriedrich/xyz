import {Style, Fill, Stroke} from 'ol/style';
import {hexToRGBA} from './hexToRGBA.mjs';

export function convertStyleToOpenLayers(styleObject) {
  
  return new Style({
    fill: styleObject.fill === false ? undefined : new Fill({
      color: hexToRGBA(styleObject.fillColor, styleObject.fillOpacity || 1, true)
    }),
    stroke: styleObject.stroke === false ? undefined : new Stroke({
      color: hexToRGBA(styleObject.color, 1, true),
      width: styleObject.weight
    })
  });
    
}