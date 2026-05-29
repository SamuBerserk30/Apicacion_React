import { useEffect, useState } from 'react';

import styles from '../styles/ProductForm.module.css';

const emptyValues = {
  name: '',
  category: '',
  price: '',
  stock: '',
  image: '',
  description: '',
  rating: '3',
};

function ProductForm({ initialValues, onSubmit, onCancel, isEditing = false }) {
  const [values, setValues] = useState(emptyValues);
  const [categories, setCategories] = useState([]);

  // Cargar categorías del backend
  useEffect(() => {
    fetch('/api/v1/categories')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items ?? [];
        setCategories(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name ?? '',
        category: initialValues.category ?? initialValues.categoryName ?? '',
        price: initialValues.price ?? '',
        stock: initialValues.stock ?? initialValues.stockQty ?? '',
        image: initialValues.image ?? '',
        description: initialValues.description ?? '',
        rating: initialValues.rating ?? '3',
      });
    } else {
      setValues(emptyValues);
    }
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = values.name.trim();
    const category = values.category.trim();
    const image = values.image.trim();
    const description = values.description.trim();
    const price = Number(values.price);
    const stock = Number(values.stock);
    const rating = Number(values.rating ?? 3);

    if (!name) return;
    if (!category) { alert('Selecciona o escribe una categoría'); return; }
    if (!Number.isFinite(price) || price <= 0) return;
    if (!Number.isFinite(stock) || stock < 0) return;

    // Buscar categoryId de la lista cargada
    const foundCategory = categories.find(
      (c) => String(c.name ?? '').toLowerCase() === category.toLowerCase()
    );
    const categoryId = foundCategory?.id ?? null;

    // Generar SKU automático a partir del nombre
    const sku = (initialValues?.sku ?? name.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 20));

    onSubmit({
      ...initialValues,
      name,
      category,
      categoryName: category,
      categoryId,
      sku,
      price,
      stock,
      stockQty: stock,
      image,
      description,
      rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, rating)) : 3,
      isActive: true,
    });

    if (!isEditing) {
      setValues(emptyValues);
    }
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          {isEditing ? 'Editar producto' : 'Agregar producto'}
        </h2>
        <p className={styles.subtitle}>Completa el formulario y guarda los cambios.</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Nombre</span>
          <input
            className={styles.input}
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="Ej: Teclado gamer"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Categoría</span>
          {categories.length > 0 ? (
            <select
              className={styles.input}
              name="category"
              value={values.category}
              onChange={handleChange}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={styles.input}
              name="category"
              value={values.category}
              onChange={handleChange}
              placeholder="Ej: Laptops"
            />
          )}
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>Precio</span>
            <input
              className={styles.input}
              name="price"
              type="number"
              min="1"
              value={values.price}
              onChange={handleChange}
              placeholder="Ej: 500"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Stock</span>
            <input
              className={styles.input}
              name="stock"
              type="number"
              min="0"
              value={values.stock}
              onChange={handleChange}
              placeholder="Ej: 10"
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Imagen (URL)</span>
          <input
            className={styles.input}
            name="image"
            value={values.image}
            onChange={handleChange}
            placeholder="https://... o /assets/imagen.jpg"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Descripción</span>
          <textarea
            className={styles.textarea}
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="Describe el producto..."
            rows={3}
          />
        </label>

        <div className={styles.actions}>
          {onCancel ? (
            <button className={styles.btnSecondary} type="button" onClick={onCancel}>
              Cancelar
            </button>
          ) : null}
          <button className={styles.btnPrimary} type="submit">
            {isEditing ? 'Guardar cambios' : 'Agregar producto'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProductForm;