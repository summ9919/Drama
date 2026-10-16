import { Platform } from 'react-native';

export const colors = {
  // 页面背景
  canvas: '#C8C6C2',         // 羊绒暖调素灰
  canvasWarm: '#BEBCB8',     // 稍深一档的过渡灰底
  paper: '#FFFFFF',          // 卡片高光白

  // ── 文字 ──
  ink: '#1D2A34',            // 沉稳墨蓝灰 (高对比度深色)
  muted: '#5A6975',          // 雾岩灰 (高清晰度次要文字)
  subtle: '#7E8F9D',         // 次要微灰

  // ── 线条 ──
  line: '#CAD7E2',           // 雾蓝分隔线

  // ── 品牌核心色 (04 MIST BLUE BUTTER 专属色板) ──
  primary: '#6E8EA7',        // 雾蓝焦点主色
  mistBlue: '#B8C9D6',       // 雾蓝 (Mist Blue #B8C9D6)
  mistBlueLight: '#D4E1EA',  // 浅雾蓝
  secondary: '#8EAABF',      // 中间过渡雾蓝
  butter: '#F3DFB5',         // 黄油奶油色 (Butter Cream #F3DFB5)
  butterWarm: '#F8E9C9',     // 柔暖奶油
  slate: '#66717B',          // 板岩灰 (Slate Gray #66717B)

  // ── 辅助装饰色 ──
  paleMist: '#D6E4EE',       // 浅雾蓝底块
  paleButter: '#F7EDD5',     // 浅黄油底块
  dark: '#141E26',           // 相机深色背景
  whiteWarm: '#FEFDFB',      // 温暖珍珠白
};

export const glass = {
  // ── 液态玻璃材质定义 (对齐导航栏高透水感质感) ──
  lightBg: 'rgba(255, 255, 255, 0.20)',
  lightBorder: 'rgba(255, 255, 255, 0.65)',

  cardBg: 'rgba(255, 255, 255, 0.18)',       // 与导航栏 dockGlassBg 完全一致的高透水感底色
  cardBorder: 'rgba(255, 255, 255, 0.65)',   // 通透柔和微光边缘
  cardSubtleBorder: 'rgba(255, 255, 255, 0.45)',

  primaryBg: 'rgba(184, 201, 214, 0.25)',
  primaryBorder: 'rgba(255, 255, 255, 0.75)',

  butterBg: 'rgba(243, 223, 181, 0.35)',
  butterBorder: 'rgba(255, 255, 255, 0.75)',

  darkBg: 'rgba(20, 30, 38, 0.62)',
  darkBorder: 'rgba(255, 255, 255, 0.25)',

  pillBg: 'rgba(255, 255, 255, 0.22)',
  pillBorder: 'rgba(255, 255, 255, 0.65)',

  pressedBg: 'rgba(255, 255, 255, 0.40)',
};

export const shadows = {
  glassSm: {
    shadowColor: '#1A2933',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  glassMd: {
    shadowColor: '#1A2933',
    shadowOpacity: 0.10,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  glassLg: {
    shadowColor: '#1A2933',
    shadowOpacity: 0.14,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  glassPrimaryGlow: {
    shadowColor: '#6E8EA7',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  glassDark: {
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
};

export const fonts = {
  display: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
  body: Platform.select({ ios: 'System', default: 'sans-serif' }) as string,
};

export const radii = { sm: 12, md: 18, lg: 24, xl: 28, full: 9999 };
