import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';

const DisplayCategory = ({ categories, selectedCategory, setSelectedCategory, dark = true }) => {
  const { items } = useContext(AppContext);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Styles matching Item.jsx design
  const styles = {
    container: {
      width: '100%',
      overflowX: 'auto',
      padding: '16px 0',
      marginBottom: '24px',
      backgroundColor: 'transparent'
    },
    scrollContainer: {
      display: 'flex',
      gap: '16px',
      padding: '0 20px',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    },
    categoryCard: (isSelected, isHovered) => ({
      minWidth: '120px',
      maxWidth: '140px',
      height: '160px',
      background: dark ? '#111827' : '#ffffff',
      borderRadius: '16px',
      border: isSelected
        ? `2px solid ${dark ? '#10b981' : '#059669'}`
        : `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      boxShadow: isHovered
        ? '0 10px 25px rgba(0,0,0,0.15), 0 6px 10px rgba(0,0,0,0.08)'
        : '0 3px 12px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      transform: isHovered ? 'translateY(-4px) scale(1.05)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 12px',
      color: dark ? '#f3f4f6' : '#1f2937',
      flexShrink: 0
    }),
    imageContainer: (bgColor) => ({
      width: '70px',
      height: '70px',
      borderRadius: '20px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '12px',
      border: `2px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
      position: 'relative',
      background: bgColor || (dark ? '#1f2937' : '#f9fafb')
    }),
    image: (isHovered) => ({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.4s ease',
      transform: isHovered ? 'scale(1.1)' : 'scale(1)'
    }),
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: dark
        ? 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)'
        : 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 100%)',
      pointerEvents: 'none',
      zIndex: 1
    },
    content: {
      textAlign: 'center',
      width: '100%'
    },
    categoryName: {
      fontSize: '14px',
      fontWeight: '600',
      lineHeight: '1.3',
      margin: '0 0 6px 0',
      color: 'inherit',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minHeight: '36px'
    },
    itemCount: {
      fontSize: '12px',
      fontWeight: '500',
      color: dark ? '#9ca3af' : '#6b7280',
      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      padding: '4px 12px',
      borderRadius: '20px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'
    },
    selectedIndicator: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
    },
    placeholderIcon: {
      width: '40px',
      height: '40px',
      fill: dark ? '#9ca3af' : '#6b7280',
      opacity: 0.8
    }
  };

  // Inline styles for scroll container
  const scrollStyle = {
    display: 'flex',
    gap: '16px',
    padding: '0 20px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  };

  // Inject CSS for hiding scrollbar
  const hideScrollbarStyle = `
    .scroll-container::-webkit-scrollbar {
      display: none;
    }
    .scroll-container {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  return (
    <>
      <style>{hideScrollbarStyle}</style>
      <div style={styles.container}>
        <div className="scroll-container" style={scrollStyle}>
          {categories.map(category => {
            const itemCount = items.filter(item => String(item.categoryId) === String(category.id)).length;
            const isSelected = String(selectedCategory) === String(category.id);
            const isHovered = hoveredCategory === category.id;

            return (
              <div
                key={category.id}
                style={{
                  ...styles.categoryCard(isSelected, isHovered)
                }}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {isSelected && <div style={styles.selectedIndicator} />}

                <div style={styles.imageContainer(category.bgColor)}>
                  <div style={styles.overlay} />
                  {category.imgUrl ? (
                    <img
                      src={category.imgUrl}
                      alt={category.name}
                      style={{
                        ...styles.image(isHovered)
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        // Show SVG placeholder
                        const svgPlaceholder = `
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="${dark ? '#9ca3af' : '#6b7280'}" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        `;
                        e.target.parentNode.innerHTML += svgPlaceholder;
                      }}
                    />
                  ) : (
                    <svg style={styles.placeholderIcon} viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  )}
                </div>

                <div style={styles.content}>
                  <h4 style={styles.categoryName} title={category.name}>
                    {category.name}
                  </h4>

                  <div style={styles.itemCount}>
                    <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '2px' }}>
                      <path d="M2.5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm5 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm0 3a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm-5 3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-11zm.79-5.373c.112-.078.26-.17.444-.275L3.524 6c-.122.074-.272.17-.452.287-.18.117-.35.26-.51.428a2.425 2.425 0 0 0-.398.562c-.11.207-.164.438-.164.692 0 .36.072.65.217.873.144.219.385.328.72.328.215 0 .383-.07.504-.211a.697.697 0 0 0 .188-.463c0-.23-.07-.404-.211-.521-.137-.121-.326-.182-.568-.182h-.282c.024-.203.065-.37.123-.498a1.38 1.38 0 0 1 .252-.37c.108-.11.236-.205.384-.285z" />
                    </svg>
                    {itemCount} items
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DisplayCategory;