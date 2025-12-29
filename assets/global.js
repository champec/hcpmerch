// Global JavaScript functionality

// Add to cart functionality
function addToCart(formData) {
  fetch(window.routes.cart_add_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    updateCartCount();
    console.log('Added to cart:', data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

// Update cart count
function updateCartCount() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(data => {
      const cartCount = document.querySelector('.cart-count');
      if (cartCount) {
        cartCount.textContent = data.item_count;
      }
    });
}

// Variant selector functionality
class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.updatePickupAvailability();
    this.updateURL();
    this.updateVariantInput();

    if (!this.currentVariant) {
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updatePrice();
      this.updateAddToCartButton();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant || !this.currentVariant.featured_media) return;
    const newMedia = document.querySelector(
      `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
    );
    if (!newMedia) return;
    const parent = newMedia.parentElement;
    parent.prepend(newMedia);
    window.scrollTo({ top: 0 });
  }

  updateURL() {
    if (!this.currentVariant) return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    // Implement pickup availability if needed
  }

  updateAddToCartButton() {
    const addButton = document.querySelector('.product__add-button');
    if (!addButton) return;

    if (this.currentVariant.available) {
      addButton.disabled = false;
      addButton.textContent = window.variantStrings.addToCart;
    } else {
      addButton.disabled = true;
      addButton.textContent = window.variantStrings.soldOut;
    }
  }

  updatePrice() {
    const priceElement = document.querySelector('.product__price');
    if (!priceElement) return;
    
    priceElement.innerHTML = this.currentVariant.price;
  }

  setUnavailable() {
    const addButton = document.querySelector('.product__add-button');
    if (!addButton) return;
    addButton.textContent = window.variantStrings.unavailable;
    addButton.disabled = true;
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
});
