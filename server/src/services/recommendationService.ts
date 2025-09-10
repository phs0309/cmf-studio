import { database } from '../database/connection';
import { RecommendedDesign, AddRecommendationRequest } from '../models/types';

export class RecommendationService {
  
  async getByAccessCode(accessCode: string): Promise<RecommendedDesign[]> {
    try {
      const designs = await database.query(
        `SELECT id, title, description, image_url, access_code, 
                datetime(created_at, 'localtime') as created_at 
         FROM recommended_designs 
         WHERE access_code = ? 
         ORDER BY created_at DESC`,
        [accessCode]
      );
      return designs;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw new Error('Failed to fetch recommendations');
    }
  }

  async getAll(): Promise<RecommendedDesign[]> {
    try {
      const designs = await database.query(
        `SELECT rd.id, rd.title, rd.description, rd.image_url, rd.access_code,
                datetime(rd.created_at, 'localtime') as created_at
         FROM recommended_designs rd
         JOIN access_codes ac ON rd.access_code = ac.code
         WHERE ac.is_active = true
         ORDER BY rd.created_at DESC`
      );
      return designs;
    } catch (error) {
      console.error('Error fetching all recommendations:', error);
      throw new Error('Failed to fetch all recommendations');
    }
  }

  async create(data: AddRecommendationRequest, imageUrl: string): Promise<RecommendedDesign> {
    try {
      const result = await database.run(
        `INSERT INTO recommended_designs (title, description, image_url, access_code) 
         VALUES (?, ?, ?, ?)`,
        [data.title, data.description, imageUrl, data.access_code]
      );

      const newDesign = await database.get(
        `SELECT id, title, description, image_url, access_code,
                datetime(created_at, 'localtime') as created_at 
         FROM recommended_designs 
         WHERE id = ?`,
        [result.lastID]
      );

      return newDesign;
    } catch (error) {
      console.error('Error creating recommendation:', error);
      throw new Error('Failed to create recommendation');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await database.run(
        'DELETE FROM recommended_designs WHERE id = ?',
        [id]
      );

      if (result.changes === 0) {
        throw new Error('Recommendation not found');
      }
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      throw new Error('Failed to delete recommendation');
    }
  }
}