import { appConfig } from '../config';
import { loadProducts } from '../utils/productsStorage';
import { requestJson } from './http';

const normalizeId = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const slugify = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const extractCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeCategory = (category, parentCategory = null) => {
  const name = String(category?.name ?? category?.categoryName ?? '').trim() || 'Sin categoría';
  const id = normalizeId(category?.id);
  const parentId =
    category?.parentId === null || category?.parentId === undefined
      ? (parentCategory?.id ?? null)
      : normalizeId(category.parentId);
  const parentName = String(category?.parentName ?? parentCategory?.name ?? '').trim() || null;
  const subcategories = extractCollection(category?.subcategories).map((sub) =>
    normalizeCategory(sub, { id, name })
  );

  return {
    id,
    parentId,
    parentName,
    name,
    slug: String(category?.slug ?? slugify(name)),
    isRoot: Boolean(category?.isRoot ?? !parentId),
    subcategoriesCount: Number.isFinite(Number(category?.subcategoriesCount))
      ? Number(category.subcategoriesCount)
      : subcategories.length,
    productsCount: Number.isFinite(Number(category?.productsCount))
      ? Number(category.productsCount)
      : 0,
    subcategories,
  };
};

const flattenCategories = (categories) =>
  categories.flatMap((cat) => [
    cat,
    ...flattenCategories(Array.isArray(cat.subcategories) ? cat.subcategories : []),
  ]);

const buildLocalCategoriesTree = () => {
  const categoriesByName = new Map();
  for (const product of loadProducts()) {
    const categoryName = String(product?.categoryName ?? product?.category ?? '').trim();
    if (!categoryName) continue;
    const existing = categoriesByName.get(categoryName);
    categoriesByName.set(categoryName, {
      id: normalizeId(product?.categoryId) || existing?.id || categoriesByName.size + 1,
      name: categoryName,
      slug: slugify(categoryName),
      isRoot: true,
      productsCount: (existing?.productsCount ?? 0) + 1,
      subcategories: [],
    });
  }
  return Array.from(categoriesByName.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((cat) => normalizeCategory(cat));
};

function getCategoriesTree() {
  return buildLocalCategoriesTree();
}

function getCategories() {
  return flattenCategories(getCategoriesTree());
}

function getCategoryById(categoryId) {
  return getCategories().find((cat) => cat.id === normalizeId(categoryId)) ?? null;
}

async function getCategoriesAsync() {
  if (!appConfig.useRemoteApi) return getCategories();
  const response = await requestJson('/categories', { method: 'GET' });
  return extractCollection(response).map((cat) => normalizeCategory(cat));
}

async function getCategoryByIdAsync(categoryId) {
  if (!appConfig.useRemoteApi) return getCategoryById(normalizeId(categoryId));
  const response = await requestJson(`/categories/${normalizeId(categoryId)}`, { method: 'GET' });
  return normalizeCategory(response);
}

const categoryService = {
  getCategories,
  getCategoriesAsync,
  getCategoriesTree,
  getCategoryById,
  getCategoryByIdAsync,
};

export { categoryService };
export default categoryService;
