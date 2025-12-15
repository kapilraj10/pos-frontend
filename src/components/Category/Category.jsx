import React from "react";
import "./Category.css";


const Category = ({
categoryName,
imgUrl,
numberOfItems,
bgColor,
isSelected,
onClick,
}) => {
return (
<div
className={`category-card ${isSelected ? "category-selected" : ""}`}
style={{ backgroundColor: bgColor }}
onClick={onClick}
title={categoryName}
>
<div className="category-icon-wrapper">
<img
src={imgUrl}
alt={categoryName}
className="category-icon"
/>
</div>


<div className="category-info">
<h6 className="category-name">{categoryName}</h6>
<span className="category-count">
{numberOfItems} {numberOfItems === 1 ? "item" : "items"}
</span>
</div>


{isSelected && (
<div className="category-selected-badge">✓</div>
)}
</div>
);
};


export default Category;