document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById("menu");
    const cartBtn = document.getElementById("cart-btn");
    const cartModal = document.getElementById("cart-modal");
    const cartItemsContainer = document.querySelector(".cart-items");
    const cartTotal = document.getElementById("cart-total");
    const checkoutBtn = document.getElementById("checkout-btn");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const cartCounter = document.getElementById("cart-count");
    const addressInput = document.getElementById("address");
    const addressWarn = document.getElementById("address-warn");

    let cart = [];

    // Função para adicionar item ao carrinho
    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name,
                price,
                quantity: 1
            });
        }
        updateCartModal();
    }

    // Atualiza o modal do carrinho
    function updateCartModal() {
        cartItemsContainer.innerHTML = "";
        let total = 0;

        cart.forEach(item => {
            total += item.price * item.quantity;

            const cartItemElement = document.createElement("div");
            cartItemElement.className = "flex justify-between items-center mb-2";

            cartItemElement.innerHTML = `
                <div>
                    <p><strong>${item.name}</strong></p>
                    <p>Quantidade: ${item.quantity}</p>
                    <p>Preço: R$ ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <button class="bg-red-600 text-white px-3 py-1 rounded remove-from-cart-btn" data-name="${item.name}">
                    Remover
                </button>
            `;

            cartItemsContainer.appendChild(cartItemElement);
        });

        cartTotal.textContent = total.toFixed(2);
        cartCounter.textContent = cart.length;

        // Adiciona o evento de remover item ao carrinho
        const removeButtons = document.querySelectorAll(".remove-from-cart-btn");
        removeButtons.forEach(button => {
            button.addEventListener("click", function () {
                const name = this.getAttribute("data-name");
                removeFromCart(name);
            });
        });
    }

    // Remove item do carrinho
    function removeFromCart(name) {
        cart = cart.filter(item => item.name !== name);
        updateCartModal();
    }

    // Abrir o modal do carrinho
    cartBtn.addEventListener("click", () => {
        cartModal.style.display = "flex";
    });

    // Fechar o modal
    closeModalBtn.addEventListener("click", () => {
        cartModal.style.display = "none";
    });

    // Fechar o modal quando clicar fora
    cartModal.addEventListener("click", event => {
        if (event.target === cartModal) {
            cartModal.style.display = "none";
        }
    });

    // Adicionar ao carrinho quando clicar no botão
    menu.addEventListener("click", event => {
        const parentButton = event.target.closest(".add-to-cart-btn");

        if (parentButton) {
            const name = parentButton.getAttribute("data-name");
            const price = parseFloat(parentButton.getAttribute("data-price"));
            addToCart(name, price);
        }
    });

    // Mostrar ou ocultar a mensagem de aviso conforme o endereço
    addressInput.addEventListener("input", function(event) {
        let inputValue = event.target.value;
        if (inputValue.trim() !== "") {
            addressWarn.classList.add("hidden");
            addressInput.style.border = ""; // Remove a borda vermelha
        }
    });

    // Função para gerar a mensagem para o WhatsApp
    function generateWhatsAppMessage() {
        let message = "Pedido:\n";

        cart.forEach(item => {
            message += `${item.name} - Quantidade: ${item.quantity} - Preço: R$ ${(item.price * item.quantity).toFixed(2)}\n`;
        });

        message += `\nTotal: R$ ${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}\n`;
        message += `Endereço de Entrega: ${addressInput.value}`;

        return encodeURIComponent(message);
    }

    // Função para mostrar Toastify
    function showToast(message, backgroundColor = "linear-gradient(to right, #00b09b, #96c93d)") {
        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: backgroundColor,
            },
        }).showToast();
    }

    // Mensagem de pedido finalizado
    function showOrderCompletedToast() {
        showToast("Pedido finalizado com sucesso e enviado para o WhatsApp!");
    }

    // Mensagem de restaurante fechado
    function showRestaurantClosedToast() {
        showToast("Estamos fechados no momento. Por favor, tente novamente durante o horário de funcionamento.", "linear-gradient(to right, #ff5f6d, #ffc371)");
    }

    // Finalizar o pedido
    checkoutBtn.addEventListener("click", function() {
        if (cart.length === 0) return; // Se o carrinho estiver vazio, não faz nada

        if (!checkoutRestaurantOpen()) {
            showRestaurantClosedToast();
            return; // Sai da função, não finaliza o pedido
        }

        if (addressInput.value.trim() === "") {
            addressWarn.classList.remove("hidden");
            addressInput.style.border = "2px solid red"; // Adiciona a borda vermelha
            return; // Sai da função, não finaliza o pedido
        }

        addressWarn.classList.add("hidden");
        addressInput.style.border = ""; // Remove a borda vermelha

        // Gera a mensagem para o WhatsApp
        const message = generateWhatsAppMessage();
        const phoneNumber = "119788275"; // Seu número de telefone
        const url = `https://wa.me/${phoneNumber}?text=${message}`;

        // Redireciona para o WhatsApp
        window.open(url, "_blank");

        // Confirmação de pedido finalizado
        showOrderCompletedToast();
    });

    // Verificar se o restaurante está aberto
    function checkoutRestaurantOpen() {
        const data = new Date();
        const hora = data.getHours();
        return hora >= 18 && hora < 22; // verdadeiro, está aberto
    }

    const spanItem = document.getElementById("date-span");
    const isOpen = checkoutRestaurantOpen();

    if (spanItem) {
        if (isOpen) {
            spanItem.classList.remove("bg-red-500");
            spanItem.classList.add("bg-green-500");
        } else {
            spanItem.classList.remove("bg-green-500");
            spanItem.classList.add("bg-red-500");
        }
    }
});
