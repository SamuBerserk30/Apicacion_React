import { useState } from "react";
import { products } from '../data/Product';
import ProductCard from '../components/ProductCard';
import styles from './ProductList.module.css';
import ProductForm from "../components/ProductForm";

function ProductList() {
    const [productsState, setProductsState] = useState(products);

const handleAddProduct = (product) => {
  setProductsState((prev) => {
    const maxId = prev.reduce((acc, item) => Math.max(acc, item.id), 0);
    const nextId = maxId + 1;

    return [...prev, { ...product, id: nextId }];
  });
};

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Productos informaticos</h1>
                <p className={styles.subtitle}>
                    Encuentra los mejores productos de tecnologia pra tu setup
                </p>
            </header>
            <ProductForm onSubmit={handleAddProduct} />
            <div className={styles.grid}>
                {productsState.map((product) => (
                    <ProductCard
                        key={product.id}
                        name={product.name}
                        category={product.category}
                        price={product.price}
                        stock={product.stock}
                        image={product.image}
                        description={product.description}
                    />
                ))}
            </div>
        </div>
    );
}

export default ProductList;