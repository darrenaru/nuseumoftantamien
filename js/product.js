document.addEventListener('DOMContentLoaded', () => {
  const cardContainer = document.getElementById('cardContainer');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');

  // Load products from localStorage
  let products = JSON.parse(localStorage.getItem('products')) || [];

  function renderCards(filteredProducts) {
    cardContainer.innerHTML = '';
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    if (filteredProducts.length === 0) {
      cardContainer.innerHTML = '<p class="text-center">No products found.</p>';
      return;
    }

    filteredProducts.forEach(product => {
      const cartItem = cart.find(item => item.id === product.id);
      const quantity = cartItem ? cartItem.quantity : 0;
      
      const cardHTML = `
        <div class="col card-item" data-category="${product.category}">
          <div class="card h-100">
            <img src="${product.image || 'images/placeholder.jpg'}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover; object-position: center;">
            <div class="card-body">
              <h5 class="card-title">${product.title}</h5>
              <p class="card-text">${product.description}</p>
              <p class="card-text card-price"><strong>Rp ${product.price.toLocaleString('id-ID')}</strong></p>
              ${quantity > 0 ? `
                <div class="quantity-control d-flex align-items-center justify-content-center">
                  <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${product.id}">−</button>
                  <span class="quantity mx-2">${quantity}</span>
                  <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${product.id}">+</button>
                </div>
              ` : `
                <button class="btn btn-primary add-to-cart" data-id="${product.id}">Order</button>
              `}
            </div>
          </div>
        </div>
      `;
      cardContainer.insertAdjacentHTML('beforeend', cardHTML);
    });

    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        const product = products.find(p => p.id === productId);
        window.addToCart({ ...product }); // Type will be set in cart
        renderCards(filteredProducts);
      });
    });

    document.querySelectorAll('.increase-quantity').forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        window.updateQuantity(productId, 1);
        renderCards(filteredProducts);
      });
    });

    document.querySelectorAll('.decrease-quantity').forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        window.updateQuantity(productId, -1);
        renderCards(filteredProducts);
      });
    });
  }

  function filterCards() {
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;

    const filteredProducts = products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchText);
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    renderCards(filteredProducts);
  }

  // Initial render
  renderCards(products);

  // Event listeners for search and category filter
  searchInput.addEventListener('input', filterCards);
  categorySelect.addEventListener('change', filterCards);

  // Update products when cart is updated
  window.addEventListener('cartUpdated', () => {
    filterCards();
  });

  // Listen for storage changes to update products
  window.addEventListener('storage', (event) => {
    if (event.key === 'products') {
      products = JSON.parse(event.newValue) || [];
      filterCards();
    }
  });

  // Listen for custom productsUpdated event
  window.addEventListener('productsUpdated', () => {
    products = JSON.parse(localStorage.getItem('products')) || [];
    filterCards();
  });
});