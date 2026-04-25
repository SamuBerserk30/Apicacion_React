import { useEffect, useState } from 'react';

import ProductCard from '../components/ProductCard';

function PracticaProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/v1/products')
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message);
        setCargando(false);
      });
  }, []);

  if (cargando) return <p>Cargando productos desde el backend...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Productos desde el backend</h1>
      <p>Total cargados: {productos.length}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {productos.map((producto) => (
          <ProductCard
            key={producto.id}
            id={producto.id}
            name={producto.name}
            category={producto.category}
            price={producto.price}
            stock={producto.stock}
            image={producto.image}
            description={producto.description}
            rating={producto.rating}
          />
        ))}
      </div>
    </div>
  );
}

export default PracticaProductos;