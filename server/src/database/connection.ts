import { Pool, PoolClient, QueryResult } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

export class Database {
    private pool: any;

    constructor() {
        this.initPostgreSQL();
    }

    private async initPostgreSQL() {
        try {
            // Use PostgreSQL connection string from environment or fallback to SQLite for local dev
            const connectionString = process.env.DATABASE_URL;
            
            if (!connectionString) {
                console.log('No DATABASE_URL found, falling back to SQLite...');
                // Fall back to SQLite for local development
                return this.initSQLite();
            }
            
            this.pool = new Pool({
                connectionString,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
                max: 10, // Maximum number of clients in pool
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
            });

            // Test connection
            const client = await this.pool.connect();
            console.log(`Connected to PostgreSQL database`);
            client.release();

            // Initialize schema
            await this.initSchema();
        } catch (error) {
            console.error('Error connecting to PostgreSQL, falling back to SQLite:', error);
            this.initSQLite();
        }
    }

    private initSQLite() {
        // Fallback to SQLite for local development
        const sqlite3 = require('sqlite3').verbose();
        const { SCHEMA_SQL } = require('./schema');
        
        const isRender = process.env.RENDER || process.env.NODE_ENV === 'production';
        const dbPath = isRender ? ':memory:' : join(__dirname, '..', '..', 'data', 'cmf_studio.db');
        
        this.pool = new sqlite3.Database(dbPath, (err: any) => {
            if (err) {
                console.error('Error opening SQLite database:', err);
                throw err;
            }
            console.log(`Connected to SQLite database at: ${dbPath === ':memory:' ? 'in-memory' : dbPath}`);
            this.initSQLiteSchema();
        });
    }

    private initSQLiteSchema() {
        const { SCHEMA_SQL } = require('./schema');
        (this.pool as any).exec(SCHEMA_SQL, (err: any) => {
            if (err) {
                console.error('Error initializing SQLite schema:', err);
            } else {
                console.log('SQLite schema initialized successfully');
            }
        });
    }

    private async initSchema() {
        try {
            // Read schema from file
            const schemaPath = join(__dirname, 'schema.sql');
            const schema = readFileSync(schemaPath, 'utf8');
            
            const client = await this.pool.connect();
            
            try {
                // Execute the entire schema as one transaction
                await client.query('BEGIN');
                await client.query(schema);
                await client.query('COMMIT');
                
                console.log('PostgreSQL schema initialized successfully');
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error initializing PostgreSQL schema:', error);
            throw error;
        }
    }

    public close(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.pool && typeof this.pool.end === 'function') {
                // PostgreSQL pool
                this.pool.end((err?: any) => {
                    if (err) reject(err);
                    else resolve();
                });
            } else if (this.pool && typeof this.pool.close === 'function') {
                // SQLite database
                (this.pool as any).close((err: any) => {
                    if (err) reject(err);
                    else resolve();
                });
            } else {
                resolve();
            }
        });
    }

    // Generic query method with Promise support
    public async query(sql: string, params: any[] = []): Promise<any[]> {
        if (this.pool && typeof this.pool.connect === 'function') {
            // PostgreSQL
            const client = await this.pool.connect();
            try {
                const result = await client.query(sql, params);
                return result.rows;
            } finally {
                client.release();
            }
        } else {
            // SQLite fallback
            return new Promise((resolve, reject) => {
                (this.pool as any).all(sql, params, (err: any, rows: any) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        }
    }

    public async run(sql: string, params: any[] = []): Promise<any> {
        if (this.pool && typeof this.pool.connect === 'function') {
            // PostgreSQL
            const client = await this.pool.connect();
            try {
                const result = await client.query(sql, params);
                return { 
                    changes: result.rowCount || 0,
                    lastID: result.rows[0]?.id || null
                };
            } finally {
                client.release();
            }
        } else {
            // SQLite fallback
            return new Promise((resolve, reject) => {
                (this.pool as any).run(sql, params, function(this: any, err: any) {
                    if (err) reject(err);
                    else resolve(this);
                });
            });
        }
    }

    public async get(sql: string, params: any[] = []): Promise<any> {
        if (this.pool && typeof this.pool.connect === 'function') {
            // PostgreSQL
            const client = await this.pool.connect();
            try {
                const result = await client.query(sql, params);
                return result.rows[0] || null;
            } finally {
                client.release();
            }
        } else {
            // SQLite fallback
            return new Promise((resolve, reject) => {
                (this.pool as any).get(sql, params, (err: any, row: any) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        }
    }
}

export const database = new Database();