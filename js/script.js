document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const categorySelect = document.getElementById("categorySelect");
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalElement = document.getElementById("cartTotal");
    const clearCartButton = document.getElementById("clearCart");
    const submitOrderButton = document.getElementById("submitOrder");
    const cartCountElement = document.getElementById("cartCount");
    const orderSummaryContainer = document.getElementById("orderSummary");
  
    
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
    
    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
  
    
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
  
    
    window.updateNotes = function(productId, notes) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.notes = notes;
            saveCart();
            window.dispatchEvent(new Event('cartUpdated'));
        }
    };
  
    
    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
        window.dispatchEvent(new Event('cartUpdated'));
    };
  
    
    function renderCart() {
        if (!cartItemsContainer) return; 
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
  
        
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartTotalElement.textContent = total.toLocaleString('id-ID');
  
        
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = itemCount;
  
        
        submitOrderButton.disabled = false;
    }
  
    
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
  
    
    cartItemsContainer.addEventListener("input", function (event) {
        const target = event.target;
        if (target.classList.contains("cart-notes")) {
            const cartItem = target.closest(".cart-item");
            if (!cartItem) return;
            const productId = cartItem.getAttribute("data-id");
            const debouncedUpdateNotes = debounce((id, value) => {
                window.updateNotes(id, value);
            }, 500);
            debouncedUpdateNotes(productId, target.value);
        }
    });
  
    
    clearCartButton.addEventListener("click", () => {
        cart = [];
        saveCart();
        renderCart();
        window.dispatchEvent(new Event('cartUpdated'));
    });
  
    
    submitOrderButton.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty. Please add items before submitting.");
            return;
        }
  
        try {
            
            const order = {
                id: Date.now().toString(), 
                items: cart.map(item => ({
                    id: item.id,
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price,
                    notes: item.notes || ''
                })),
                timestamp: new Date().toISOString(),
                status: "Pending" 
            };
  
            
            let orders = JSON.parse(localStorage.getItem("orders")) || [];
            orders.push(order);
            localStorage.setItem("orders", JSON.stringify(orders));
  
            
            if (orderSummaryContainer) {
                const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                let summaryHTML = `
                    <h5 style="color: var(--text-color); font-family: 'Inter Bold', sans-serif;">Order Details</h5>
                    <table class="table table-bordered" style="background-color: var(--secondary-color); color: var(--text-color);">
                        <thead style="background-color: var(--text-color); color: #fff;">
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Notes</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                order.items.forEach(item => {
                    summaryHTML += `
                        <tr>
                            <td style="font-family: 'Inter', sans-serif;">${item.title}</td>
                            <td style="font-family: 'Inter', sans-serif;">${item.quantity}</td>
                            <td style="font-family: 'Inter', sans-serif;">Rp ${item.price.toLocaleString('id-ID')}</td>
                            <td style="font-family: 'Inter', sans-serif;">${item.notes || '-'}</td>
                            <td style="font-family: 'Inter', sans-serif;">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</td>
                        </tr>
                    `;
                });
                summaryHTML += `
                        </tbody>
                    </table>
                    <h5 class="text-end" style="color: var(--text-color); font-family: 'Inter Bold', sans-serif;">
                        Total: Rp ${total.toLocaleString('id-ID')}
                    </h5>
                    <div class="text-center mt-3">
                        <a href="orders.html" class="btn btn-primary" style="background-color: var(--text-color); border-radius: 90px; padding: 10px 20px;">
                            View Orders
                        </a>
                    </div>
                `;
                orderSummaryContainer.innerHTML = summaryHTML;
            }
  
           
            cart = [];
            saveCart();
            renderCart();
            window.dispatchEvent(new Event('cartUpdated'));
  
            
            const cartOffcanvas = document.getElementById("cartOffcanvas");
            const offcanvasInstance = bootstrap.Offcanvas.getInstance(cartOffcanvas);
            if (offcanvasInstance) {
                offcanvasInstance.hide();
            }
  
            const orderModal = new bootstrap.Modal(document.getElementById("orderConfirmationModal"), {
                backdrop: 'static',
                keyboard: false
            });
            orderModal.show();
        } catch (error) {
            console.error("Error submitting order:", error);
            alert("An error occurred while submitting your order. Please try again.");
        }
    });
  
    
    renderCart();
  
    
    searchInput.addEventListener("input", function () {
        filterCards();
    });
  
        categorySelect.addEventListener("change", function () {
        filterCards();
    });
});