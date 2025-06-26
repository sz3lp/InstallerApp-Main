import React from "react";

export interface ServiceCardProps {
  title: string;
  description: string;
  priceRange: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  highlight?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  priceRange,
  icon,
  selected,
  onClick,
  highlight = false,
}) => {
  const base =
    "relative w-full cursor-pointer border rounded-lg p-4 transition-transform hover:scale-105";
  const state = selected
    ? "ring-2 ring-primary border-primary bg-white"
    : "border-gray-300 bg-gray-50";
  const classes = `${base} ${state}`;

  return (
    <div className={classes} onClick={onClick} role="button" tabIndex={0}>
      {highlight && (
        <span className="absolute top-0 right-0 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-bl">
          Best Value
        </span>
      )}
      <div className="flex items-center space-x-2">
        {icon && <span className="text-2xl">{icon}</span>}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
      <p className="text-sm font-medium mt-2">{priceRange}</p>
    </div>
  );
};

export default ServiceCard;
