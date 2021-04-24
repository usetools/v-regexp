import { RaphaelElement } from 'raphael';
import { Theme } from '../theme';

export interface GetCharSizeParams {
  fontSize?: number;
  fontBold?: string;
  templateText?: RaphaelElement;
}

export interface CharSizeCacheItem {
  width?: number;
  height?: number;
}

export interface CharSizeCache {
  [propName: number]: CharSizeCacheItem;
}

export interface GetHighlightTextParams {
  str: string;
  theme: Theme;
  color?: string;
}
