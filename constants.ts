
export interface Material {
  name: string;
  thumbnail: string;
}

export const MATERIALS: Material[] = [
  { name: '플라스틱', thumbnail: '/materials/plastic.jpg' },
  { name: '브러시드 알루미늄', thumbnail: "\materials\brushed-aluminum.jpg" },
  { name: '폴리시드 크롬', thumbnail: "\materials\polished-chrome.jpg" },
  { name: '소프트터치 러버', thumbnail: "\materials\soft-touch-rubber.jpg" },
  { name: '반투명 유리', thumbnail: "\materials\glass.jpg" },
  { name: '재활용 패브릭', thumbnail: "\materials\recycle-fabric.jpg" }
];

export const MATERIAL_NAMES: string[] = MATERIALS.map(m => m.name);

export const FINISHES: string[] = [
  '무광',
  '유광',
  '반광',
  '소프트 터치',
  '아노다이징'
];
