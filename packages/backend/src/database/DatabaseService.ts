import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppDataSource } from './config';

export class DatabaseService {
  private static instance: DatabaseService;
  private dataSource: DataSource;
  private isConnected: boolean = false;

  private constructor() {
    this.dataSource = AppDataSource;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database connection
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      await this.dataSource.initialize();
      this.isConnected = true;
      console.log('✅ Database connected successfully');
      console.log(`📊 Database: ${this.dataSource.options.database}`);
      console.log(`🔌 Host: ${(this.dataSource.options as any).host}:${(this.dataSource.options as any).port}`);
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      console.log('Database already disconnected');
      return;
    }

    try {
      await this.dataSource.destroy();
      this.isConnected = false;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  /**
   * Get DataSource instance
   */
  public getDataSource(): DataSource {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.dataSource;
  }

  /**
   * Check connection status
   */
  public isReady(): boolean {
    return this.isConnected && this.dataSource.isInitialized;
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      await this.dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
