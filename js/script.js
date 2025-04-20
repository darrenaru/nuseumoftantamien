document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotalElement = document.getElementById("cartTotal");
  const clearCartButton = document.getElementById("clearCart");
  const submitOrderButton = document.getElementById("submitOrder");
  const cartCountElement = document.getElementById("cartCount");

  // Load cart from localStorage or initialize empty
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Save cart to localStorage
  function saveCart() {
      localStorage.setItem("cart", JSON.stringify(cart));
  }

  // Add item to cart
  window.addToCart = function(product) {
      const existingItem = cart.find(item => item.id === product.id);
      if (existingItem) {
          existingItem.quantity += 1;
      } else {
          cart.push({ ...product, quantity: 1, notes: "" });
      }
      saveCart();
      renderCart();
      window.dispatchEvent(new Event('cartUpdated'));
  };

  // Update item quantity
  window.updateQuantity = function(productId, change) {
      const item = cart.find(item => item.id === productId);
      if (item) {
          item.quantity += change;
          if (item.quantity <= 0) {
              cart = cart.filter(item => item.id !== productId);
          }
          saveCart();
          renderCart();
          window.dispatchEvent(new Event('cartUpdated'));
      }
  };

  // Update item notes
  window.updateNotes = function(productId, notes) {
      const item = cart.find(item => item.id === productId);
      if (item) {
          item.notes = notes;
          saveCart();
          window.dispatchEvent(new Event('cartUpdated'));
      }
  };

  // Remove item from cart
  window.removeFromCart = function(productId) {
      cart = cart.filter(item => item.id !== productId);
      saveCart();
      renderCart();
      window.dispatchEvent(new Event('cartUpdated'));
  };

  // Render cart items
  function renderCart() {
      if (!cartItemsContainer) return; // Prevent null reference
      cartItemsContainer.innerHTML = "";
      if (cart.length === 0) {
          cartItemsContainer.innerHTML = '<p class="text-center">Your cart is empty.</p>';
          cartTotalElement.textContent = "0";
          cartCountElement.textContent = "0";
          submitOrderButton.disabled = true;
          return;
      }

      cart.forEach(item => {
          const itemHTML = `
              <div class="cart-item d-flex justify-content-between align-items-center mb-3" data-id="${item.id}">
                  <div>
                      <h5>${item.title}</h5>
                      <p>Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</p>
                      <input type="text" class="form-control cart-notes" placeholder="Add notes (e.g., No sugar)" value="${item.notes || ''}">
                  </div>
                  <div class="d-flex align-items-center">
                      <button class="btn btn-sm btn-outline-secondary me-2 decrease-quantity">−</button>
                      <span>${item.quantity}</span>
                      <button class="btn btn-sm btn-outline-secondary ms-2 increase-quantity">+</button>
                      <button class="btn btn-sm btn-danger ms-3 remove-item">Remove</button>
                  </div>
              </div>
          `;
          cartItemsContainer.insertAdjacentHTML("beforeend", itemHTML);
      });

      // Calculate and display total
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      cartTotalElement.textContent = total.toLocaleString('id-ID');

      // Update cart count
      const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCountElement.textContent = itemCount;

      // Enable submit button if cart is not empty
      submitOrderButton.disabled = false;
  }

  // Event delegation for cart item buttons
  cartItemsContainer.addEventListener("click", function (event) {
      const target = event.target;
      const cartItem = target.closest(".cart-item");
      if (!cartItem) return;
      const productId = cartItem.getAttribute("data-id");

      if (target.classList.contains("increase-quantity")) {
          window.updateQuantity(productId, 1);
      } else if (target.classList.contains("decrease-quantity")) {
          window.updateQuantity(productId, -1);
      } else if (target.classList.contains("remove-item")) {
          window.removeFromCart(productId);
      }
  });

  // Debounce function to limit how often a function is called
  function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
          const later = () => {
              clearTimeout(timeout);
              func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
      };
  }

  // Event delegation for notes input with debouncing
  cartItemsContainer.addEventListener("input", function (event) {
      const target = event.target;
      if (target.classList.contains("cart-notes")) {
          const cartItem = target.closest(".cart-item");
          if (!cartItem) return;
          const productId = cartItem.getAttribute("data-id");
          const debouncedUpdateNotes = debounce((id, value) => {
              window.updateNotes(id, value);
              // Optionally re-render cart if needed (e.g., to sync UI)
              // renderCart();
          }, 500); // Increased to 500ms for smoother typing
          debouncedUpdateNotes(productId, target.value);
      }
  });

  // Clear cart
  clearCartButton.addEventListener("click", () => {
      cart = [];
      saveCart();
      renderCart();
      window.dispatchEvent(new Event('cartUpdated'));
  });

  // Submit order
  submitOrderButton.addEventListener("click", () => {
      if (cart.length === 0) {
          alert("Your cart is empty. Please add items before submitting.");
          return;
      }

      // Generate order summary
      let orderSummary = "Order Submitted!\n\nItems:\n";
      cart.forEach(item => {
          orderSummary += `${item.title} x${item.quantity} (Rp ${item.price.toLocaleString('id-ID')})`;
          if (item.notes) {
              orderSummary += ` - Notes: ${item.notes}`;
          }
          orderSummary += "\n";
      });
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      orderSummary += `\nTotal: Rp ${total.toLocaleString('id-ID')}`;

      // Show confirmation
      alert(orderSummary);

      // Clear cart after submission
      cart = [];
      saveCart();
      renderCart();
      window.dispatchEvent(new Event('cartUpdated'));
  });

  // Initial cart render
  renderCart();

  // Search functionality
  searchInput.addEventListener("input", function () {
      filterCards();
  });

  // Category filter
  categorySelect.addEventListener("change", function () {
      filterCards();
  });
});