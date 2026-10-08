import fs from 'node:fs';
import path from 'node:path';
import {
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Review,
  WishlistItem,
} from './types';

interface DatabaseSchema {
  users: User[];
  categories: Category[];
  products: Product[];
  cart: Cart[];
  cart_items: CartItem[];
  orders: Order[];
  order_items: OrderItem[];
  payments: Payment[];
  reviews: Review[];
  wishlist: WishlistItem[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'database', 'data.json');

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Architectural Living',
    slug: 'architectural-living',
    description: 'Sculptural furniture, crafted oak seating, and minimalist interior objects.',
    image_url: '/src/assets/images/hero_curated_collection_1791425516611.jpg',
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 2,
    name: 'Audio & Acoustics',
    slug: 'audio-acoustics',
    description: 'Precision studio sound, acoustic monitors, and beryllium transducer headphones.',
    image_url: '/src/assets/images/product_audio_headphones_1791425532484.jpg',
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 3,
    name: 'Sculptural Ceramics',
    slug: 'sculptural-ceramics',
    description: 'Artisanal stoneware vessels, unglazed fluted vases, and organic table forms.',
    image_url: '/src/assets/images/product_ceramic_vase_1791425554927.jpg',
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 4,
    name: 'Horology & Objects',
    slug: 'horology-objects',
    description: 'Grade-5 titanium mechanical timepieces and everyday precision instruments.',
    image_url: '/src/assets/images/product_automatic_watch_1791425566046.jpg',
    created_at: new Date('2026-01-01').toISOString(),
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    category_id: 2,
    name: 'Aura Studio Pro Wireless Headphones',
    slug: 'aura-studio-pro-headphones',
    description: 'Bespoke 40mm beryllium drivers enclosed in an acoustic titanium chassis. Featuring active hybrid noise cancellation, 38-hour battery longevity, Bluetooth 5.3 with high-resolution LDAC codec support, and breathable lambskin memory foam ear cushions.',
    price: 380,
    compare_at_price: 420,
    sku: 'AUR-AUD-01',
    stock_quantity: 24,
    image_url: '/src/assets/images/product_audio_headphones_1791425532484.jpg',
    gallery_urls: ['/src/assets/images/product_audio_headphones_1791425532484.jpg'],
    featured: true,
    is_active: true,
    created_at: new Date('2026-01-10').toISOString(),
    updated_at: new Date('2026-01-10').toISOString(),
  },
  {
    id: 2,
    category_id: 1,
    name: 'Koto Boucle Sculptural Lounge Chair',
    slug: 'koto-boucle-lounge-chair',
    description: 'Hand-crafted from solid FSC-certified European white oak with soft sculpted contours. Upholstered in tactile high-durability cream wool-blend boucle. Engineered with generous lumbar support for architectural reading sanctuaries.',
    price: 1450,
    compare_at_price: 1600,
    sku: 'AUR-FUR-02',
    stock_quantity: 8,
    image_url: '/src/assets/images/product_lounge_chair_1791425543194.jpg',
    gallery_urls: ['/src/assets/images/product_lounge_chair_1791425543194.jpg'],
    featured: true,
    is_active: true,
    created_at: new Date('2026-01-12').toISOString(),
    updated_at: new Date('2026-01-12').toISOString(),
  },
  {
    id: 3,
    category_id: 3,
    name: 'Forma Fluted Ceramic Vessel',
    slug: 'forma-fluted-ceramic-vessel',
    description: 'Hand-thrown stoneware vessel finished in matte unglazed bone white. Subtle fluted ridges created with artisanal wooden ribs, inspired by wabi-sabi minimalism and modern Nordic ceramics. Watertight interior suitable for fresh or dried botanicals.',
    price: 165,
    compare_at_price: null,
    sku: 'AUR-CER-03',
    stock_quantity: 35,
    image_url: '/src/assets/images/product_ceramic_vase_1791425554927.jpg',
    gallery_urls: ['/src/assets/images/product_ceramic_vase_1791425554927.jpg'],
    featured: true,
    is_active: true,
    created_at: new Date('2026-01-15').toISOString(),
    updated_at: new Date('2026-01-15').toISOString(),
  },
  {
    id: 4,
    category_id: 4,
    name: 'Titanium Horizon Automatic Watch',
    slug: 'titanium-horizon-watch',
    description: 'Grade-5 brushed titanium monobloc case measuring 39mm with an ultra-slim 9.8mm profile. Japanese 24-jewel automatic mechanical movement with 42-hour power reserve, double-domed anti-reflective sapphire crystal, and vegetable-tanned Scandinavian bridle leather strap.',
    price: 890,
    compare_at_price: 950,
    sku: 'AUR-HOR-04',
    stock_quantity: 14,
    image_url: '/src/assets/images/product_automatic_watch_1791425566046.jpg',
    gallery_urls: ['/src/assets/images/product_automatic_watch_1791425566046.jpg'],
    featured: true,
    is_active: true,
    created_at: new Date('2026-01-20').toISOString(),
    updated_at: new Date('2026-01-20').toISOString(),
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'Admin Aura',
    email: 'admin@aura.com',
    password_hash: 'admin123',
    role: 'admin',
    address: '100 Studio Way',
    city: 'Stockholm',
    postal_code: '111 22',
    phone: '+46 8 123 4567',
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 2,
    name: 'Elena Vance',
    email: 'customer@aura.com',
    password_hash: 'customer123',
    role: 'customer',
    address: '44 Kronprinsens Alle',
    city: 'Copenhagen',
    postal_code: '1260',
    phone: '+45 32 45 67 89',
    created_at: new Date('2026-01-05').toISOString(),
    updated_at: new Date('2026-01-05').toISOString(),
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    product_id: 1,
    user_id: 2,
    user_name: 'Elena Vance',
    rating: 5,
    comment: 'The soundstage on these headphones is astounding. Natural acoustics with zero ear fatigue during long mastering sessions. Build quality is peerless.',
    created_at: new Date('2026-02-01').toISOString(),
  },
  {
    id: 2,
    product_id: 2,
    user_id: 2,
    user_name: 'Elena Vance',
    rating: 5,
    comment: 'Centerpiece of our living room. The boucle fabric is tactile, firm, and wonderfully crafted. Worth every penny.',
    created_at: new Date('2026-02-05').toISOString(),
  },
  {
    id: 3,
    product_id: 3,
    user_id: 2,
    user_name: 'Elena Vance',
    rating: 4,
    comment: 'Stunning texture and weight. Looks exceptional with dried eucalyptus branches on raw concrete.',
    created_at: new Date('2026-02-12').toISOString(),
  },
  {
    id: 4,
    product_id: 4,
    user_id: 2,
    user_name: 'Elena Vance',
    rating: 5,
    comment: 'The brushed titanium finish catches the morning light delicately. Keeps flawless time. Very comfortable on the wrist.',
    created_at: new Date('2026-02-18').toISOString(),
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    order_number: 'AUR-829104',
    user_id: 2,
    customer_name: 'Elena Vance',
    customer_email: 'customer@aura.com',
    shipping_address: '44 Kronprinsens Alle',
    shipping_city: 'Copenhagen',
    shipping_postal: '1260',
    shipping_phone: '+45 32 45 67 89',
    subtotal: 545,
    tax: 43.6,
    shipping_fee: 0,
    total_amount: 588.6,
    status: 'delivered',
    payment_status: 'paid',
    created_at: new Date('2026-02-01T10:30:00Z').toISOString(),
    updated_at: new Date('2026-02-04T14:20:00Z').toISOString(),
  },
  {
    id: 2,
    order_number: 'AUR-914820',
    user_id: 2,
    customer_name: 'Elena Vance',
    customer_email: 'customer@aura.com',
    shipping_address: '44 Kronprinsens Alle',
    shipping_city: 'Copenhagen',
    shipping_postal: '1260',
    shipping_phone: '+45 32 45 67 89',
    subtotal: 1450,
    tax: 116,
    shipping_fee: 0,
    total_amount: 1566,
    status: 'processing',
    payment_status: 'paid',
    created_at: new Date('2026-03-01T08:15:00Z').toISOString(),
    updated_at: new Date('2026-03-01T09:00:00Z').toISOString(),
  },
];

