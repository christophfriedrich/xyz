import _xyz from '../_xyz.mjs';

export default function () {

  const layer = this;

  // Set layer display to true, hide the loader element and change the toggle icon.
  layer.display = true;
  layer.loader.style.display = 'block';
  layer.toggle.textContent = 'layers';

  // Push the layer into the layers hook array.
  _xyz.hooks.push('layers', layer.key);

  // Check whether other group layers are visible.
  if (layer.group) _xyz.layers.groups[layer.group].chkVisibleLayer();

  // Add the layer to map.
  layer.get();

}