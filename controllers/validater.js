const db = require("../models");

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

function addWishlistStatusToProduct(product, wishlistVariants) {
    const productData = {
      ...product.toJSON(),
      
    };
  
    for (const variant of product.Variants) {
      const isWishlisted = wishlistVariants.some(wishlistVariant => wishlistVariant.variant_id === variant.variant_id);
  
      const variantData = {
        ...variant.toJSON(),
        is_wishlisted: isWishlisted,
      };
  
      productData.Variants.push(variantData);
    }
  
    return productData;
  }
  
  // Define the isValidPhoneNumber function
function isValidPhoneNumber(phone) {
  // Modify the regular expression pattern based on your phone number format
  const phoneRegex = /^[0-9]{10}$/; // Example: 10-digit phone number
  return phoneRegex.test(phone);
}
  
  
module.exports= {validateEmail, addWishlistStatusToProduct,isValidPhoneNumber};