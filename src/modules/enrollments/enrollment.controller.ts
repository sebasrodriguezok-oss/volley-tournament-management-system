import { Request, Response } from 'express';
import { EnrollmentService } from './enrollment.service';

export class EnrollmentController {

  constructor(private readonly enrollmentService: EnrollmentService) {}

  public async getEnrollments(_req: Request, res: Response): Promise<void> {
    try {
      const enrollments = await this.enrollmentService.getEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  public async getEnrollment(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const enrollment = await this.enrollmentService.getEnrollmentById(req.params.id);

      if (enrollment) {
        res.json(enrollment);
      } else {
        res.status(404).json({ error: 'Enrollment not found' });
      }
    } catch (error: any) {
      console.error('Error fetching enrollment:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async getEnrollmentsByTournament(req: Request<{ tournamentId: string }>, res: Response): Promise<void> {
    try {
      const enrollments = await this.enrollmentService.getEnrollmentsByTournamentId(req.params.tournamentId);
      res.json(enrollments);
    } catch (error: any) {
      console.error('Error fetching enrollments by tournament:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async getEnrollmentsByTeam(req: Request<{ teamId: string }>, res: Response): Promise<void> {
    try {
      const enrollments = await this.enrollmentService.getEnrollmentsByTeamId(req.params.teamId);
      res.json(enrollments);
    } catch (error: any) {
      console.error('Error fetching enrollments by team:', error);
      res.status(400).json({ error: error.message });
    }
  }

  public async createEnrollment(req: Request, res: Response): Promise<void> {
    try {
      const enrollment = await this.enrollmentService.createEnrollment(req.body);
      res.status(201).json(enrollment);
    } catch (error: any) {
      console.error('Error creating enrollment:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Baja lógica — cambia status a withdrawn
  public async withdrawEnrollment(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const enrollment = await this.enrollmentService.withdrawEnrollment(req.params.id);

      if (enrollment) {
        res.json(enrollment);
      } else {
        res.status(404).json({ error: 'Enrollment not found' });
      }
    } catch (error: any) {
      console.error('Error withdrawing enrollment:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Borrado físico — solo si realmente se necesita eliminar
  public async deleteEnrollment(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const deleted = await this.enrollmentService.deleteEnrollment(req.params.id);

      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Enrollment not found' });
      }
    } catch (error: any) {
      console.error('Error deleting enrollment:', error);
      res.status(400).json({ error: error.message });
    }
  }
}