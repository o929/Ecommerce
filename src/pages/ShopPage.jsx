// src/pages/ShopPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs,onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Cart from "../components/Cart";
import CartPurchasePage from "../components/CartPurchasePage";


const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // 🔑 This is the key: it updates the cart when user clicks add
  const addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === productId ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, qty: 1 }];
      }
    });
  };

  const increaseQty = (id) => {
    setCart(cart.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));
  };

  const decreaseQty = (id) => {
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, qty: item.qty > 1 ? item.qty - 1 : 1 }
        : item
    ));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      console.log("Snapshot received:", snapshot.docs.length);
      const productData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productData);
    },
    (error) => {
      console.error("onSnapshot error:", error);
    }
  );

  return () => unsubscribe();
}, []);
return (
  <div style={{ padding: "20px" }}>
    <h1>Shop Page</h1>
<div className="product-list">
  {products.map((product) => (
    <div key={product.id} className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => addToCart(product.id)}>Add to Cart</button>
    </div>
  ))}
</div>

 <CartPurchasePage
  cart={cart}
  increaseQty={increaseQty}
  decreaseQty={decreaseQty}
  removeItem={removeItem}
  clearCart={clearCart}
/>


    <Cart
      cart={cart}
      increaseQty={increaseQty}
      decreaseQty={decreaseQty}
      removeItem={removeItem}
      clearCart={clearCart}
      products={products}
      addToCart={addToCart}
    />
  </div>
);

};

export default ShopPage;
