# Example Plugins

This document provides examples of common plugin patterns and use cases.

## Example 1: REST API Plugin

A plugin that adds a complete REST API for managing resources.

```typescript
import { BackendPlugin } from '@enxp/backend';
import { Router } from 'express';

export default class ProductAPIPlugin extends BackendPlugin {
  private products: Map<string, any> = new Map();

  constructor() {
    super('product-api', 'Product API', '1.0.0', {
      description: 'Product management API',
    });
  }

  async onInitialize(): Promise<void> {
    // Load products from database
    this.products = new Map([
      ['1', { id: '1', name: 'Product 1', price: 29.99 }],
      ['2', { id: '2', name: 'Product 2', price: 49.99 }],
    ]);
  }

  registerRoutes(router: Router): void {
    // GET /products - List all products
    router.get('/products', (req, res) => {
      const products = Array.from(this.products.values());
      res.json({ products });
    });

    // GET /products/:id - Get product by ID
    router.get('/products/:id', (req, res) => {
      const product = this.products.get(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ product });
    });

    // POST /products - Create product
    router.post('/products', (req, res) => {
      const { name, price } = req.body;
      const id = String(this.products.size + 1);
      const product = { id, name, price };
      
      this.products.set(id, product);
      this.emit('product:created', product);
      
      res.status(201).json({ product });
    });

    // PUT /products/:id - Update product
    router.put('/products/:id', (req, res) => {
      const product = this.products.get(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      Object.assign(product, req.body);
      this.emit('product:updated', product);
      
      res.json({ product });
    });

    // DELETE /products/:id - Delete product
    router.delete('/products/:id', (req, res) => {
      const deleted = this.products.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Product not found' });
      }

      this.emit('product:deleted', req.params.id);
      res.json({ success: true });
    });
  }
}
```

## Example 2: Authentication Plugin

A plugin that provides JWT-based authentication.

```typescript
import { BackendPlugin } from '@enxp/backend';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export default class AuthPlugin extends BackendPlugin {
  private users: Map<string, any> = new Map();
  private secret: string = 'your-secret-key';

  constructor() {
    super('auth', 'Authentication', '1.0.0', {
      description: 'JWT authentication',
    });
  }

  async onInitialize(): Promise<void> {
    // Load secret from config
    this.secret = this.context.config.settings.jwtSecret || this.secret;
    
    // Initialize with demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    this.users.set('admin@example.com', {
      id: '1',
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    });
  }

  registerRoutes(router: Router): void {
    // POST /login
    router.post('/login', async (req, res) => {
      const { email, password } = req.body;
      
      const user = this.users.get(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        this.secret,
        { expiresIn: '24h' }
      );

      res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    });

    // POST /register
    router.post('/register', async (req, res) => {
      const { email, password, name } = req.body;

      if (this.users.has(email)) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const id = String(this.users.size + 1);
      
      const user = {
        id,
        email,
        password: hashedPassword,
        name,
      };

      this.users.set(email, user);
      this.emit('user:registered', { id, email, name });

      res.status(201).json({ user: { id, email, name } });
    });

    // GET /me
    router.get('/me', this.authMiddleware.bind(this), (req: any, res) => {
      res.json({ user: req.user });
    });
  }

  registerMiddleware(app: any): void {
    // Add auth middleware to protected routes
    app.use('/api/protected', this.authMiddleware.bind(this));
  }

  private async authMiddleware(req: any, res: any, next: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, this.secret) as any;
      const user = Array.from(this.users.values()).find(u => u.id === decoded.userId);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = { id: user.id, email: user.email, name: user.name };
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}
```

## Example 3: Dashboard Widget Plugin

A frontend plugin that adds a dashboard widget.

```typescript
import React, { useState, useEffect } from 'react';
import { FrontendPlugin, Widget } from '@enxp/frontend';

export default class AnalyticsDashboardPlugin extends FrontendPlugin {
  constructor() {
    super('analytics-dashboard', 'Analytics Dashboard', '1.0.0', {
      description: 'Analytics dashboard widgets',
    });
  }

  registerWidgets(): Widget[] {
    return [
      {
        id: 'user-count',
        name: 'User Count',
        component: this.UserCountWidget,
        size: { width: 300, height: 200 },
      },
      {
        id: 'revenue-chart',
        name: 'Revenue Chart',
        component: this.RevenueChartWidget,
        size: { width: 600, height: 400 },
      },
    ];
  }

  private UserCountWidget: React.FC = () => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetch('/api/plugins/analytics-dashboard/users/count')
        .then(res => res.json())
        .then(data => {
          setCount(data.count);
          setLoading(false);
        });
    }, []);

    if (loading) {
      return <div className="widget-loading">Loading...</div>;
    }

    return (
      <div className="widget user-count">
        <h3>Total Users</h3>
        <div className="count">{count}</div>
      </div>
    );
  };

  private RevenueChartWidget: React.FC = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
      fetch('/api/plugins/analytics-dashboard/revenue')
        .then(res => res.json())
        .then(setData);
    }, []);

    return (
      <div className="widget revenue-chart">
        <h3>Revenue</h3>
        {/* Chart component here */}
        <div>Chart visualization...</div>
      </div>
    );
  };
}
```

