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
      console.log('=== SubmissionService.create started ===');
      console.log('Data:', data);
      console.log('Original image URLs count:', originalImageUrls.length);
      console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
      
      // Validate access code exists
      console.log('=== Validating access code ===');
      let accessCodeExists;
      if (process.env.DATABASE_URL) {
        // PostgreSQL
        const result = await database.query(
          'SELECT code FROM access_codes WHERE code = $1 AND is_active = true',
          [data.access_code]
        );
        accessCodeExists = result.length > 0;
        console.log('PostgreSQL access code validation result:', result);
      } else {
        // SQLite
        const result = await database.get(
          'SELECT code FROM access_codes WHERE code = ? AND is_active = 1',
          [data.access_code]
        );
        accessCodeExists = !!result;
        console.log('SQLite access code validation result:', result);
      }
      
      if (!accessCodeExists) {
        console.error('Access code not found or inactive:', data.access_code);
        throw new Error(`Invalid or inactive access code: ${data.access_code}`);
      }
      console.log('Access code validation passed');
      
      // Insert submission - handle PostgreSQL and SQLite differently for ID retrieval
      let submissionId: number;
      
      if (process.env.DATABASE_URL) {
        console.log('=== Using PostgreSQL ===');
        // PostgreSQL - use RETURNING clause
        const result = await database.query(
          `INSERT INTO submissions (access_code, comment, generated_image_url) 
           VALUES ($1, $2, $3) RETURNING id`,
          [data.access_code, data.comment, data.generated_image_url]
        );
        console.log('PostgreSQL INSERT result:', result);
        submissionId = result[0].id;
        console.log('New submission ID:', submissionId);
      } else {
        console.log('=== Using SQLite ===');
        // SQLite
        const submissionResult = await database.run(
          `INSERT INTO submissions (access_code, comment, generated_image_url) 
           VALUES (?, ?, ?)`,
          [data.access_code, data.comment, data.generated_image_url]
        );
        console.log('SQLite INSERT result:', submissionResult);
        submissionId = submissionResult.lastID;
        console.log('New submission ID:', submissionId);
      }

      // Insert original images
      if (originalImageUrls.length > 0) {
        console.log('=== Inserting original images ===');
        if (process.env.DATABASE_URL) {
          // PostgreSQL - use $1, $2, $3 placeholders
          console.log('Using PostgreSQL for image inserts');
          const imageInserts = originalImageUrls.map((url, index) => {
            console.log(`Inserting image ${index}:`, url);
            return database.query(
              `INSERT INTO submission_images (submission_id, image_url, image_order) 
               VALUES ($1, $2, $3)`,
              [submissionId, url, index]
            );
          });
          await Promise.all(imageInserts);
          console.log('All images inserted successfully');
        } else {
          // SQLite - use ? placeholders
          console.log('Using SQLite for image inserts');
          const imageInserts = originalImageUrls.map((url, index) => {
            console.log(`Inserting image ${index}:`, url);
            return database.run(
              `INSERT INTO submission_images (submission_id, image_url, image_order) 
               VALUES (?, ?, ?)`,
              [submissionId, url, index]
            );
          });
          await Promise.all(imageInserts);
          console.log('All images inserted successfully');
        }
      } else {
        console.log('No original images to insert');
      }

      // Return the created submission with images
      console.log('=== Fetching created submission ===');
      let newSubmission;
      if (process.env.DATABASE_URL) {
        // PostgreSQL
        console.log('Fetching submission with PostgreSQL');
        const result = await database.query(
          `SELECT s.id, s.access_code, s.comment, s.generated_image_url,
                  s.created_at
           FROM submissions s 
           WHERE s.id = $1`,
          [submissionId]
        );
        console.log('PostgreSQL SELECT result:', result);
        newSubmission = result[0];
      } else {
        // SQLite
        console.log('Fetching submission with SQLite');
        newSubmission = await database.get(
          `SELECT s.id, s.access_code, s.comment, s.generated_image_url,
                  datetime(s.created_at, 'localtime') as created_at
           FROM submissions s 
           WHERE s.id = ?`,
          [submissionId]
        );
        console.log('SQLite SELECT result:', newSubmission);
      }

      console.log('Adding original images to submission');
      newSubmission.original_images = originalImageUrls;
      
      console.log('=== Submission creation completed ===');
      console.log('Final submission:', newSubmission);
      
      return newSubmission;
    } catch (error) {
      console.error('=== ERROR in SubmissionService.create ===');
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error instanceof Error ? error.message : error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Full error object:', error);
      throw new Error(`Failed to create submission: ${error instanceof Error ? error.message : 'Unknown error'}`);
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