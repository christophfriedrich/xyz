import {Style, Fill, Stroke, Icon} from 'ol/style';
import {hexToRGBA} from './hexToRGBA.mjs';
import {default as svg_symbols} from './svg_symbols.mjs';

export function convertStyleToOpenLayers(styleObject, feature) {
  
  if(styleObject.marker && feature && feature.getGeometry().getType() == 'Point') {
    const src = styleObject.icon;
    
    const svgHeight = src.match(/height%3D%22(\d+)%22/);
    const iconHeight = svgHeight != null && Array.isArray(svgHeight) && svgHeight.length == 2 ? svgHeight[1] : 1000;
    const scale = (styleObject.iconSize || 40) / iconHeight;

    const anchor = (styleObject.marker.iconAnchor || [0.5, 1]);

    return new Style({
      image: new Icon({
        src: src,
        scale: scale,
        anchor: anchor,
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