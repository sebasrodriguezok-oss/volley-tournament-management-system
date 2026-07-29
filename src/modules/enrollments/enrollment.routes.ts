import { Router } from 'express';
import { EnrollmentController } from './enrollment.controller';

export class EnrollmentRoutes {

  public readonly router = Router();

  constructor(private readonly enrollmentController: EnrollmentController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    /**
     * @swagger
     * /enrollments:
     *   get:
     *     summary: Get all enrollments
     *     tags: [Enrollments]
     *     responses:
     *       200:
     *         description: List of enrollments
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Enrollment'
     */
    this.router.get('/enrollments', this.enrollmentController.getEnrollments.bind(this.enrollmentController));

    /**
     * @swagger
     * /enrollments/tournament/{tournamentId}:
     *   get:
     *     summary: Get all enrollments for a tournament
     *     tags: [Enrollments]
     *     parameters:
     *       - in: path
     *         name: tournamentId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of enrollments for the tournament
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Enrollment'
     *       404:
     *         description: Tournament not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get('/enrollments/tournament/:tournamentId', this.enrollmentController.getEnrollmentsByTournament.bind(this.enrollmentController));

    /**
     * @swagger
     * /enrollments/team/{teamId}:
     *   get:
     *     summary: Get all enrollments for a team
     *     tags: [Enrollments]
     *     parameters:
     *       - in: path
     *         name: teamId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of enrollments for the team
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Enrollment'
     *       404:
     *         description: Team not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get('/enrollments/team/:teamId', this.enrollmentController.getEnrollmentsByTeam.bind(this.enrollmentController));

    /**
     * @swagger
     * /enrollments/{id}:
     *   get:
     *     summary: Get enrollment by ID
     *     tags: [Enrollments]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Enrollment found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Enrollment'
     *       404:
     *         description: Enrollment not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get('/enrollments/:id', this.enrollmentController.getEnrollment.bind(this.enrollmentController));

    /**
     * @swagger
     * /enrollments:
     *   post:
     *     summary: Enroll a team in a tournament
     *     tags: [Enrollments]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - teamId
     *               - tournamentId
     *             properties:
     *               teamId:
     *                 type: string
     *                 example: '64f1a2b3c4d5e6f7a8b9c0d2'
     *               tournamentId:
     *                 type: string
     *                 example: '64f1a2b3c4d5e6f7a8b9c0d1'
     *     responses:
     *       201:
     *         description: Enrollment created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Enrollment'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post('/enrollments', this.enrollmentController.createEnrollment.bind(this.enrollmentController));

    /**
     * @swagger
     * /enrollments/{id}/withdraw:
     *   patch:
     *     summary: Withdraw a team from a tournament (logical deletion)
     *     tags: [Enrollments]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Enrollment withdrawn successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Enrollment'
     *       404:
     *         description: Enrollment not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.patch('/enrollments/:id/withdraw', this.enrollmentController.withdrawEnrollment.bind(this.enrollmentController));

    /**
     * @swagger
     * /enrollments/{id}:
     *   delete:
     *     summary: Permanently delete an enrollment
     *     tags: [Enrollments]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       204:
     *         description: Enrollment deleted successfully
     *       404:
     *         description: Enrollment not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.delete('/enrollments/:id', this.enrollmentController.deleteEnrollment.bind(this.enrollmentController));
  }
}