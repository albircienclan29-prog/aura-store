import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Database,
  Search,
  RefreshCw,
} from 'lucide-react';
import { DashboardMetrics, Product, Order, Category, User } from '../../types';
import { api } from '../../services/api';

interface AdminDashboardProps {
  onOpenSqlSchema: () => void;
  onRefreshCatalog: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenSqlSchema,
  onRefreshCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'users'>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const [loading, setLoading] = useState(true);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: 1,
    price: 100,
    compareAtPrice: '',
    sku: '',
    stockQuantity: 10,
    description: '',
    imageUrl: '/src/assets/images/product_audio_headphones_1791425532484.jpg',
    featured: false,
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, productsRes, catsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAllOrders(),
        api.getProducts(),
        api.getCategories(),
        api.getSqlSchema().then(() => [
          { id: 1, name: 'Admin Aura', email: 'admin@aura.com', role: 'admin' as const },
          { id: 2, name: 'Elena Vance', email: 'customer@aura.com', role: 'customer' as const },
        ]),
      ]);

      setMetrics(statsRes);
      setOrders(Array.isArray(ordersRes.orders) ? ordersRes.orders : []);
      setProducts(Array.isArray(productsRes.products) ? productsRes.products : []);
      setCategories(Array.isArray(catsRes.categories) ? catsRes.categories : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Error updating order');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this piece from the catalog?')) return;
    try {
      await api.deleteProduct(id);
      await loadAllData();
      onRefreshCatalog();
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || 1,
      price: 250,
      compareAtPrice: '',
      sku: `AUR-GEN-${Math.floor(10 + Math.random() * 89)}`,
      stockQuantity: 15,
      description: '',
      imageUrl: '/src/assets/images/product_ceramic_vase_1791425554927.jpg',
      featured: true,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      categoryId: prod.category_id,
      price: prod.price,
      compareAtPrice: prod.compare_at_price ? String(prod.compare_at_price) : '',
      sku: prod.sku,
      stockQuantity: prod.stock_quantity,
      description: prod.description,
      imageUrl: prod.image_url,
      featured: prod.featured,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          ...formData,
          price: Number(formData.price),
          compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
          stockQuantity: Number(formData.stockQuantity),
        });
      } else {
        await api.createProduct({
          ...formData,
          price: Number(formData.price),
          compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
          stockQuantity: Number(formData.stockQuantity),
        });
      }
      setIsProductModalOpen(false);
      await loadAllData();
      onRefreshCatalog();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner / Navigation for Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-black/5 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <span>Administration Console</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700">Database Synchronized</span>
          </div>
          <h1 className="font-serif-display text-3xl text-neutral-900 mt-1">
            Store Command & Inventory
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSqlSchema}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Export MySQL Schema</span>
          </button>

          <button
            onClick={handleOpenAddProduct}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Catalog Piece</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 py-6 border-b border-black/5 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          Orders ({safeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'products'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          Catalog & Inventory ({safeProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
          }`}
        >
          Registered Accounts
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-neutral-500">Loading admin dataset...</div>
      ) : activeTab === 'overview' ? (
        /* Tab 1: Overview & Metrics */
        <div className="py-8 space-y-8">
          {/* KPI Cards (Tabular Numbers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-xl border border-black/5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
                <span>Total Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-neutral-950 font-mono tabular-nums">
                ${metrics?.totalRevenue?.toLocaleString()}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">Excluding cancelled orders</div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-black/5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-neutral-950 font-mono tabular-nums">
                {metrics?.totalOrders}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">Lifetime customer purchases</div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-black/5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
                <span>Active Products</span>
                <Package className="w-4 h-4 text-neutral-700" />
              </div>
              <div className="text-2xl font-bold text-neutral-950 font-mono tabular-nums">
                {metrics?.totalProducts}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">Across {safeCategories.length} categories</div>
            </div>

            <div className="p-6 bg-white rounded-xl border border-black/5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-2">
                <span>Inventory Alerts</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-neutral-950 font-mono tabular-nums">
                {metrics?.lowStockCount}
              </div>
              <div className="text-[11px] text-amber-700 font-medium mt-1">Items below 10 units</div>
            </div>
          </div>

          {/* Recent Orders in Overview */}
          <div className="bg-white rounded-xl border border-black/5 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="font-serif-display text-base text-neutral-900">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-neutral-600 hover:text-neutral-900 font-medium underline"
              >
                View all orders
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9F9F8] text-neutral-500 border-b border-neutral-100">
                  <tr>
                    <th className="p-4 font-medium">Order Reference</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Items</th>
                    <th className="p-4 font-medium">Total</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Quick Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50/70">
                      <td className="p-4 font-mono font-medium text-neutral-900">
                        #{order.order_number}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-neutral-800">{order.customer_name}</div>
                        <div className="text-[11px] text-neutral-400">{order.customer_email}</div>
                      </td>
                      <td className="p-4 text-neutral-600">
                        {order.items?.length || 1} pieces
                      </td>
                      <td className="p-4 font-medium font-mono tabular-nums text-neutral-900">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className="uppercase text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-white border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-700 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'orders' ? (
        /* Tab 2: Orders Management */
        <div className="py-8">
          <div className="bg-white rounded-xl border border-black/5 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif-display text-base text-neutral-900">All Store Orders</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Manage statuses and logistics pipelines</p>
              </div>
              <button
                onClick={loadAllData}
                className="p-2 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100 transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9F9F8] text-neutral-500 border-b border-neutral-100">
                  <tr>
                    <th className="p-4 font-medium">Order #</th>
                    <th className="p-4 font-medium">Client Info</th>
                    <th className="p-4 font-medium">Shipping Address</th>
                    <th className="p-4 font-medium">Items Ordered</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Payment</th>
                    <th className="p-4 font-medium">Status & Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50/70">
                      <td className="p-4 font-mono font-medium text-neutral-900">
                        #{order.order_number}
                        <div className="text-[10px] text-neutral-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-neutral-900">{order.customer_name}</div>
                        <div className="text-neutral-500">{order.customer_email}</div>
                        <div className="text-[11px] text-neutral-400">{order.shipping_phone}</div>
                      </td>
                      <td className="p-4 text-neutral-600">
                        <div>{order.shipping_address}</div>
                        <div className="text-neutral-400">{order.shipping_city}, {order.shipping_postal}</div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {order.items?.map((it) => (
                            <div key={it.id} className="text-neutral-700">
                              {it.quantity}× {it.product_name} (${it.product_price})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-medium font-mono tabular-nums text-neutral-950">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span className={`uppercase text-[10px] font-semibold px-2 py-0.5 rounded ${
                          order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-xs text-neutral-800 font-medium cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'products' ? (
        /* Tab 3: Products & Inventory */
        <div className="py-8">
          <div className="bg-white rounded-xl border border-black/5 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif-display text-base text-neutral-900">Catalog Inventory</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Edit pricing, stock levels, and SKUs</p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="px-3.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Piece</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9F9F8] text-neutral-500 border-b border-neutral-100">
                  <tr>
                    <th className="p-4 font-medium">Piece</th>
                    <th className="p-4 font-medium">SKU</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Stock Level</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-neutral-50/70">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-12 h-12 object-cover rounded-md bg-neutral-100 border border-neutral-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-neutral-900">{prod.name}</div>
                          <div className="text-[11px] text-neutral-400 line-clamp-1">{prod.description}</div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-neutral-600">{prod.sku}</td>
                      <td className="p-4 text-neutral-700">{prod.category_name}</td>
                      <td className="p-4 font-medium font-mono tabular-nums text-neutral-950">
                        ${prod.price.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`font-mono tabular-nums font-semibold ${
                          prod.stock_quantity <= 10 ? 'text-amber-700' : 'text-neutral-800'
                        }`}>
                          {prod.stock_quantity} units
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 4: Users */
        <div className="py-8">
          <div className="bg-white rounded-xl border border-black/5 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-neutral-100">
              <h3 className="font-serif-display text-base text-neutral-900">User Accounts</h3>
              <p className="text-xs text-neutral-500 mt-0.5">MySQL users table snapshot</p>
            </div>
            <div className="divide-y divide-neutral-100 text-xs">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">{u.name}</div>
                    <div className="text-neutral-500">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="uppercase text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                      {u.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-black/5 max-h-[85vh] overflow-y-auto">
            <h3 className="font-serif-display text-lg text-neutral-900 mb-4">
              {editingProduct ? 'Edit Catalog Piece' : 'Add New Design Piece'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Compare Price ($)</label>
                  <input
                    type="number"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Image URL</label>
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="feat"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-neutral-300"
                />
                <label htmlFor="feat" className="text-neutral-700 font-medium cursor-pointer">
                  Highlight as Featured Piece
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-900 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Save Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
