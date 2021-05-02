import { Theme } from '../theme';

type ThemeNames = 'normal' | 'gorgeous';
// 主题
export type ThemeOption = ThemeNames | Theme;
export interface VisualizeParams {
  /**
   * 解析正则对象
   */
  regexpParse: any;
  /**
   * 正则标志参数
   */
  flags: string;
  /**
   * 主题
   * - string 主题名称
   * - Theme 对象，自定义主题配置
   */
  themeOption?: ThemeOption;
  /**
   * 可视化内容挂载Dom元素ID
   */
  containerId?: string;
}
