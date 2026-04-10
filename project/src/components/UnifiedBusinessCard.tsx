import React from "react";

interface UnifiedBusinessCardProps {
  id?: string;
  name?: string;
  slug?: string;
  category?: string;
  location?: string;
  image?: string;
  onClick?: () => void;
}

export const UnifiedBusinessCard: React.FC<UnifiedBusinessCardProps> = (props) => {
  return (
    <div 
      onClick={props.onClick}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition cursor-pointer"
    >
      {props.image && (
        <img 
          src={props.image} 
          alt={props.name} 
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
      )}
      <h3 className="font-semibold text-lg text-gray-800">{props.name || "Nom non disponible"}</h3>
      {props.category && (
        <p className="text-sm text-gray-600 mt-1">{props.category}</p>
      )}
      {props.location && (
        <p className="text-sm text-gray-500 mt-1">{props.location}</p>
      )}
    </div>
  );
};

export default UnifiedBusinessCard;
      
   
     