const INITIAL_ORDER_ITEMS: OrderItem[] = [
  {
    id: 1,
    order_id: 1,
    product_id: 1,
    product_name: 'Aura Studio Pro Wireless Headphones',
    product_price: 380,
    product_image: '/src/assets/images/product_audio_headphones_1791425532484.jpg',
    quantity: 1,
    subtotal: 380,
  },
  {
    id: 2,
    order_id: 1,
    product_id: 3,
    product_name: 'Forma Fluted Ceramic Vessel',
    product_price: 165,
    product_image: '/src/assets/images/product_ceramic_vase_1791425554927.jpg',
    quantity: 1,
    subtotal: 165,
  },
  {
    id: 3,
    order_id: 2,
    product_id: 2,
    product_name: 'Koto Boucle Sculptural Lounge Chair',
    product_price: 1450,
    product_image: '/src/assets/images/product_lounge_chair_1791425543194.jpg',
    quantity: 1,
    subtotal: 1450,
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 1,
    order_id: 1,
    payment_method: 'card',
    amount: 588.6,
    status: 'completed',
    transaction_reference: 'ch_aura_92817293',
    created_at: new Date('2026-02-01T10:31:00Z').toISOString(),
  },
  {
    id: 2,
    order_id: 2,
    payment_method: 'card',
    amount: 1566,
    status: 'completed',
    transaction_reference: 'ch_aura_48102941',
    created_at: new Date('2026-03-01T08:16:00Z').toISOString(),
  },
];

class RelationalDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
    this.ensureDatabaseCollections();
    this.persist();
  }

  private ensureDatabaseCollections() {
    const defaults: DatabaseSchema = {
      users: [...INITIAL_USERS],
      categories: [...INITIAL_CATEGORIES],
      products: [...INITIAL_PRODUCTS],
      cart: [],
      cart_items: [],
      orders: [...INITIAL_ORDERS],
      order_items: [...INITIAL_ORDER_ITEMS],
      payments: [...INITIAL_PAYMENTS],
      reviews: [...INITIAL_REVIEWS],
      wishlist: [],
    };
    for (const key of Object.keys(defaults) as (keyof DatabaseSchema)[]) {
      if (!Array.isArray(this.data[key])) {
        (this.data as unknown as Record<string, unknown>)[key] = defaults[key];
      }
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const loaded = JSON.parse(raw) as Partial<DatabaseSchema>;
        return {
          users: Array.isArray(loaded.users) ? loaded.users : [...INITIAL_USERS],
          categories: Array.isArray(loaded.categories) ? loaded.categories : [...INITIAL_CATEGORIES],
          products: Array.isArray(loaded.products) ? loaded.products : [...INITIAL_PRODUCTS],
          cart: Array.isArray(loaded.cart) ? loaded.cart : [],
          cart_items: Array.isArray(loaded.cart_items) ? loaded.cart_items : [],
          orders: Array.isArray(loaded.orders) ? loaded.orders : [...INITIAL_ORDERS],
          order_items: Array.isArray(loaded.order_items) ? loaded.order_items : [...INITIAL_ORDER_ITEMS],
          payments: Array.isArray(loaded.payments) ? loaded.payments : [...INITIAL_PAYMENTS],
          reviews: Array.isArray(loaded.reviews) ? loaded.reviews : [...INITIAL_REVIEWS],
          wishlist: Array.isArray(loaded.wishlist) ? loaded.wishlist : [],
        };
      }
    } catch (e) {
      console.warn('Could not read existing database file, seeding initial store:', e);
    }

    const initial: DatabaseSchema = {
      users: [...INITIAL_USERS],
      categories: [...INITIAL_CATEGORIES],
      products: [...INITIAL_PRODUCTS],
      cart: [],
      cart_items: [],
      orders: [...INITIAL_ORDERS],
      order_items: [...INITIAL_ORDER_ITEMS],
      payments: [...INITIAL_PAYMENTS],
      reviews: [...INITIAL_REVIEWS],
      wishlist: [
        {
          id: 1,
          user_id: 2,
          product_id: 4,
          created_at: new Date().toISOString(),
        },
      ],
    };

    this.persist(initial);
    return initial;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        DB_FILE_PATH,
        JSON.stringify(dataToSave || this.data, null, 2),
        'utf-8'
      );
    } catch (err) {
      console.error('Failed to write database snapshot to disk:', err);
    }
  }

  // --- USERS ---
  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: number): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const nextId = this.data.users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
    const now = new Date().toISOString();
    const newUser: User = {
      ...userData,
      id: nextId,
      created_at: now,
      updated_at: now,
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUser(id: number, updates: Partial<User>): User | undefined {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.data.users[index];
  }

  getAllUsers(): Omit<User, 'password_hash'>[] {
    return this.data.users.map(({ password_hash, ...u }) => u);
  }

  // --- CATEGORIES ---
  getAllCategories(): Category[] {
    return [...this.data.categories];
  }

  createCategory(category: Omit<Category, 'id' | 'created_at'>): Category {
    const nextId = this.data.categories.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const newCategory: Category = {
      ...category,
      id: nextId,
      created_at: new Date().toISOString(),
    };
    this.data.categories.push(newCategory);
    this.persist();
    return newCategory;
  }

  // --- PRODUCTS ---
  getProducts(filter?: {
    categoryId?: number;
    search?: string;
    featured?: boolean;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  }): Product[] {
    let list = this.data.products.filter(p => p.is_active);

    if (filter?.categoryId) {
      list = list.filter(p => p.category_id === filter.categoryId);
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (filter?.featured) {
      list = list.filter(p => p.featured);
    }

    // Attach category name and ratings
    const enriched = list.map(p => {
      const cat = this.data.categories.find(c => c.id === p.category_id);
      const revs = this.data.reviews.filter(r => r.product_id === p.id);
      const avgRating = revs.length
        ? revs.reduce((acc, r) => acc + r.rating, 0) / revs.length
        : 5;
      return {
        ...p,
        category_name: cat ? cat.name : 'General',
        rating: Number(avgRating.toFixed(1)),
        reviews_count: revs.length,
      };
    });

    if (filter?.sort === 'price_asc') {
      enriched.sort((a, b) => a.price - b.price);
    } else if (filter?.sort === 'price_desc') {
      enriched.sort((a, b) => b.price - a.price);
    } else if (filter?.sort === 'rating') {
      enriched.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return enriched;
  }

  getProductById(id: number): Product | undefined {
    const product = this.data.products.find(p => p.id === id);
    if (!product) return undefined;
    const cat = this.data.categories.find(c => c.id === product.category_id);
    const revs = this.data.reviews.filter(r => r.product_id === product.id);
    const avgRating = revs.length
      ? revs.reduce((acc, r) => acc + r.rating, 0) / revs.length
      : 5;
    return {
      ...product,
      category_name: cat ? cat.name : 'General',
      rating: Number(avgRating.toFixed(1)),
      reviews_count: revs.length,
    };
  }

  createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product {
    const nextId = this.data.products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...product,
      id: nextId,
      created_at: now,
      updated_at: now,
    };
    this.data.products.push(newProduct);
    this.persist();
    return this.getProductById(nextId)!;
  }

  updateProduct(id: number, updates: Partial<Product>): Product | undefined {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.data.products[index] = {
      ...this.data.products[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.getProductById(id);
  }

  deleteProduct(id: number): boolean {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.products.splice(index, 1);
    this.persist();
    return true;
  }

  // --- CART ---
  getOrCreateCart(userId?: number, sessionId?: string): { cart: Cart; items: CartItem[] } {
    let cart: Cart | undefined;
    if (userId) {
      cart = this.data.cart.find(c => c.user_id === userId);
    } else if (sessionId) {
      cart = this.data.cart.find(c => c.session_id === sessionId);
    }

    if (!cart) {
      const nextId = this.data.cart.reduce((max, c) => Math.max(max, c.id), 0) + 1;
      const now = new Date().toISOString();
      cart = {
        id: nextId,
        user_id: userId || null,
        session_id: sessionId || `guest-${Date.now()}`,
        created_at: now,
        updated_at: now,
      };
      this.data.cart.push(cart);
      this.persist();
    }

    const items = this.data.cart_items
      .filter(ci => ci.cart_id === cart!.id)
      .map(ci => ({
        ...ci,
        product: this.getProductById(ci.product_id),
      }));

    return { cart, items };
  }

  addToCart(cartId: number, productId: number, quantity: number = 1): CartItem {
    const product = this.getProductById(productId);
    if (!product) throw new Error('Product not found');

    const existing = this.data.cart_items.find(
      ci => ci.cart_id === cartId && ci.product_id === productId
    );

    if (existing) {
      existing.quantity += quantity;
      this.persist();
      return { ...existing, product };
    }

    const nextId = this.data.cart_items.reduce((max, ci) => Math.max(max, ci.id), 0) + 1;
    const newItem: CartItem = {
      id: nextId,
      cart_id: cartId,
      product_id: productId,
      quantity,
      price_at_addition: product.price,
      created_at: new Date().toISOString(),
    };
    this.data.cart_items.push(newItem);
    this.persist();
    return { ...newItem, product };
  }

  updateCartItemQuantity(cartItemId: number, quantity: number): boolean {
    const item = this.data.cart_items.find(ci => ci.id === cartItemId);
    if (!item) return false;
    if (quantity <= 0) {
      this.data.cart_items = this.data.cart_items.filter(ci => ci.id !== cartItemId);
    } else {
      item.quantity = quantity;
    }
    this.persist();
    return true;
  }

  removeCartItem(cartItemId: number): boolean {
    const initialLen = this.data.cart_items.length;
    this.data.cart_items = this.data.cart_items.filter(ci => ci.id !== cartItemId);
    if (this.data.cart_items.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  clearCart(cartId: number) {
    this.data.cart_items = this.data.cart_items.filter(ci => ci.cart_id !== cartId);
    this.persist();
  }

  // --- ORDERS ---
  calculateOrderTotals(items: { productId: number; quantity: number }[]) {
    let subtotal = 0;
    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new Error('Item quantities must be positive whole numbers');
      }
      const product = this.getProductById(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      subtotal += product.price * item.quantity;
    }
    const tax = Number((subtotal * 0.08).toFixed(2));
    const shippingFee = subtotal > 300 ? 0 : 25;
    return { subtotal, tax, shippingFee, totalAmount: Number((subtotal + tax + shippingFee).toFixed(2)) };
  }

  createOrder(orderData: {
    userId: number;
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    shippingCity: string;
    shippingPostal: string;
    shippingPhone: string;
    paymentMethod: 'card' | 'cod' | 'bank_transfer';
    items: { productId: number; quantity: number }[];
    paymentStatus?: Order['payment_status'];
    transactionReference?: string;
  }): Order {
    const nextOrderId = this.data.orders.reduce((max, o) => Math.max(max, o.id), 0) + 1;
    const orderNumber = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    let subtotal = 0;
    const orderItemsToInsert: OrderItem[] = [];

    for (const item of orderData.items) {
      const product = this.getProductById(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const itemSub = product.price * item.quantity;
      subtotal += itemSub;

      // Adjust stock
      const pIdx = this.data.products.findIndex(p => p.id === product.id);
      if (pIdx !== -1) {
        this.data.products[pIdx].stock_quantity = Math.max(0, this.data.products[pIdx].stock_quantity - item.quantity);
      }

      const nextItemId = this.data.order_items.reduce((max, oi) => Math.max(max, oi.id), 0) + 1 + orderItemsToInsert.length;
      orderItemsToInsert.push({
        id: nextItemId,
        order_id: nextOrderId,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image_url,
        quantity: item.quantity,
        subtotal: itemSub,
      });
    }

    const tax = Number((subtotal * 0.08).toFixed(2));
    const shippingFee = subtotal > 300 ? 0 : 25;
    const totalAmount = Number((subtotal + tax + shippingFee).toFixed(2));

    const newOrder: Order = {
      id: nextOrderId,
      order_number: orderNumber,
      user_id: orderData.userId,
      customer_name: orderData.customerName,
      customer_email: orderData.customerEmail,
      shipping_address: orderData.shippingAddress,
      shipping_city: orderData.shippingCity,
      shipping_postal: orderData.shippingPostal,
      shipping_phone: orderData.shippingPhone,
      subtotal,
      tax,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      status: 'processing',
      payment_status: orderData.paymentStatus || (orderData.paymentMethod === 'cod' ? 'cod' : 'paid'),
      created_at: now,
      updated_at: now,
    };

    this.data.orders.unshift(newOrder);
    this.data.order_items.push(...orderItemsToInsert);

    // Record Payment
    const nextPayId = this.data.payments.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    this.data.payments.push({
      id: nextPayId,
      order_id: nextOrderId,
      payment_method: orderData.paymentMethod,
      amount: totalAmount,
      status: orderData.paymentMethod === 'cod' ? 'pending' : 'completed',
      ...(orderData.transactionReference ? { transaction_reference: orderData.transactionReference } : {}),
      created_at: now,
    });

    this.persist();

    return {
      ...newOrder,
      items: orderItemsToInsert,
    };
  }

  getOrders(userId?: number): Order[] {
    let orders = [...this.data.orders];
    if (userId) {
      orders = orders.filter(o => o.user_id === userId);
    }
    return orders.map(o => ({
      ...o,
      items: this.data.order_items.filter(oi => oi.order_id === o.id),
    }));
  }

  getOrderById(id: number): Order | undefined {
    const order = this.data.orders.find(o => o.id === id);
    if (!order) return undefined;
    return {
      ...order,
      items: this.data.order_items.filter(oi => oi.order_id === order.id),
    };
  }

  updateOrderStatus(orderId: number, status: Order['status'], paymentStatus?: Order['payment_status']): Order | undefined {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return undefined;
    order.status = status;
    if (paymentStatus) order.payment_status = paymentStatus;
    order.updated_at = new Date().toISOString();
    this.persist();
    return this.getOrderById(orderId);
  }

  // --- REVIEWS ---
  getReviews(productId: number): Review[] {
    return this.data.reviews
      .filter(r => r.product_id === productId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  addReview(review: Omit<Review, 'id' | 'created_at'>): Review {
    const nextId = this.data.reviews.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const newRev: Review = {
      ...review,
      id: nextId,
      created_at: new Date().toISOString(),
    };
    this.data.reviews.push(newRev);
    this.persist();
    return newRev;
  }

  // --- WISHLIST ---
  getWishlist(userId: number): WishlistItem[] {
    return this.data.wishlist
      .filter(w => w.user_id === userId)
      .map(w => ({
        ...w,
        product: this.getProductById(w.product_id),
      }));
  }

  toggleWishlist(userId: number, productId: number): { added: boolean } {
    const index = this.data.wishlist.findIndex(
      w => w.user_id === userId && w.product_id === productId
    );
    if (index !== -1) {
      this.data.wishlist.splice(index, 1);
      this.persist();
      return { added: false };
    }
    const nextId = this.data.wishlist.reduce((max, w) => Math.max(max, w.id), 0) + 1;
    this.data.wishlist.push({
      id: nextId,
      user_id: userId,
      product_id: productId,
      created_at: new Date().toISOString(),
    });
    this.persist();
    return { added: true };
  }

  // --- ADMIN METRICS ---
  getAdminMetrics() {
    const totalRevenue = this.data.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((acc, o) => acc + o.total_amount, 0);

    const totalOrders = this.data.orders.length;
    const totalCustomers = this.data.users.filter(u => u.role === 'customer').length;
    const lowStockProducts = this.data.products.filter(p => p.stock_quantity <= 10);
    const recentOrders = this.getOrders().slice(0, 10);

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      totalCustomers,
      totalProducts: this.data.products.length,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentOrders,
    };
  }
}

export const db = new RelationalDatabase();
