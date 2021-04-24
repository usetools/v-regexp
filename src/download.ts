import { RaphaelPaper } from 'raphael';
import ssap, { SaveSVGOptions } from 'save-svg-as-png';

export function png(paper: RaphaelPaper, name: string, options: SaveSVGOptions = {}) {
  // @ts-ignore
  ssap.saveSvgAsPng(paper?.canvas, `${name}.png`, options);
}
