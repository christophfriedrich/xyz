import {Style, Fill, Stroke, Icon} from 'ol/style';
import {hexToRGBA} from './hexToRGBA.mjs';
import {default as svg_symbols} from './svg_symbols.mjs';

export function convertStyleToOpenLayers(styleObject, feature) {
  
  if(styleObject.marker && feature && feature.getGeometry().getType() == 'Point') {
    const scale = (styleObject.marker.iconSize || 40) / 1000;
    return new Style({
      image: new Icon({
        src: svg_symbols(styleObject.marker),
        scale: scale,
        anchor: (styleObject.marker.iconAnchor || [20, 40]).map(x => x/scale),
        anchorXUnits: 'pixels',
        anchorYUnits: 'pixels'
      }),
      zIndex: styleObject.zIndex
    });
  }

  return new Style({
    fill: styleObject.fill === false ? undefined : new Fill({
      color: hexToRGBA(styleObject.fillColor, styleObject.fillOpacity || 1, true)
    }),
    stroke: styleObject.stroke === false ? undefined : new Stroke({
      color: hexToRGBA(styleObject.color, 1, true),
      width: styleObject.weight
    }),
    zIndex: styleObject.zIndex
  });
    
}