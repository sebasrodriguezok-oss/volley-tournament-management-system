import { Router } from 'express';
import { EnrollmentController } from './enrollment.controller';

export class EnrollmentRoutes {

  public readonly router = Router();

  constructor(private readonly enrollmentController: EnrollmentController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/enrollments', this.enrollmentController.getEnrollments.bind(this.enrollmentController));
    this.router.get('/enrollments/tournament/:tournamentId', this.enrollmentController.getEnrollmentsByTournament.bind(this.enrollmentController));
    this.router.get('/enrollments/team/:teamId', this.enrollmentController.getEnrollmentsByTeam.bind(this.enrollmentController));
    this.router.get('/enrollments/:id', this.enrollmentController.getEnrollment.bind(this.enrollmentController));
    this.router.post('/enrollments', this.enrollmentController.createEnrollment.bind(this.enrollmentController));
    this.router.delete('/enrollments/:id', this.enrollmentController.deleteEnrollment.bind(this.enrollmentController));
  }
}