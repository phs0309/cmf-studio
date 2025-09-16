import React from 'react';

// 임시로 placeholder 이미지 데이터를 사용합니다.
// 실제 구현 시에는 제공해주신 4개 이미지를 public/examples/ 폴더에 저장하고 경로를 사용하세요.
const EXAMPLE_IMAGES = [
  {
    id: 'concept-car-1',
    title: 'Concept Car 1',
    thumbnail: '/examples/car1.png', // 실제 이미지 경로
    description: 'Futuristic concept vehicle design',
  },
  {
    id: 'concept-car-2', 
    title: 'Concept Car 2',
    thumbnail: '/examples/car2.png', // 실제 이미지 경로
    description: 'Modern automotive concept',
  },
  {
    id: 'robot-charger-1',
    title: 'Robot Charger 1',
    thumbnail: '/examples/robot1.png', // 실제 이미지 경로
    description: 'Robotic charging station design',
  },
  {
    id: 'robot-charger-2',
    title: 'Robot Charger 2', 
    thumbnail: '/examples/robot2.png', // 실제 이미지 경로
    description: 'Alternative robot charger view',
  },
];

interface ExampleImagesProps {
  onImageSelect: (imagePath: string) => void;
}

export const ExampleImages: React.FC<ExampleImagesProps> = ({ onImageSelect }) => {
  const handleImageClick = async (imagePath: string) => {
    try {
      // 이미지를 fetch하여 File 객체로 변환
      const response = await fetch(imagePath);
      const blob = await response.blob();
      const fileName = imagePath.split('/').pop() || 'example.jpg';
      const file = new File([blob], fileName, { type: blob.type });
      
      // 파일 선택 이벤트 트리거
      onImageSelect(imagePath);
    } catch (error) {
      console.error('Error loading example image:', error);
    }
  };

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">예시 이미지 (클릭하여 사용)</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {EXAMPLE_IMAGES.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all duration-200"
            onClick={() => handleImageClick(image.thumbnail)}
          >
            {/* 실제 이미지 표시 */}
            <img
              src={image.thumbnail}
              alt={image.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                // 이미지 로드 실패 시 placeholder 표시
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.fallback-placeholder')) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'fallback-placeholder w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center';
                  placeholder.innerHTML = `
                    <div class="text-center p-2">
                      <div class="text-xs text-gray-600 font-medium mb-1">${image.title}</div>
                      <div class="text-xs text-gray-500">${image.description}</div>
                    </div>
                  `;
                  parent.appendChild(placeholder);
                }
              }}
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-purple-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="bg-white bg-opacity-90 rounded-full p-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
              <p className="text-white text-xs font-medium truncate">{image.title}</p>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        예시 이미지를 클릭하면 자동으로 업로드됩니다
      </p>
    </div>
  );
};
