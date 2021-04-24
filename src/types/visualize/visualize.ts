import { Theme } from '../theme';

type ThemeNames = 'normal';
export interface VisualizeParams {
  regexpParse: any;
  flags: string;
  themeOption?: ThemeNames | Theme;
  containerId?: string;
}
