document.addEventListener('DOMContentLoaded', () => {
  const cardContainer = document.getElementById('cardContainer');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');

  // Load products from localStorage or use default products
  let products = JSON.parse(localStorage.getItem('products')) || [
    {
      id: "1",
      title: "Mie Goreng",
      description: "Mie goreng khas rumahan, simple dan nikmat.",
      image: "product-list/mie-ayam.jpeg",
      category: "makanan",
      price: 25000
    },
    {
      id: "2",
      title: "Nasi Goreng",
      description: "Nasi goreng spesial dengan bumbu tradisional.",
      image: "product-list/mie-ayam.jpeg",
      category: "makanan",
      price: 28000
    },
    {
      id: "3",
      title: "Soto Ayam",
      description: "Soto ayam hangat dengan kuah rempah khas.",
      image: "product-list/mie-ayam.jpeg",
      category: "makanan",
      price: 30000
    },
    {
      id: "4",
      title: "Bakso Sapi",
      description: "Bakso sapi lezat dengan kuah gurih.",
      image: "product-list/mie-ayam.jpeg",
      category: "makanan",
      price: 27000
    },
    {
      id: "5",
      title: "Ayam Geprek",
      description: "Ayam crispy pedas dengan sambal khas.",
      image: "product-list/mie-ayam.jpeg",
      category: "makanan",
      price: 32000
    },
    {
      id: "6",
      title: "Ice Coffee",
      description: "Kopi dingin spesial dengan rasa khas Tanta Mien.",
      image: "product-list/vanilla-latte.jpg",
      category: "minuman",
      price: 20000
    },
    {
      id: "7",
      title: "Vanilla Latte",
      description: "Latte lembut dengan sentuhan vanila yang manis.",
      image: "product-list/vanilla-latte.jpg",
      category: "minuman",
      price: 30000
    },
    {
      id: "8",
      title: "Mango Smoothie",
      description: "Smoothie mangga segar yang menyegarkan.",
      image: "product-list/vanilla-latte.jpg",
      description: "Smoothie mangga segar yang menyegarkan.",
      image: "product-list/vanilla-latte.jpg",
      category: "minuman",
      price: 25000
    },
    {
      id: "9",
      title: "Teh Tarik",
      description: "Teh tarik creamy dengan aroma khas.",
      image: "product-list/vanilla-latte.jpg",
      category: "minuman",
      price: 22000
    },
    {
      id: "10",
      title: "Lemon Tea",
      description: "Teh lemon segar dengan rasa asam manis.",
      image: "product-list/vanilla-latte.jpg",
      category: "minuman",
      price: 20000
    },
    {
      id: "11",
      title: "Chocolate Cake",
      description: "Kue cokelat lembut dengan rasa premium.",
      image: "product-list/summer-dessertjpeg.jpeg",
      category: "dessert",
      price: 35000
    },
    {
      id: "12",
      title: "Tiramisu",
      description: "Tiramisu klasik dengan lapisan krim lembut.",
      image: "product-list/summer-dessertjpeg.jpeg",
      category: "dessert",
      price: 32000
    },
    {
      id: "13",
      title: "Fruit Tart",
      description: "Tart segar dengan buah-buahan pilihan.",
      image: "product-list/summer-dessertjpeg.jpeg",
      category: "dessert",
      price: 38000
    },
    {
      id: "14",
      title: "Cheesecake",
      description: "Cheesecake creamy dengan topping stroberi.",
      image: "product-list/summer-dessertjpeg.jpeg",
      category: "dessert",
      price: 40000
    },
    {
      id: "15",
      title: "Panna Cotta",
      description: "Panna cotta lembut dengan saus karamel.",
      image: "product-list/summer-dessertjpeg.jpeg",
      category: "dessert",
      price: 36000
    }
  ];

  function renderCards(filteredProducts) {
    cardContainer.innerHTML = '';
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    
    filteredProducts.forEach(product => {
      const cartItem = cart.find(item => item.id === product.id);
      const quantity = cartItem ? cartItem.quantity : 0;
      
      const cardHTML = `
        <div class="col card-item" data-category="${product.category}">
          <div class="card h-100">
            <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover; object-position: center;">
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
        window.addToCart(product);
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
      products = JSON.parse(event.newValue) || products;
      filterCards();
    }
  });
});