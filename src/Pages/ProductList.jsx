import { products } from '../data/Product';
import ProductCard from '../components/ProductCard';
import styles from './ProductList.module.css';

function ProductList() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Productos informaticos</h1>
                <p className={styles.subtitle}>
                    Encuentra los mejores productos de tecnologia pra tu setup
                </p>
            </header>

            <div className={styles.grid}>
                {products.map((product) => (
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