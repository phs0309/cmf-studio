import sqlite3 from 'sqlite3';
import { join } from 'path';
import { SCHEMA_SQL } from './schema';

export class Database {
    private db!: sqlite3.Database;

    constructor() {
        // For Render, use in-memory database to avoid filesystem issues
        // In production with persistent storage, this would be a real file
        const isRender = process.env.RENDER || process.env.NODE_ENV === 'production';
        
        if (isRender) {
            // Use in-memory SQLite database for Render
            this.initSQLite(':memory:');
        } else {
            // Local development - use file-based database
            const dbPath = join(__dirname, '..', '..', 'data', 'cmf_studio.db');
            this.initSQLite(dbPath);
        }
    }

    private initSQLite(dbPath: string) {

            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    process.exit(1);
                }
                console.log(`Connected to SQLite database at: ${dbPath === ':memory:' ? 'in-memory' : dbPath}`);
                this.initializeSchema();
            });

            // Enable foreign key constraints
            this.db.run('PRAGMA foreign_keys = ON');
    }

    private initializeSchema() {
        this.db.exec(SCHEMA_SQL, (err) => {
            if (err) {
                console.error('Error initializing database schema:', err);
            } else {
                console.log('Database schema initialized successfully');
            }
        });
    }

    public getDb(): sqlite3.Database {
        return this.db;
    }

    public close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // Generic query method with Promise support
    public query(sql: string, params: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    public run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    public get(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
}

export const database = new Database();