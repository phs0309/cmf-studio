import React from 'react';
import { RecommendedDesign } from '../services/apiService';

export const RecommendationCard: React.FC<RecommendedDesign> = ({ 
  image_url, 
  title, 
  description 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200/80 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-video bg-gray-100">
        <img 
          src={image_url} 
          alt={title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
};
