import { pool } from "../db/pool";
import {
  Product,
  ProductRow,
  CreateProductInput,
  UpdateProductInput,
} from "../types/product";
import client from "../redis/client";

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    stock: row.stock,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}


const PRODUCTS_ALL_CACHE_KEY = "products:all"
const PRODUCT_CACHE_TTL_SECONDS = 60

function getProductCacheKey(productId: number): string {
  return `products:id:${productId}`
}



export async function fetchAllProductFromDatabase(filters: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  let query = "SELECT * FROM products WHERE 1=1";
  const values: string[] = [];

  if (filters.category) {
    values.push(filters.category);
    query += ` AND LOWER(category) = LOWER($${values.length})`;
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    query += ` AND (LOWER(name) LIKE LOWER($${values.length}) OR LOWER(description) LIKE LOWER($${values.length}))`;
  }

  query += " ORDER BY id ASC";

  const result = await pool.query<ProductRow>(query, values);
  return result.rows.map(mapProductRow);
}



export async function getAllProducts(filters: {
  category?: string;
  search?: string;
}): Promise<Product[]> {
  const hashFilters = Boolean(filters?.category || filters?.search)


  //every filter combination need a separate cachec 
  //products:all:search:keyboard
  //products:all:category:accessories


  if (hashFilters) {
    console.log("cache bypass: filters applied")
    return fetchAllProductFromDatabase(filters)
  }



  //redis is not the source of truth here

  const cachedProduct = await client.get(PRODUCTS_ALL_CACHE_KEY);
  if (cachedProduct) {
    console.log("Cache hit")
    return JSON.parse(cachedProduct) as Product[]
  }

  console.log("Cache miss => fetching from db")

  const products = await fetchAllProductFromDatabase(filters);
  if (products.length > 0) {
    await client.setEx(PRODUCTS_ALL_CACHE_KEY, PRODUCT_CACHE_TTL_SECONDS, JSON.stringify(products));
    console.log("Cache set")
  }

  return products;



}


export async function fetchSingleProductFromDatabase(id: number): Promise<Product | null> {
  const result = await pool.query<ProductRow>(
    "SELECT * FROM products WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapProductRow(result.rows[0]);
}

export async function getProductById(id: number): Promise<Product | null> {
  const cachKey = getProductCacheKey(id)

  const cachedProduct = await client.get(cachKey)
  if (cachedProduct) {
    console.log("cache hit", cachKey)
    return JSON.parse(cachedProduct) as Product
  }

  console.log("cache miss => fetching from db")
  const product = await fetchSingleProductFromDatabase(id)
  if (product) {
    await client.setEx(cachKey, PRODUCT_CACHE_TTL_SECONDS, JSON.stringify(product))
    console.log("cache set")
  }
  return product

}




export async function createProduct(
  input: CreateProductInput
): Promise<Product> {
  const result = await pool.query<ProductRow>(
    `INSERT INTO products (name, description, price, category, stock)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [input.name, input.description, input.price, input.category, input.stock]
  );


  const newlyCreatedProduct = mapProductRow(result.rows[0])
  await deleteCreatedProductAllCache()

  return newlyCreatedProduct

}


async function deleteCreatedProductAllCache(): Promise<void> {

  await client.del(PRODUCTS_ALL_CACHE_KEY)
  console.log("cache deleted")

}

export async function updateProduct(
  id: number,
  input: UpdateProductInput
): Promise<Product | null> {
  const existing = await fetchSingleProductFromDatabase(id);
  if (!existing) {
    return null;
  }

  const name = input.name ?? existing.name;
  const description = input.description ?? existing.description;
  const price = input.price ?? existing.price;
  const category = input.category ?? existing.category;
  const stock = input.stock ?? existing.stock;

  const result = await pool.query<ProductRow>(
    `UPDATE products
     SET name = $1,
         description = $2,
         price = $3,
         category = $4,
         stock = $5,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [name, description, price, category, stock, id]
  );



  const product = mapProductRow(result.rows[0]);

  await client.del(getProductCacheKey(id))
  console.log("cache deleted", getProductCacheKey(id))

  await deleteCreatedProductAllCache()
  console.log("cache deleted", PRODUCTS_ALL_CACHE_KEY)

  return product
}
