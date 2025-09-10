import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

export class Database {
    private db: sqlite3.Database;

    constructor() {
        // Use PostgreSQL URL if available (Render), otherwise SQLite
        if (process.env.DATABASE_URL) {
            // For PostgreSQL on Render (future enhancement)
            // For now, still use SQLite but store in /tmp for Render
            const dbPath = process.env.NODE_ENV === 'production' 
                ? '/tmp/cmf_studio.db'  // Render uses /tmp for writable storage
                : join(__dirname, '..', '..', 'data', 'cmf_studio.db');
            this.initSQLite(dbPath);
        } else {
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
                console.log(`Connected to SQLite database at: ${dbPath}`);
                this.initializeSchema();
            });

            // Enable foreign key constraints
            this.db.run('PRAGMA foreign_keys = ON');
    }

    private initializeSchema() {
        const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
        this.db.exec(schema, (err) => {
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