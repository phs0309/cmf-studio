import React from 'react';
import { RecommendedDesign } from '../services/apiService';

interface RecommendationCardProps extends RecommendedDesign {
  onEdit?: (imageUrl: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  image_url, 
  title, 
  description,
  onEdit 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200/80 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] md:aspect-[3/2] lg:aspect-[5/3] bg-gray-100">
        <img 
          src={image_url} 
          alt={title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line mb-4">{description}</p>
        {onEdit && (
          <button
            onClick={() => onEdit(image_url)}
            className="w-full text-blue-900 bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-200 font-bold rounded-lg text-base px-4 py-2 text-center transition-colors duration-200"
          >
            디자인 수정하기
          </button>
        )}
      </div>
    </div>
  );
};
