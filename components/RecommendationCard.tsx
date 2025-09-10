import React from 'react';

interface RecommendationCardProps {
  imageUrl: string;
  title: string;
  description: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ imageUrl, title, description }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200/80 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-video bg-gray-100">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
};
