import { Platform } from 'react-native';

export const colors = {
  // ── 纯净小清新背景 (空气感、高通透、告别死板与灰暗) ──
  canvas: '#F7F8FA',         // 清透微氧柔白 (极净自然，明亮通透)
  canvasWarm: '#F0F2F5',     // 柔和微冷过渡白
  paper: '#FFFFFF',          // 纯净雪白

  // ── 现代时尚文字 ──
  ink: '#151D24',            // 极致深邃墨黑 (顶级对比与阅读质感)
  muted: '#687785',          // 晨雾柔灰 (舒适不扎眼)
  subtle: '#94A3B1',         // 极轻弱化文字

  // ── 线条 ──
  line: 'rgba(21, 29, 36, 0.08)', // 极细空气描边

  // ── 品牌核心色 (清透晴空海盐蓝与冰蓝点缀，纯正时尚小清新) ──
  primary: '#2D6A94',        // 清澈深霁蓝 (纯净、专业、时尚自然)
  primaryLight: '#4782AA',   // 灵动晴空蓝
  primarySoft: 'rgba(45, 106, 148, 0.12)', // 极浅晴空微光
  mistBlue: '#7FA7C4',       // 清风霁蓝
  mistBlueLight: '#EAF2F8',  // 空气冰蓝底
  secondary: '#5C8BA6',      // 优雅海盐蓝
  butter: '#F5DEB3',         // 奶油暖黄
  butterWarm: '#FAF0DB',     // 柔焦杏白
  slate: '#546370',          // 雅致冷岩灰

  // ── 辅助装饰色 ──
  paleMist: '#EDF4F9',       // 浅冰蓝底块
  paleButter: '#FDF7EB',     // 浅米油底块
  dark: '#11181F',           // 取景器专业暗黑
  whiteWarm: '#FFFFFF',      // 纯白
};

export const glass = {
  // ── 现代微光液态玻璃材质 (极轻盈、清澈水润) ──
  lightBg: 'rgba(255, 255, 255, 0.82)',
  lightBorder: 'rgba(255, 255, 255, 0.95)',

  cardBg: 'rgba(255, 255, 255, 0.78)',       // 通透澄澈微光白
  cardBorder: 'rgba(255, 255, 255, 0.90)',   // 细腻光泽边缘
  cardSubtleBorder: 'rgba(21, 29, 36, 0.06)',

  primaryBg: 'rgba(45, 106, 148, 0.10)',
  primaryBorder: 'rgba(45, 106, 148, 0.28)',

  butterBg: 'rgba(245, 222, 179, 0.28)',
  butterBorder: 'rgba(255, 255, 255, 0.90)',

  darkBg: 'rgba(17, 24, 31, 0.75)',
  darkBorder: 'rgba(255, 255, 255, 0.20)',

  pillBg: 'rgba(255, 255, 255, 0.88)',
  pillBorder: 'rgba(255, 255, 255, 0.95)',

  pressedBg: 'rgba(255, 255, 255, 0.95)',
};

export const shadows = {
  glassSm: {
    shadowColor: '#1A2936',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  glassMd: {
    shadowColor: '#1A2936',
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  glassLg: {
    shadowColor: '#1A2936',
    shadowOpacity: 0.10,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  glassPrimaryGlow: {
    shadowColor: '#2D6A94',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  glassDark: {
    shadowColor: '#000000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};

export const fonts = {
  display: Platform.select({ ios: 'Georgia', default: 'serif' }) as string,
  body: Platform.select({ ios: 'System', default: 'sans-serif' }) as string,
};

export const radii = { sm: 14, md: 20, lg: 26, xl: 32, full: 9999 };
