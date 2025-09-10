import { database } from '../database/connection';
import { Submission, AddSubmissionRequest } from '../models/types';

export class SubmissionService {

  async getAll(): Promise<Submission[]> {
    try {
      const submissions = await database.query(
        `SELECT s.id, s.access_code, s.comment, s.generated_image_url,
                datetime(s.created_at, 'localtime') as created_at
         FROM submissions s
         ORDER BY s.created_at DESC`
      );

      // Get original images for each submission
      for (const submission of submissions) {
        const images = await database.query(
          `SELECT image_url FROM submission_images 
           WHERE submission_id = ? 
           ORDER BY image_order`,
          [submission.id]
        );
        submission.original_images = images.map((img: any) => img.image_url);
      }

      return submissions;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw new Error('Failed to fetch submissions');
    }
  }

  async create(data: AddSubmissionRequest, originalImageUrls: string[]): Promise<Submission> {
    try {
      // Insert submission
      const submissionResult = await database.run(
        `INSERT INTO submissions (access_code, comment, generated_image_url) 
         VALUES (?, ?, ?)`,
        [data.access_code, data.comment, data.generated_image_url]
      );

      const submissionId = submissionResult.lastID;

      // Insert original images
      if (originalImageUrls.length > 0) {
        const imageInserts = originalImageUrls.map((url, index) => {
          return database.run(
            `INSERT INTO submission_images (submission_id, image_url, image_order) 
             VALUES (?, ?, ?)`,
            [submissionId, url, index]
          );
        });
        
        await Promise.all(imageInserts);
      }

      // Return the created submission with images
      const newSubmission = await database.get(
        `SELECT s.id, s.access_code, s.comment, s.generated_image_url,
                datetime(s.created_at, 'localtime') as created_at
         FROM submissions s 
         WHERE s.id = ?`,
        [submissionId]
      );

      newSubmission.original_images = originalImageUrls;
      return newSubmission;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw new Error('Failed to create submission');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await database.run(
        'DELETE FROM submissions WHERE id = ?',
        [id]
      );

      if (result.changes === 0) {
        throw new Error('Submission not found');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw new Error('Failed to delete submission');
    }
  }
}