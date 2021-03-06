import _xyz from '../../../_xyz.mjs';

import d3_selection from 'd3-selection';

export default layer => {

  let width = layer.drawer.clientWidth;
      
  const svg = d3_selection
    .select(layer.style.legend)
    .append('svg')
    .attr('width', width);
  
  let y = 10;

  // Create array for NI (not in) value filter.
  layer.filter.legend[layer.style.theme.field] = {
    ni: []
  };

  Object.entries(layer.style.theme.cat).forEach(cat => {

    let cat_style = Object.assign({}, layer.style.default, cat[1]);

    svg.append('rect')
      .attr('x', 4)
      .attr('y', y + 3)
      .attr('width', 14)
      .attr('height', 14)
      .style('fill', cat_style.fillColor)
      .style('fill-opacity', cat_style.fillOpacity)
      .style('stroke', cat_style.color);      
      
    svg.append('text')
      .attr('x', 25)
      .attr('y', y + 11)
      .style('font-size', '12px')
      .style('alignment-baseline', 'central')
      .style('cursor', 'pointer')
      .text(cat[0].label || cat[0])
      .on('click', function () {
        if (this.style.opacity == 0.5) {
          this.style.opacity = 1;

          // Splice value out of the NI (not in) legend filter.
          layer.filter.legend[layer.style.theme.field].ni.splice(layer.filter.legend[layer.style.theme.field].ni.indexOf(cat[0]), 1);

        } else {
          this.style.opacity = 0.5;
          
          // Push value into the NI (not in) legend filter.
          layer.filter.legend[layer.style.theme.field].ni.push(cat[0]);
        }
      
        layer.get();
      });
      
    y += 20;
  });
      
  // Attach box for other/default categories.
  if (layer.style.theme.other) {

    svg.append('rect')
      .attr('x', 4)
      .attr('y', y + 3)
      .attr('width', 14)
      .attr('height', 14)
      .style('fill', layer.style.default.fillColor)
      .style('fill-opacity', layer.style.default.fillOpacity)
      .style('stroke', layer.style.default.color);       
      
    // Attach text with filter on click for the other/default category.
    svg.append('text')
      .attr('x', 25)
      .attr('y', y + 11)
      .style('font-size', '12px')
      .style('alignment-baseline', 'central')
      .style('cursor', 'pointer')
      .text('other')
      .on('click', function () {
        if (this.style.opacity == 0.5) {
          this.style.opacity = 1;

          // Empty IN values filter array.
          layer.filter.legend[layer.style.theme.field].in = [];
          
        } else {
          this.style.opacity = 0.5;
          
          // Assign all cat keys to IN filter.
          layer.filter.legend[layer.style.theme.field].in = Object.keys(layer.style.theme.cat);
        }
      
        layer.get();
      });
      
    y += 20;
  }

  // Set height of the svg element.
  svg.attr('height', y);
      
};