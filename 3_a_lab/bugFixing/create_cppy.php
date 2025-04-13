<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Order Management</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Arial', sans-serif;
        }

        :root {
            --primary-color: rgb(142, 85, 104);
            --alternative-color: #fbbc34;
            --text-color: #767676;
            --title-color: #242424;
            --background-color: #fff;
            --form-border-color: rgba(0, 0, 0, 0.1);
            --btn-hover-color: rgb(140, 84, 90);
            --gray-background: #f7f7f7;
        }

        body {
            background-color: var(--gray-background);
            color: var(--text-color);
            line-height: 1.6;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: var(--background-color);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border-radius: 8px;
            overflow: hidden;
        }

        .navigation {
            display: flex;
            background-color: var(--primary-color);
            padding: 15px;
        }

        .nav-button {
            color: white;
            text-decoration: none;
            padding: 10px 15px;
            margin-right: 10px;
            border-radius: 4px;
            transition: background-color 0.3s ease;
        }

        .nav-button:hover {
            background-color: var(--btn-hover-color);
        }

        .nav-button.inactive {
            background-color: rgba(255, 255, 255, 0.3);
            cursor: not-allowed;
        }

        .user-info-form {
            padding: 20px;
            background-color: var(--background-color);
        }

        .form-group {
            margin-bottom: 20px;
            position: relative;
        }

        .form-group label {
            position: absolute;
            top: 12px;
            left: 12px;
            color: var(--title-color);
            font-weight: bold;
            font-size: 14px;
            pointer-events: none;
            transition: all 0.3s ease;
        }

        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            padding-top: 20px;
            border: 1px solid var(--form-border-color);
            border-radius: 6px;
            background-color: #fafafa;
            color: var(--text-color);
            font-size: 16px;
            transition: all 0.3s ease;
        }

        .form-group textarea {
            resize: vertical;
            min-height: 100px;
            padding-top: 20px;
        }

        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(142, 85, 104, 0.2);
            background-color: var(--background-color);
        }

        .form-group input:focus+label,
        .form-group textarea:focus+label,
        .form-group input:not(:placeholder-shown)+label,
        .form-group textarea:not(:placeholder-shown)+label {
            top: 4px;
            font-size: 12px;
            color: var(--primary-color);
        }

        #searchProduct {
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 1px solid var(--form-border-color);
            border-radius: 4px;
            background-color: var(--background-color);
            color: var(--text-color);
            font-size: 16px;
        }

        .searchResults {
            position: absolute;
            width: calc(100% - 40px);
            max-height: 200px;
            overflow-y: auto;
            background-color: var(--background-color);
            border: 1px solid var(--form-border-color);
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }

        .search-result-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid var(--form-border-color);
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .search-result-item:hover {
            background-color: #f0f0f0;
        }

        .search-result-item button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .search-result-item button:hover {
            background-color: var(--btn-hover-color);
        }

        #order-table {
            width: 100%;
            border-collapse: collapse;
            background-color: var(--background-color);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        #order-table th {
            background-color: var(--primary-color);
            color: white;
            padding: 12px;
            text-align: left;
        }

        #order-table td {
            padding: 10px;
            border-bottom: 1px solid var(--form-border-color);
        }

        .delete-btn {
            background-color: var(--alternative-color);
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .delete-btn:hover {
            background-color: #f0a500;
        }

        .product-image {
            max-width: 60px;
            max-height: 60px;
            border-radius: 4px;
        }

        .amount-input {
            width: 60px;
            padding: 6px;
            text-align: center;
            border: 1px solid var(--form-border-color);
            border-radius: 4px;
        }

        #order-summary {
            background-color: var(--gray-background);
            padding: 15px;
            margin-top: 15px;
            border-radius: 4px;
            display: flex;
            justify-content: space-between;
        }

        #order-summary p {
            color: var(--title-color);
            font-weight: bold;
        }

        .form-buttons {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            justify-content: flex-end;
        }

        .submit-btn,
        .cancel-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
        }

        .submit-btn {
            background-color: var(--primary-color);
            color: white;
        }

        .submit-btn:hover {
            background-color: var(--btn-hover-color);
        }

        .cancel-btn {
            background-color: #e0e0e0;
            color: var(--title-color);
        }

        .cancel-btn:hover {
            background-color: #d0d0d0;
        }

        .riyal-svg {
            width: 14px;
            height: 14px;
            fill: var(--text-color);
        }

        @media (max-width: 600px) {
            .container {
                width: 100%;
                margin: 0;
                border-radius: 0;
            }

            .navigation {
                flex-direction: column;
            }

            .nav-button {
                margin-bottom: 10px;
                text-align: center;
            }

            #order-table {
                font-size: 14px;
            }

            #order-summary {
                flex-direction: column;
            }

            #order-summary p {
                margin-bottom: 10px;
            }

            .form-buttons {
                flex-direction: column;
            }

            .submit-btn,
            .cancel-btn {
                width: 100%;
            }

            .searchResults {
                width: calc(100% - 20px);
            }
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="navigation">
            <a href="/index.php" class="nav-button">Create Order</a>
            <a href="/progressCheckEn.html" class="nav-button inactive">Progress Check</a>
        </div>

        <div class="user-info-form">
            <div class="form-group">
                <input type="text" id="customerName" placeholder=" " required>
                <label for="customerName">Full Name</label>
            </div>
            <div class="form-group">
                <input type="tel" id="customerPhone" placeholder=" " required>
                <label for="customerPhone">Whatsapp Number</label>
            </div>
            <div class="form-group">
                <input type="text" id="city" placeholder=" " required>
                <label for="city">City</label>
            </div>
            <div class="form-group">
                <input type="text" id="street" placeholder=" " required>
                <label for="street">Street</label>
            </div>
            <div class="form-group">
                <input type="text" id="building" placeholder=" " required>
                <label for="building">Building</label>
            </div>
            <div class="form-group">
                <textarea id="address-details" placeholder=" " rows="3"></textarea>
                <label for="address-details">Additional Address Details</label>
            </div>
            <div class="form-buttons">
                <button type="button" class="submit-btn" id="submitCart" onclick="submitForm()">Submit Order</button>
                <button type="button" class="cancel-btn" onclick="cancelForm()">Cancel</button>
            </div>
        </div>

        <div class="user-info-form">
            <div style="position: relative;">
                <input type="text" id="searchProduct" placeholder="Search for products...">
                <div id="searchResults" class="searchResults" style="display: none;"></div>
            </div>

            <table id="order-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Product ID</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Product Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="order-items">
                    <!-- Table body starts empty -->
                </tbody>
            </table>

            <div id="order-summary">
                <p>Total Products: <span id="total-products">0</span></p>
                <p>Total Price: <span id="totalPrice">0.00</span><img src="sar.svg" class="riyal-svg" alt="ريال"></p>
            </div>
        </div>
        <div id="responseMessage"></div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
        let productDatabase = [];

        const productSearch = document.getElementById('searchProduct');
        const searchResults = document.getElementById('searchResults');
        const orderItems = document.getElementById('order-items');
        const totalProductsSpan = document.getElementById('total-products');
        const totalPriceSpan = document.getElementById('totalPrice');

        document.addEventListener('DOMContentLoaded', () => {
            updateOrderSummary();
        });

        let searchRequest = null;
        $('#searchProduct').on('keyup', function() {
            let searchTerm = $(this).val().trim().toLowerCase();
            let resultsList = $('#searchResults').empty();

            if (searchTerm.length < 2) {
                resultsList.hide();
                return;
            }

            if (searchRequest !== null) {
                searchRequest.abort();
            }

            searchRequest = $.ajax({
                url: 'ajax-search.php',
                type: 'GET',
                data: { term: searchTerm },
                success: function(response) {
                    let data = JSON.parse(response);
                    resultsList.empty();

                    if (data.length > 0) {
                        data.forEach(product => {
                            let resultItem = $(`
                                <div class="search-result-item">
                                    <span>${product.name} (${product.id}) - ${parseFloat(product.price).toFixed(2)}
                                        <img src="sar.svg" class="riyal-svg" alt="ريال">
                                    </span>
                                    <button type="button" onclick="addProductToOrder(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                        Add
                                    </button>
                                </div>
                            `);
                            resultsList.append(resultItem);
                        });
                        resultsList.show();
                    } else {
                        resultsList.hide();
                    }
                }
            });
        });

        document.addEventListener('click', function (e) {
            if (!productSearch.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });

        function addProductToOrder(product) {
            if (!product || !product.id) {
                console.error('Invalid product data');
                return;
            }

            const existingRow = Array.from(orderItems.children).find(
                row => row.dataset.productId === String(product.id)
            );

            if (existingRow) {
                const amountInput = existingRow.querySelector('.amount-input');
                amountInput.value = parseInt(amountInput.value) + 1;
                amountInput.dispatchEvent(new Event('change'));
            } else {
                const row = document.createElement('tr');
                row.dataset.productId = product.id;
                row.innerHTML = `
                    <td>${product.name || 'Unknown Product'}</td>
                    <td>${product.id || 'N/A'}</td>
                    <td class="product-price">${(parseFloat(product.price) || 0).toFixed(2)} <img src="sar.svg" class="riyal-svg" alt="ريال"></td>
                    <td>
                        <input type="number" 
                               class="amount-input" 
                               value="1" 
                               min="1" 
                               max="${product.stock || 999}" 
                               onchange="updateOrderSummary()">
                    </td>
                    <td>
                        <img src="${product.image || 'https://3alab-cosmo.com/wp-content/uploads/2025/02/HydraBebe.webp'}" 
                             alt="${product.name || 'Product'}" 
                             class="product-image">
                    </td>
                    <td>
                        <button type="button" class="delete-btn" onclick="removeProduct(this)">Delete</button>
                    </td>
                `;
                orderItems.appendChild(row);
            }

            updateOrderSummary();
            searchResults.style.display = 'none';
            productSearch.value = '';
        }

        function removeProduct(button) {
            if (button && button.closest('tr')) {
                button.closest('tr').remove();
                updateOrderSummary();
            }
        }

        function updateOrderSummary() {
            const rows = Array.from(orderItems.children);
            const totalProducts = rows.reduce((sum, row) => {
                const amountInput = row.querySelector('.amount-input');
                return sum + (parseInt(amountInput?.value) || 0);
            }, 0);

            const totalPrice = rows.reduce((total, row) => {
                const productPrice = parseFloat(row.querySelector('.product-price')?.textContent) || 0;
                const amount = parseInt(row.querySelector('.amount-input')?.value) || 0;
                return total + ((productPrice || 0) * amount);
            }, 0);

            totalProductsSpan.textContent = totalProducts;
            totalPriceSpan.textContent = totalPrice.toFixed(2);
        }

        function submitForm() {
            const fullName = document.getElementById('customerName').value.trim();
            const mobilePhone = document.getElementById('customerPhone').value.trim();
            const city = document.getElementById('city').value.trim();
            const street = document.getElementById('street').value.trim();
            const building = document.getElementById('building').value.trim();
            const addressDetails = document.getElementById('address-details').value.trim();

            if (!fullName || !mobilePhone || !city || !street || !building) {
                alert('Please fill in all required fields');
                return;
            }

            if (document.getElementById('order-items').children.length === 0) {
                alert('Please add at least one product to your order');
                return;
            }

            submitCart(fullName, mobilePhone, city, street, building, addressDetails);
        }

        function submitCart(fullName, mobilePhone, city, street, building, addressDetails) {
            let cartItems = [];
            let total = 0;

            $("#order-items tr").each(function() {
                let id = parseInt($(this).attr("data-product-id")) || "";
                let name = $(this).find("td:eq(0)").text().trim();
                let priceText = $(this).find(".product-price").contents().first().text().trim();
                let price = parseFloat(priceText) || 0;
                let quantity = parseInt($(this).find(".amount-input").val()) || 0;
                let subtotal = price * quantity;

                total += subtotal;

                cartItems.push({
                    id: id,
                    name: name,
                    price: price,
                    quantity: quantity,
                    subtotal: subtotal
                });
            });


            $.ajax({
                url: 'process-cart.php',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    cur_aff: 21,
                    status: "pending",
                    customer: fullName,
                    phone: mobilePhone,
                    city: city,
                    street: street,
                    building: building,
                    addressDetails: addressDetails,
                    total: total,
                    items: cartItems
                }),
                success: function(response) {
                    $("#responseMessage").html(response);
                    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
                        input.value = '';
                    });
                    while (orderItems.firstChild) {
                        orderItems.removeChild(orderItems.firstChild);
                    }
                    updateOrderSummary();
                }
            });

        }


        function cancelForm() {
            if (confirm('Are you sure you want to cancel this order? All data will be lost.')) {
                document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
                    input.value = '';
                });
                while (orderItems.firstChild) {
                    orderItems.removeChild(orderItems.firstChild);
                }
                updateOrderSummary();
            }
        }
    </script>
</body>

</html>