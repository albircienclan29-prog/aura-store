-- ========================================================
-- E-Commerce Database Schema (MySQL / MariaDB Compatible)
-- Suitable for XAMPP, phpMyAdmin, MySQL Workbench, Docker MySQL
-- ========================================================

CREATE DATABASE IF NOT EXISTS `ecommerce` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ecommerce`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  `address` VARCHAR(255) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `postal_code` VARCHAR(20) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(220) NOT NULL UNIQUE,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `compare_at_price` DECIMAL(10,2) DEFAULT NULL,
  `sku` VARCHAR(50) NOT NULL UNIQUE,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `image_url` VARCHAR(500) NOT NULL,
  `gallery_urls` JSON DEFAULT NULL,
  `featured` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CART TABLE
CREATE TABLE IF NOT EXISTS `cart` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `session_id` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CART_ITEMS TABLE
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cart_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `price_at_addition` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cart_items_cart` FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(32) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `customer_name` VARCHAR(120) NOT NULL,
  `customer_email` VARCHAR(191) NOT NULL,
  `shipping_address` VARCHAR(255) NOT NULL,
  `shipping_city` VARCHAR(100) NOT NULL,
  `shipping_postal` VARCHAR(20) NOT NULL,
  `shipping_phone` VARCHAR(30) NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `tax` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `shipping_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  `payment_status` ENUM('paid', 'pending', 'failed', 'cod') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ORDER_ITEMS TABLE
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `product_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL,
  `subtotal` DECIMAL(10,2) NOT NULL,
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `payment_method` ENUM('card', 'cod', 'bank_transfer') NOT NULL DEFAULT 'card',
  `amount` DECIMAL(10,2) NOT NULL,
  `status` ENUM('completed', 'pending', 'refunded') NOT NULL DEFAULT 'completed',
  `transaction_reference` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `user_name` VARCHAR(120) NOT NULL,
  `rating` TINYINT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. WISHLIST TABLE
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_user_product` (`user_id`, `product_id`),
  CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- INITIAL SEED DATA
-- ========================================================

-- Users (admin: admin@aura.com / admin123, customer: customer@aura.com / customer123)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `address`, `city`, `postal_code`, `phone`)
VALUES
(1, 'Admin Aura', 'admin@aura.com', 'admin123', 'admin', '100 Studio Way', 'Stockholm', '111 22', '+46 8 123 4567'),
(2, 'Elena Vance', 'customer@aura.com', 'customer123', 'customer', '44 Kronprinsens Alle', 'Copenhagen', '1260', '+45 32 45 67 89');

-- Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`)
VALUES
(1, 'Architectural Living', 'architectural-living', 'Modern Scandinavian furniture, crafted solid oak, and tactile textiles.', '/src/assets/images/hero_curated_collection_1791425516611.jpg'),
(2, 'Audio & Acoustics', 'audio-acoustics', 'Precision studio equipment, wireless noise-cancelling monitors, and sound objects.', '/src/assets/images/product_audio_headphones_1791425532484.jpg'),
(3, 'Sculptural Ceramics', 'sculptural-ceramics', 'Handcrafted ceramic vessels, stoneware vases, and tactile organic forms.', '/src/assets/images/product_ceramic_vase_1791425554927.jpg'),
(4, 'Horology & Objects', 'horology-objects', 'Titanium mechanical automatic timepieces and minimalist everyday carry essentials.', '/src/assets/images/product_automatic_watch_1791425566046.jpg');

-- Products
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `compare_at_price`, `sku`, `stock_quantity`, `image_url`, `featured`, `is_active`)
VALUES
(1, 2, 'Aura Studio Pro Wireless Headphones', 'aura-studio-pro-headphones', 'Custom 40mm beryllium drivers, active hybrid noise cancellation, 38-hour battery endurance, and breathable lambskin memory foam earcups.', 380.00, 420.00, 'AUR-AUD-01', 24, '/src/assets/images/product_audio_headphones_1791425532484.jpg', 1, 1),
(2, 1, 'Koto Boucle Sculptural Lounge Chair', 'koto-boucle-lounge-chair', 'Solid FSC-certified European white oak framework with tactile textured cream boucle upholstery. Ergonomically contoured for architectural lounge spaces.', 1450.00, 1600.00, 'AUR-FUR-02', 8, '/src/assets/images/product_lounge_chair_1791425543194.jpg', 1, 1),
(3, 3, 'Forma Fluted Ceramic Vessel', 'forma-fluted-ceramic-vessel', 'Hand-thrown stoneware vessel finished in matte unglazed bone white. Subtle fluted ridges created with artisanal wooden ribs, inspired by wabi-sabi minimalism.', 165.00, NULL, 'AUR-CER-03', 35, '/src/assets/images/product_ceramic_vase_1791425554927.jpg', 1, 1),
(4, 4, 'Titanium Horizon Automatic Watch', 'titanium-horizon-watch', 'Grade-5 brushed titanium monobloc case, Japanese 24-jewel automatic movement with 42-hour power reserve, anti-reflective sapphire crystal, and vegetable-tanned strap.', 890.00, 950.00, 'AUR-HOR-04', 14, '/src/assets/images/product_automatic_watch_1791425566046.jpg', 1, 1);

-- Reviews
INSERT INTO `reviews` (`product_id`, `user_id`, `user_name`, `rating`, `comment`)
VALUES
(1, 2, 'Elena Vance', 5, 'The soundstage on these headphones is astounding. Natural acoustics with zero ear fatigue during long mastering sessions.'),
(2, 2, 'Elena Vance', 5, 'Centerpiece of our living room. The boucle fabric is tactile, firm, and wonderfully crafted.'),
(3, 2, 'Elena Vance', 4, 'Stunning texture and weight. Looks exceptional with dried eucalyptus branches.'),
(4, 2, 'Elena Vance', 5, 'The brushed titanium finish catches the light delicately. Keeps flawless time.');
