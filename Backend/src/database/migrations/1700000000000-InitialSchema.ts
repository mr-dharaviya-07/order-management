import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        passwordHash VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
        refreshTokenHash VARCHAR(255) NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deletedAt DATETIME(6) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. categories table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description VARCHAR(255) NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deletedAt DATETIME(6) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. menu_items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        categoryId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        imageUrl VARCHAR(255) NOT NULL,
        isAvailable TINYINT NOT NULL DEFAULT 1,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deletedAt DATETIME(6) NULL,
        INDEX IDX_menu_items_name (name),
        CONSTRAINT FK_menu_items_categoryId FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. image_assets table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS image_assets (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        url VARCHAR(255) NOT NULL,
        menuItemId VARCHAR(36) NOT NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deletedAt DATETIME(6) NULL,
        CONSTRAINT FK_image_assets_menuItemId FOREIGN KEY (menuItemId) REFERENCES menu_items(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. orders table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        orderNumber VARCHAR(255) NOT NULL UNIQUE,
        customerName VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        state VARCHAR(255) NOT NULL,
        zipCode VARCHAR(255) NOT NULL,
        instructions TEXT NULL,
        status ENUM('ORDER_RECEIVED', 'PREPARING', 'COOKING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'ORDER_RECEIVED',
        subtotal DECIMAL(10, 2) NOT NULL,
        deliveryFee DECIMAL(10, 2) NOT NULL,
        tax DECIMAL(10, 2) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        estimatedDeliveryAt DATETIME NOT NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deletedAt DATETIME(6) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. order_items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        orderId VARCHAR(36) NOT NULL,
        menuItemId VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        unitPrice DECIMAL(10, 2) NOT NULL,
        lineTotal DECIMAL(10, 2) NOT NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deletedAt DATETIME(6) NULL,
        CONSTRAINT FK_order_items_orderId FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT FK_order_items_menuItemId FOREIGN KEY (menuItemId) REFERENCES menu_items(id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. order_status_history table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        orderId VARCHAR(36) NOT NULL,
        status ENUM('ORDER_RECEIVED', 'PREPARING', 'COOKING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') NOT NULL,
        note TEXT NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        deletedAt DATETIME(6) NULL,
        CONSTRAINT FK_order_status_history_orderId FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS order_status_history;`);
    await queryRunner.query(`DROP TABLE IF EXISTS order_items;`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders;`);
    await queryRunner.query(`DROP TABLE IF EXISTS image_assets;`);
    await queryRunner.query(`DROP TABLE IF EXISTS menu_items;`);
    await queryRunner.query(`DROP TABLE IF EXISTS categories;`);
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
