
export interface Material {
  name: string;
  thumbnail: string;
}

export const MATERIALS: Material[] = [
  { name: '플라스틱', thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=100&h=100&fit=crop&crop=center' },
  { name: '브러시드 알루미늄', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop&crop=center' },
  { name: '폴리시드 크롬', thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop&crop=center' },
  { name: '천연 오크 우드', thumbnail: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=100&h=100&fit=crop&crop=center' },
  { name: '카본 파이버', thumbnail: 'https://images.unsplash.com/photo-1578068141014-79c92f21b61a?w=100&h=100&fit=crop&crop=center' },
  { name: '소프트터치 러버', thumbnail: 'https://images.unsplash.com/photo-1558618666-fbd2c20af0c8?w=100&h=100&fit=crop&crop=center' },
  { name: '반투명 유리', thumbnail: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop&crop=center' },
  { name: '양극처리 티타늄', thumbnail: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=100&h=100&fit=crop&crop=center' },
  { name: '재활용 패브릭', thumbnail: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=100&h=100&fit=crop&crop=center' }
];

export const MATERIAL_NAMES: string[] = MATERIALS.map(m => m.name);

export const FINISHES: string[] = [
  '무광',
  '유광',
  '반광',
  '소프트 터치',
  '아노다이징'
];
