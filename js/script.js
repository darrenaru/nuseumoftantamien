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
        const isDrink = product.category === 'minuman';
        const defaultType = isDrink ? 'Hot' : undefined;
        const existingItem = cart.find(item => item.id === product.id && item.type === defaultType);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1, notes: "", type: defaultType });
        }
        saveCart();
        renderCart();
        window.dispatchEvent(new Event('cartUpdated'));
    };

    window.updateQuantity = function(productId, change, type = undefined) {
        const item = cart.find(item => item.id === productId && item.type === (type || item.type));
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(i => !(i.id === productId && i.type === item.type));
            }
            saveCart();
            renderCart();
            window.dispatchEvent(new Event('cartUpdated'));
        }
    };

    window.updateNotes = function(productId, notes, type) {
        const item = cart.find(item => item.id === productId && item.type === type);
        if (item) {
            item.notes = notes;
            saveCart();
            window.dispatchEvent(new Event('cartUpdated'));
        }
    };

    window.updateType = function(productId, newType, oldType) {
        const item = cart.find(item => item.id === productId && item.type === oldType);
        if (item) {
            const existingItem = cart.find(item => item.id === productId && item.type === newType);
            if (existingItem) {
                existingItem.quantity += item.quantity;
                cart = cart.filter(i => !(i.id === productId && i.type === oldType));
            } else {
                item.type = newType;
            }
            saveCart();
            renderCart();
            window.dispatchEvent(new Event('cartUpdated'));
        }
    };

    window.removeFromCart = function(productId, type) {
        cart = cart.filter(item => !(item.id === productId && item.type === type));
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
            const isDrink = item.category === 'minuman';
            const itemHTML = `
                <div class="cart-item d-flex justify-content-between align-items-center mb-3" data-id="${item.id}" data-type="${item.type || ''}">
                    <div>
                        <h5>${item.title}${isDrink ? ` (${item.type || 'Hot'})` : ''}</h5>
                        <p>Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</p>
                        ${isDrink ? `
                            <div class="type-buttons mb-2">
                                <button class="type-btn ${item.type === 'Hot' ? 'active' : ''}" data-id="${item.id}" data-type="Hot">H</button>
                                <button class="type-btn ${item.type === 'Cold' ? 'active' : ''}" data-id="${item.id}" data-type="Cold">C</button>
                            </div>
                        ` : ''}
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

        // Attach event listeners for type buttons
        document.querySelectorAll('.type-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.getAttribute('data-id');
                const newType = button.getAttribute('data-type');
                const cartItem = button.closest('.cart-item');
                const oldType = cartItem.getAttribute('data-type') || 'Hot';

                if (newType !== oldType) {
                    window.updateType(productId, newType, oldType);
                }
            });
        });
    }

    cartItemsContainer.addEventListener("click", function (event) {
        const target = event.target;
        const cartItem = target.closest(".cart-item");
        if (!cartItem) return;
        const productId = cartItem.getAttribute("data-id");
        const type = cartItem.getAttribute("data-type") || undefined;

        if (target.classList.contains("increase-quantity")) {
            window.updateQuantity(productId, 1, type);
        } else if (target.classList.contains("decrease-quantity")) {
            window.updateQuantity(productId, -1, type);
        } else if (target.classList.contains("remove-item")) {
            window.removeFromCart(productId, type);
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
            const type = cartItem.getAttribute("data-type") || undefined;
            const debouncedUpdateNotes = debounce((id, value, type) => {
                window.updateNotes(id, value, type);
            }, 500);
            debouncedUpdateNotes(productId, target.value, type);
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
                    notes: item.notes || '',
                    type: item.type || undefined,
                    category: item.category
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
                                <th>Type</th>
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
                            <td style="font-family: 'Inter', sans-serif;">${item.category === 'minuman' ? (item.type || 'Hot') : '-'}</td>
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