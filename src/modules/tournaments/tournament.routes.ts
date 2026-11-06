import { Router } from 'express';
import { TournamentController } from './tournament.controller';

export class TournamentRoutes {

  public readonly router = Router();

  constructor(private readonly tournamentController: TournamentController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    /**
     * @swagger
     * /tournaments:
     *   get:
     *     summary: Get all tournaments
     *     tags: [Tournaments]
     *     responses:
     *       200:
     *         description: List of tournaments
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Tournament'
     */
    this.router.get('/tournaments', this.tournamentController.getTournaments.bind(this.tournamentController));

    /**
     * @swagger
     * /tournaments/{id}:
     *   get:
     *     summary: Get tournament by ID
     *     tags: [Tournaments]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Tournament found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Tournament'
     *       404:
     *         description: Tournament not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get('/tournaments/:id', this.tournamentController.getTournament.bind(this.tournamentController));

    /**
     * @swagger
     * /tournaments:
     *   post:
     *     summary: Create a new tournament
     *     tags: [Tournaments]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - type
     *               - category
     *               - startDate
     *               - endDate
     *               - teamCount
     *             properties:
     *               name:
     *                 type: string
     *                 example: 'Torneo Apertura 2025'
     *               type:
     *                 type: string
     *                 enum: [round_robin]
     *               category:
     *                 type: string
     *                 example: 'Femenino Mayor'
     *               startDate:
     *                 type: string
     *                 format: date
     *                 example: '2025-08-01'
     *               endDate:
     *                 type: string
     *                 format: date
     *                 example: '2025-09-30'
     *               teamCount:
     *                 type: number
     *                 example: 8
     *                 minimum: 2
     *                 maximum: 16
     *                 description: Integer number of teams
     *     responses:
     *       201:
     *         description: Tournament created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Tournament'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post('/tournaments', this.tournamentController.createTournament.bind(this.tournamentController));

    /**
     * @swagger
     * /tournaments/{id}:
     *   put:
     *     summary: Update a tournament
     *     tags: [Tournaments]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               type:
     *                 type: string
     *                 enum: [round_robin]
     *               category:
     *                 type: string
     *               startDate:
     *                 type: string
     *                 format: date
     *               endDate:
     *                 type: string
     *                 format: date
     *               teamCount:
     *                 type: number
     *                 minimum: 2
     *                 maximum: 16
     *     responses:
     *       200:
     *         description: Tournament updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Tournament'
     *       404:
     *         description: Tournament not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.put('/tournaments/:id', this.tournamentController.updateTournament.bind(this.tournamentController));

    /**
     * @swagger
     * /tournaments/{id}/finish:
     *   post:
     *     summary: Finalize a tournament after every match has a valid result
     *     tags: [Tournaments]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Tournament finalized
     *       400:
     *         description: Tournament still has unresolved matches or cannot be finalized
     */
    this.router.post(
      '/tournaments/:id/finish',
      this.tournamentController.finishTournament.bind(this.tournamentController)
    );

    /**
     * @swagger
     * /tournaments/{id}:
     *   delete:
     *     summary: Delete a tournament
     *     tags: [Tournaments]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       204:
     *         description: Tournament and its enrollments and unplayed matches deleted
     *       400:
     *         description: Tournament cannot be deleted because of its status or match results
     *       404:
     *         description: Tournament not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.delete('/tournaments/:id', this.tournamentController.deleteTournament.bind(this.tournamentController));
  }
}