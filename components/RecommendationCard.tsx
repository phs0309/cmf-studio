import React from 'react';
import { RecommendedDesign } from '../services/apiService';

export const RecommendationCard: React.FC<RecommendedDesign> = ({ 
  image_url, 
  title, 
  description 
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
        <p className="text-base text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
