import { database } from '../database/connection';
import { AccessCode } from '../models/types';

export class AccessCodeService {

  async getAll(): Promise<AccessCode[]> {
    try {
      const codes = await database.query(
        `SELECT id, code, datetime(created_at, 'localtime') as created_at, is_active 
         FROM access_codes 
         ORDER BY created_at DESC`
      );
      return codes;
    } catch (error) {
      console.error('Error fetching access codes:', error);
      throw new Error('Failed to fetch access codes');
    }
  }

  async getValidCodes(): Promise<string[]> {
    try {
      const codes = await database.query(
        'SELECT code FROM access_codes WHERE is_active = true'
      );
      return codes.map((row: any) => row.code);
    } catch (error) {
      console.error('Error fetching valid codes:', error);
      throw new Error('Failed to fetch valid codes');
    }
  }

  async validate(code: string): Promise<boolean> {
    try {
      const result = await database.get(
        'SELECT id FROM access_codes WHERE code = ? AND is_active = true',
        [code.trim()]
      );
      return !!result;
    } catch (error) {
      console.error('Error validating code:', error);
      return false;
    }
  }

  async create(code: string): Promise<boolean> {
    try {
      await database.run(
        'INSERT INTO access_codes (code) VALUES (?)',
        [code.trim()]
      );
      return true;
    } catch (error) {
      // If it's a unique constraint error, the code already exists
      if ((error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return false;
      }
      console.error('Error creating access code:', error);
      throw new Error('Failed to create access code');
    }
  }

  async delete(code: string): Promise<void> {
    try {
      const result = await database.run(
        'DELETE FROM access_codes WHERE code = ?',
        [code]
      );

      if (result.changes === 0) {
        throw new Error('Access code not found');
      }
    } catch (error) {
      console.error('Error deleting access code:', error);
      throw new Error('Failed to delete access code');
    }
  }

  async deactivate(code: string): Promise<void> {
    try {
      const result = await database.run(
        'UPDATE access_codes SET is_active = false WHERE code = ?',
        [code]
      );

      if (result.changes === 0) {
        throw new Error('Access code not found');
      }
    } catch (error) {
      console.error('Error deactivating access code:', error);
      throw new Error('Failed to deactivate access code');
    }
  }
}