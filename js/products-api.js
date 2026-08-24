/**
 * Products & Orders API supporting Firebase Firestore with fallback handling
 */

const FALLBACK_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Eau So Sweet',
    title: 'Eau So Sweet',
    category: 'Daisy Love',
    description: 'A delicate floral-gourmand fragrance with white raspberries, daisy tree petals, and sugar musks.',
    price: 36.00,
    volume: '100 ml / 3.3 oz',
    image_url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260511_151640_5b4a7bf8-4eb2-4a49-aa63-17a9bb642b88.png&w=1280&q=85',
    featured: true,
    in_stock: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_2',
    name: 'Eau So Extra',
    title: 'Eau So Extra',
    category: 'Daisy Wild',
    description: 'A bold, playful blend of banana blossom accord, chocolate daisy, and crisp vetiver oil.',
    price: 38.00,
    volume: '100 ml / 3.3 oz',
    image_url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260511_151621_4fba6892-ed21-4c2e-8cb3-0bd2ec2abefa.png&w=1280&q=85',
    featured: true,
    in_stock: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_3',
    name: 'Illuminating Cleansing Gel',
    title: 'Illuminating Cleansing Gel',
    category: 'Illuminate',
    description: 'Clarifying botanic cleanser for soft, radiant texture.',
    price: 36.00,
    volume: '150 ml / 5.1 oz',
    image_url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_193822_8c95f5ed-b142-454f-ab87-59ad1f09e758.png&w=1280&q=85',
    featured: false,
    in_stock: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_4',
    name: 'Unifying Serum Spray',
    title: 'Unifying Serum Spray',
    category: 'Unify',
    description: 'Refreshing mist enriched with niacinamide to balance and minimize pores.',
    price: 34.00,
    volume: '100 ml / 3.4 oz',
    image_url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194048_278bf3cc-7d1f-43c1-9dc7-73d8fcd9949c.png&w=1280&q=85',
    featured: false,
    in_stock: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_5',
    name: 'Super Glow Set',
    title: 'Super Glow Set',
    category: 'Natural Glow',
    description: 'Complete hydration and radiance trio for an effortless everyday luminence.',
    price: 92.00,
    old_price: 99.00,
    volume: 'Full Care Kit',
    image_url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194058_d89610de-05f8-45e4-8196-0680296c565a.png&w=1280&q=85',
    featured: true,
    in_stock: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_6',
    name: 'Radiance Day Oil',
    title: 'Radiance Day Oil',
    category: 'Protect',
    description: 'Lightweight antioxidant oil protecting the barrier while locking in natural radiance.',
    price: 59.00,
    volume: '50 ml / 1.7 oz',
    image_url: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260518_194112_1763cbb2-3171-4ad3-9f38-1b738b8f1bb6.png&w=1280&q=85',
    featured: false,
    in_stock: true,
    created_at: new Date().toISOString()
  }
];

/**
 * Fetch all products from Firestore with fallback
 */
async function getProducts() {
  if (window.firebaseDb) {
    try {
      const snapshot = await window.firebaseDb.collection('products').get();
      if (!snapshot.empty) {
        const products = [];
        snapshot.forEach(doc => {
          products.push({ id: doc.id, ...doc.data() });
        });
        return products;
      }
    } catch (e) {
      console.warn('Firestore fetch products failed, trying Supabase or fallback:', e);
    }
  }

  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetch failed:', e);
    }
  }

  return FALLBACK_PRODUCTS;
}

/**
 * Add a product to Firestore
 */
async function addProduct(product) {
  const cleanId = product.id || 'prod_' + Date.now();
  const productData = {
    name: product.name || product.title || 'Fragrance Item',
    title: product.title || product.name || 'Fragrance Item',
    category: product.category || 'Collection',
    description: product.description || '',
    price: parseFloat(product.price) || 0,
    image_url: product.image_url || product.image || '',
    volume: product.volume || '100 ml',
    featured: Boolean(product.featured),
    in_stock: product.in_stock !== false,
    created_at: new Date().toISOString()
  };

  if (window.firebaseDb) {
    try {
      await window.firebaseDb.collection('products').doc(cleanId).set(productData);
      return { id: cleanId, ...productData };
    } catch (e) {
      console.error('Error adding product to Firestore:', e);
    }
  }

  if (window.supabaseClient) {
    const { data, error } = await window.supabaseClient
      .from('products')
      .insert([productData])
      .select();
    if (!error && data) return data[0];
  }

  return { id: cleanId, ...productData };
}

/**
 * Update an existing product
 */
async function updateProduct(id, updates) {
  if (window.firebaseDb) {
    try {
      await window.firebaseDb.collection('products').doc(id).update(updates);
      return { id, ...updates };
    } catch (e) {
      console.error('Error updating product in Firestore:', e);
    }
  }

  if (window.supabaseClient) {
    const { data, error } = await window.supabaseClient
      .from('products')
      .update(updates)
      .eq('id', id)
      .select();
    if (!error && data) return data[0];
  }

  return { id, ...updates };
}

/**
 * Delete a product
 */
async function deleteProduct(id) {
  if (window.firebaseDb) {
    try {
      await window.firebaseDb.collection('products').doc(id).delete();
      return true;
    } catch (e) {
      console.error('Error deleting product from Firestore:', e);
    }
  }

  if (window.supabaseClient) {
    const { error } = await window.supabaseClient
      .from('products')
      .delete()
      .eq('id', id);
    if (!error) return true;
  }

  return true;
}

/**
 * Create a customer order in Firestore
 */
async function createOrder(orderData) {
  const orderId = 'ord_' + Date.now();
  const payload = {
    customer_name: orderData.customer_name || 'Guest Customer',
    customer_phone: orderData.customer_phone || '+254700000000',
    shipping_address: orderData.shipping_address || 'Delivery Address',
    items: orderData.items || [],
    total_amount: parseFloat(orderData.total_amount) || 0,
    status: 'pending',
    customer_email: orderData.customer_email || '',
    city: orderData.city || 'Nairobi',
    payment_method: orderData.payment_method || 'M-Pesa',
    payment_status: orderData.payment_status || 'pending',
    created_at: new Date().toISOString()
  };

  if (window.firebaseDb) {
    try {
      await window.firebaseDb.collection('orders').doc(orderId).set(payload);
      console.log('Order created successfully in Firebase Firestore:', orderId);
      return { id: orderId, ...payload };
    } catch (e) {
      console.error('Firestore create order error:', e);
    }
  }

  return { id: orderId, ...payload };
}

window.getProducts = getProducts;
window.addProduct = addProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.createOrder = createOrder;
