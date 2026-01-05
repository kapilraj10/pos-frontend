import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';

const Item = ({ itemName, itemImage, itemPrice, itemId, paymentTypes, stock = 0, dark = true, showCartControls = false }) => {
  const { addToCart, removeFromCart, updateQuantity, cartItems } = useContext(AppContext);

  // Check if item is in cart
  const itemInCart = cartItems?.find(cartItem => String(cartItem.id) === String(itemId));
  const quantityInCart = itemInCart ? itemInCart.quantity : 0;

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleAddToCart = () => {
    // Allow add when stock > 0. If low stock (1..5) we still allow a single-unit add;
    // the AppContext will enforce per-user caps and backend will validate.
    const isOutOfStock = stock != null && stock <= 0;
    if (isOutOfStock) return;
    addToCart({
      name: itemName,
      imgUrl: itemImage,
      price: itemPrice,
      id: itemId,
      quantity: 1
    });
  };

  const handleRemoveFromCart = () => {
    if (quantityInCart > 1) {
      // Decrease quantity by exactly 1 using updateQuantity
      updateQuantity(itemId, quantityInCart - 1);
    } else {
      // Remove completely when quantity would reach 0
      removeFromCart(itemId);
    }
  };

  const handleRemoveItem = () => {
    removeFromCart(itemId);
  };

  // Inline styles with cart-friendly design
  const styles = {
    card: {
      width: showCartControls ? '280px' : '160px',
      height: showCartControls ? '120px' : '220px',
      background: dark ? '#111827' : '#ffffff',
      borderRadius: '14px',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
      boxShadow: isHovered
        ? '0 8px 20px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)'
        : '0 3px 10px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      transform: isHovered ? (showCartControls ? 'scale(1.01)' : 'translateY(-4px)') : 'none',
      display: 'flex',
      flexDirection: showCartControls ? 'row' : 'column',
      color: dark ? '#f3f4f6' : '#1f2937',
      margin: showCartControls ? '12px 0' : '0'
    },
    imageContainer: {
      width: showCartControls ? '100px' : '100%',
      height: showCartControls ? '100%' : '100px',
      position: 'relative',
      overflow: 'hidden',
      background: dark ? '#1f2937' : '#f9fafb',
      borderRight: showCartControls ? `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.4s ease',
      transform: isHovered ? 'scale(1.08)' : 'scale(1)'
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '40%',
      background: dark
        ? 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)'
        : 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 100%)',
      pointerEvents: 'none',
      zIndex: 1
    },
    content: {
      padding: showCartControls ? '16px' : '12px',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: showCartControls ? '8px' : '8px'
    },
    titleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '8px'
    },
    title: {
      fontSize: showCartControls ? '15px' : '13px',
      fontWeight: '600',
      lineHeight: '1.3',
      margin: 0,
      color: 'inherit',
      flex: 1,
      display: '-webkit-box',
      WebkitLineClamp: showCartControls ? 2 : 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    price: {
      fontSize: showCartControls ? '16px' : '14px',
      fontWeight: '700',
      color: dark ? '#10b981' : '#059669',
      margin: showCartControls ? '0 0 8px 0' : '0'
    },
    cartBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      margin: '8px 0'
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      padding: '6px 12px',
      borderRadius: '20px',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
    },
    quantityBtn: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      border: 'none',
      background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      color: dark ? '#f3f4f6' : '#374151',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      userSelect: 'none'
    },
    quantityBtnHover: {
      background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
      transform: 'scale(1.1)'
    },
    quantityDisplay: {
      fontSize: '16px',
      fontWeight: '700',
      color: 'inherit',
      minWidth: '30px',
      textAlign: 'center'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      marginTop: showCartControls ? 'auto' : '0'
    },
    addButton: {
      background: isPressed
        ? (dark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)')
        : (dark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'),
      color: dark ? '#ffffff' : '#059669',
      padding: showCartControls ? '8px 16px' : '6px 12px',
      borderRadius: '8px',
      fontSize: showCartControls ? '13px' : '11px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'all 0.15s ease',
      transform: isPressed ? 'scale(0.95)' : 'scale(1)',
      border: `1px solid ${dark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
      flex: showCartControls ? 1 : 'auto'
    },
    removeButton: {
      background: isPressed
        ? (dark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)')
        : (dark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'),
      color: dark ? '#ffffff' : '#dc2626',
      padding: showCartControls ? '8px 16px' : '6px 12px',
      borderRadius: '8px',
      fontSize: showCartControls ? '13px' : '11px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'all 0.15s ease',
      transform: isPressed ? 'scale(0.95)' : 'scale(1)',
      border: `1px solid ${dark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
      flex: showCartControls ? 1 : 'auto'
    },
    buttonIcon: {
      fontSize: showCartControls ? '14px' : '12px'
    },
    paymentTypes: {
      display: 'flex',
      gap: '6px',
      flexWrap: 'wrap',
      marginTop: '6px'
    },
    paymentBadge: {
      fontSize: '10px',
      padding: '3px 8px',
      borderRadius: '6px',
      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      color: dark ? '#9ca3af' : '#6b7280',
      border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'
    },
    quantityBadge: {
      position: 'absolute',
      top: '10px',
      right: '10px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: '700',
      padding: '4px 10px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      zIndex: 2,
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    }
  };

  const [minusHovered, setMinusHovered] = useState(false);
  const [plusHovered, setPlusHovered] = useState(false);
  const [removeHovered, setRemoveHovered] = useState(false);

  if (showCartControls && quantityInCart > 0) {
    // Cart Item View
    return (
      <div
        style={styles.card}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={styles.imageContainer}>
          <div style={styles.overlay} />
          <img
            src={itemImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'}
            alt={itemName}
            style={styles.image}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JdGVtPC90ZXh0Pjwvc3ZnPg==';
            }}
          />
        </div>

        <div style={styles.content}>
          <div style={styles.titleRow}>
            <h6 style={styles.title} title={itemName}>
              {itemName}
            </h6>
          </div>

          <div style={styles.cartBadge}>
            <div style={styles.quantityControls}>
              <button
                style={{
                  ...styles.quantityBtn,
                  ...(minusHovered ? styles.quantityBtnHover : {})
                }}
                onClick={handleRemoveFromCart}
                onMouseEnter={() => setMinusHovered(true)}
                onMouseLeave={() => setMinusHovered(false)}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
                </svg>
              </button>

              <span style={styles.quantityDisplay}>
                {quantityInCart}
              </span>

              <button
                style={{
                  ...styles.quantityBtn,
                  ...(plusHovered ? styles.quantityBtnHover : {})
                }}
                onClick={() => {
                  // Prevent adding if out of stock or if cart already has all available stock
                  if (stock != null && stock <= 0) return;
                  if (stock != null && quantityInCart >= stock) return;
                  handleAddToCart();
                }}
                onMouseEnter={() => setPlusHovered(true)}
                onMouseLeave={() => setPlusHovered(false)}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>
              </button>
            </div>
          </div>

          <div style={styles.price}>
            रु{itemPrice * quantityInCart}
            <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '4px' }}>
              (₹{itemPrice} × {quantityInCart})
            </span>
          </div>

          <div style={styles.actionButtons}>
            <button
              style={{
                ...styles.removeButton,
                ...(removeHovered ? { background: dark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)' } : {})
              }}
              onClick={handleRemoveItem}
              onMouseEnter={() => setRemoveHovered(true)}
              onMouseLeave={() => setRemoveHovered(false)}
              onMouseDown={() => setIsPressed(true)}
              onMouseUp={() => setIsPressed(false)}
            >
              <svg
                width="14"
                height="14"
                fill="currentColor"
                style={styles.buttonIcon}
                viewBox="0 0 16 16"
              >
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
              </svg>
              Remove
            </button>
          </div>

          {paymentTypes && Array.isArray(paymentTypes) && paymentTypes.length > 0 && (
            <div style={styles.paymentTypes}>
              {paymentTypes.slice(0, 2).map((type, idx) => (
                <span key={idx} style={styles.paymentBadge}>
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular Item View (Product Card)
  const isOutOfStock = stock != null && stock <= 0;

  return (
    <div
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (!isOutOfStock) handleAddToCart();
      }}
    >
      <div style={styles.imageContainer}>
        <div style={styles.overlay} />
        <img
          src={itemImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'}
          alt={itemName}
          style={styles.image}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFmMjkzNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRtbGUiIGR5PSIuM2VtIj5JdGVtIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
          }}
        />

        {quantityInCart > 0 && (
          <div style={styles.quantityBadge}>
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            {quantityInCart}
          </div>
        )}
        {/* Stock indicators */}
        {isOutOfStock && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: 6, fontSize: 12, zIndex: 3 }}>
            Out of stock
          </div>
        )}
        {!isOutOfStock && stock != null && stock > 0 && (
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(16, 185, 129, 0.9)', color: 'white', padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: '700', zIndex: 3 }}>
            {stock}
          </div>
        )}
      </div>

      <div style={styles.content}>
        <h6 style={styles.title} title={itemName}>
          {itemName}
        </h6>

        <div style={styles.price}>
          रु{itemPrice}
        </div>

        {paymentTypes && Array.isArray(paymentTypes) && paymentTypes.length > 0 && (
          <div style={styles.paymentTypes}>
            {paymentTypes.slice(0, 2).map((type, idx) => (
              <span key={idx} style={styles.paymentBadge}>
                {type.length > 8 ? type.substring(0, 7) + '...' : type}
              </span>
            ))}
            {paymentTypes.length > 2 && (
              <span style={styles.paymentBadge}>+{paymentTypes.length - 2}</span>
            )}
          </div>
        )}

        <div style={styles.actionButtons}>
          <button
            style={{
              ...styles.addButton,
              ...(isOutOfStock ? { opacity: 0.6, cursor: 'not-allowed' } : {})
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onClick={(e) => {
              e.stopPropagation();
              if (isOutOfStock) return;
              handleAddToCart();
            }}
            aria-disabled={isOutOfStock}
            disabled={isOutOfStock}
          >
            <svg
              width="12"
              height="12"
              fill="currentColor"
              style={styles.buttonIcon}
              viewBox="0 0 16 16"
            >
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            {isOutOfStock ? 'Out of stock' : (quantityInCart > 0 ? 'Add More' : 'Add to Cart')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Item;