import { database } from '../database/connection';
import { Submission, AddSubmissionRequest } from '../models/types';

export class SubmissionService {

  async getAll(): Promise<Submission[]> {
    try {
      let submissions;
      if (process.env.DATABASE_URL) {
        // PostgreSQL
        submissions = await database.query(
          `SELECT s.id, s.access_code, s.comment, s.generated_image_url,
                  s.created_at
           FROM submissions s
           ORDER BY s.created_at DESC`
        );
      } else {
        // SQLite
        submissions = await database.query(
          `SELECT s.id, s.access_code, s.comment, s.generated_image_url,
                  datetime(s.created_at, 'localtime') as created_at
           FROM submissions s
           ORDER BY s.created_at DESC`
        );
      }

      // Get original images for each submission
      for (const submission of submissions) {
        let images;
        if (process.env.DATABASE_URL) {
          // PostgreSQL
          images = await database.query(
            `SELECT image_url FROM submission_images 
             WHERE submission_id = $1 
             ORDER BY image_order`,
            [submission.id]
          );
        } else {
          // SQLite
          images = await database.query(
            `SELECT image_url FROM submission_images 
             WHERE submission_id = ? 
             ORDER BY image_order`,
            [submission.id]
          );
        }
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
      // Insert submission - handle PostgreSQL and SQLite differently for ID retrieval
      let submissionId: number;
      
      if (process.env.DATABASE_URL) {
        // PostgreSQL - use RETURNING clause
        const result = await database.query(
          `INSERT INTO submissions (access_code, comment, generated_image_url) 
           VALUES ($1, $2, $3) RETURNING id`,
          [data.access_code, data.comment, data.generated_image_url]
        );
        submissionId = result[0].id;
      } else {
        // SQLite
        const submissionResult = await database.run(
          `INSERT INTO submissions (access_code, comment, generated_image_url) 
           VALUES (?, ?, ?)`,
          [data.access_code, data.comment, data.generated_image_url]
        );
        submissionId = submissionResult.lastID;
      }

      // Insert original images
      if (originalImageUrls.length > 0) {
        if (process.env.DATABASE_URL) {
          // PostgreSQL - use $1, $2, $3 placeholders
          const imageInserts = originalImageUrls.map((url, index) => {
            return database.query(
              `INSERT INTO submission_images (submission_id, image_url, image_order) 
               VALUES ($1, $2, $3)`,
              [submissionId, url, index]
            );
          });
          await Promise.all(imageInserts);
        } else {
          // SQLite - use ? placeholders
          const imageInserts = originalImageUrls.map((url, index) => {
            return database.run(
              `INSERT INTO submission_images (submission_id, image_url, image_order) 
               VALUES (?, ?, ?)`,
              [submissionId, url, index]
            );
          });
          await Promise.all(imageInserts);
        }
      }

      // Return the created submission with images
      let newSubmission;
      if (process.env.DATABASE_URL) {
        // PostgreSQL
        const result = await database.query(
          `SELECT s.id, s.access_code, s.comment, s.generated_image_url,
                  s.created_at
           FROM submissions s 
           WHERE s.id = $1`,
          [submissionId]
        );
        newSubmission = result[0];
      } else {
        // SQLite
        newSubmission = await database.get(
          `SELECT s.id, s.access_code, s.comment, s.generated_image_url,
                  datetime(s.created_at, 'localtime') as created_at
           FROM submissions s 
           WHERE s.id = ?`,
          [submissionId]
        );
      }

      newSubmission.original_images = originalImageUrls;
      return newSubmission;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw new Error('Failed to create submission');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      let result;
      if (process.env.DATABASE_URL) {
        // PostgreSQL
        result = await database.query(
          'DELETE FROM submissions WHERE id = $1',
          [id]
        );
        // PostgreSQL returns empty array for DELETE with no RETURNING clause
        // We need to check if any rows were affected differently
        // For now, we'll assume it worked if no error was thrown
      } else {
        // SQLite
        result = await database.run(
          'DELETE FROM submissions WHERE id = ?',
          [id]
        );
        if (result.changes === 0) {
          throw new Error('Submission not found');
        }
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw new Error('Failed to delete submission');
    }
  }
}