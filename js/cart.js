document.addEventListener('DOMContentLoaded', function() {
    const supabase = window.supabaseClient;

    // Helper to get or create a session ID for the user
    function getSessionId() {
        let sessionId = localStorage.getItem('cart_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cart_session_id', sessionId);
        }
        return sessionId;
    }

    const cartForms = document.querySelectorAll('form[data-node-type="commerce-add-to-cart-form"]');
    cartForms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
            const originalText = submitBtn ? submitBtn.value || submitBtn.textContent : '';
            if (submitBtn) {
                if (submitBtn.value) submitBtn.value = 'Adding...';
                else submitBtn.textContent = 'Adding...';
                submitBtn.disabled = true;
            }

            try {
                // Try to extract product info
                // This is a generic approach; Webflow ecommerce usually has specific data attributes
                // We'll try to find a product name nearby, or use the form's action/id
                let productName = 'Unknown Product';
                let price = 0;
                
                const productWrapper = form.closest('.w-dyn-item') || form.closest('.product-wrapper') || document.body;
                const nameEl = productWrapper.querySelector('h1, h2, h3, .product-name');
                if (nameEl) productName = nameEl.textContent.trim();

                const priceEl = productWrapper.querySelector('.price, .product-price');
                if (priceEl) {
                    const priceText = priceEl.textContent.replace(/[^0-9.]/g, '');
                    price = parseFloat(priceText) || 0;
                }

                // Insert into Supabase 'cart' table
                const { data, error } = await supabase
                    .from('cart')
                    .insert([
                        { 
                            session_id: getSessionId(),
                            product_name: productName,
                            price: price,
                            quantity: 1,
                            added_at: new Date().toISOString()
                        }
                    ]);

                if (error) {
                    console.error('Error adding to cart:', error);
                    alert('There was an issue adding to cart. Please try again.');
                } else {
                    alert('Item added to cart successfully!');
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                alert('An unexpected error occurred.');
            } finally {
                if (submitBtn) {
                    if (submitBtn.value !== undefined) submitBtn.value = originalText;
                    else submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }
        }, true);
    });
});