## Example 4: Theme Plugin

A plugin that provides custom theming.

```typescript
import { FrontendPlugin, ThemeDefinition } from '@enxp/frontend';

export default class DarkThemePlugin extends FrontendPlugin {
  constructor() {
    super('dark-theme', 'Dark Theme', '1.0.0', {
      description: 'Dark mode theme',
    });
  }

  registerThemes(): ThemeDefinition[] {
    return [
      {
        id: 'dark',
        name: 'Dark Theme',
        colors: {
          primary: '#1e90ff',
          secondary: '#ff6b6b',
          background: '#1a1a1a',
          surface: '#2d2d2d',
          text: '#ffffff',
          textSecondary: '#b0b0b0',
          border: '#404040',
        },
        fonts: {
          body: 'Inter, sans-serif',
          heading: 'Poppins, sans-serif',
          mono: 'Fira Code, monospace',
        },
        spacing: {
          xs: '4px',
          sm: '8px',
          md: '16px',
          lg: '24px',
          xl: '32px',
        },
      },
    ];
  }
}
```

## Example 5: Database Plugin

A plugin that provides database connectivity.

```typescript
import { BackendPlugin } from '@enxp/backend';
import mongoose from 'mongoose';

export default class DatabasePlugin extends BackendPlugin {
  private connection: typeof mongoose | null = null;

  constructor() {
    super('database', 'Database', '1.0.0', {
      description: 'MongoDB database connection',
    });
  }

  async onInitialize(): Promise<void> {
    const uri = this.context.config.settings.mongoUri || 'mongodb://localhost:27017/enxp';
    
    try {
      this.connection = await mongoose.connect(uri);
      this.log('info', 'Database connected');
      
      // Register as platform service
      this.context.api.registerService('database', this.connection);
    } catch (error) {
      this.log('error', 'Database connection failed', error as Error);
      throw error;
    }
  }

  async onDestroy(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      this.log('info', 'Database disconnected');
    }
  }

  // Helper methods
  async query(collection: string, filter: any) {
    return this.connection?.model(collection).find(filter);
  }

  async insert(collection: string, data: any) {
    return this.connection?.model(collection).create(data);
  }

  async update(collection: string, filter: any, update: any) {
    return this.connection?.model(collection).updateMany(filter, update);
  }

  async delete(collection: string, filter: any) {
    return this.connection?.model(collection).deleteMany(filter);
  }
}
```

## Example 6: Notification Plugin

A plugin that handles notifications across the platform.

```typescript
import { BackendPlugin } from '@enxp/backend';
import { Router } from 'express';

export default class NotificationPlugin extends BackendPlugin {
  private notifications: Map<string, any[]> = new Map();

  constructor() {
    super('notifications', 'Notifications', '1.0.0', {
      description: 'Notification system',
    });
  }

  async onActivate(): Promise<void> {
    // Listen to platform events
    this.context.events.on('user:registered', (user) => {
      this.createNotification(user.id, 'Welcome to the platform!', 'info');
    });

    this.context.events.on('plugin:product-api:product:created', (product) => {
      this.broadcastNotification(`New product: ${product.name}`, 'info');
    });
  }

  registerRoutes(router: Router): void {
    // GET /notifications/:userId
    router.get('/notifications/:userId', (req, res) => {
      const notifications = this.notifications.get(req.params.userId) || [];
      res.json({ notifications });
    });

    // POST /notifications/mark-read
    router.post('/notifications/mark-read', (req, res) => {
      const { userId, notificationId } = req.body;
      const userNotifications = this.notifications.get(userId) || [];
      
      const notification = userNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }

      res.json({ success: true });
    });
  }

  private createNotification(userId: string, message: string, type: string) {
    const notifications = this.notifications.get(userId) || [];
    
    notifications.push({
      id: Date.now().toString(),
      message,
      type,
      read: false,
      createdAt: new Date(),
    });

    this.notifications.set(userId, notifications);
    this.emit('notification:created', { userId, message });
  }

  private broadcastNotification(message: string, type: string) {
    // Send to all users
    this.notifications.forEach((_, userId) => {
      this.createNotification(userId, message, type);
    });
  }
}
```

These examples demonstrate common patterns and can be used as starting points for your own plugins!
