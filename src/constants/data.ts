import type { InspirationItem } from '../types';

export interface EditorialShot {
  id: string;
  image: any;
  title: string;
  meta: string;
}

export const editorialShots: EditorialShot[] = [
  {
    id: '1',
    image: require('../../assets/editorial/editorial_1.jpg'),
    title: '街景 · 暖金侧光',
    meta: '35mm',
  },
  {
    id: '2',
    image: require('../../assets/editorial/editorial_2.jpg'),
    title: '室内 · 柔调窗光',
    meta: '50mm',
  },
  {
    id: '3',
    image: require('../../assets/editorial/editorial_3.jpg'),
    title: '海岸 · 电影侧颜',
    meta: '85mm',
  },
];

export const inspirationImages: InspirationItem[] = [
  { uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=85', title: '暖光街角', tag: '人像 · 逆光' },
  { uri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85', title: '奶油人像', tag: '人像 · 柔焦' },
  { uri: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=85', title: '城市黄昏', tag: '风景 · 金色' },
  { uri: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=700&q=85', title: '海边日落', tag: '风景 · 低饱和' },
  { uri: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=700&q=85', title: '森林呼吸', tag: '自然 · 清透' },
  { uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=700&q=85', title: '蓝调夜色', tag: '夜景 · 氛围' },
];

export const sampleAlbum = [
  inspirationImages[1],
  inspirationImages[3],
  inspirationImages[4],
  inspirationImages[0],
  inspirationImages[5],
  inspirationImages[2],
];
