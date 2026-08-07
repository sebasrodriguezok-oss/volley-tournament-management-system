import { Router } from 'express';
import { StandingController } from './standing.controller';

export class StandingRoutes {

  public readonly router = Router();

  constructor(private readonly standingController: StandingController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    /**
     * @swagger
     * /standings/tournament/{tournamentId}:
     *   get:
     *     summary: Get standings for a tournament
     *     tags: [Standings]
     *     parameters:
     *       - in: path
     *         name: tournamentId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of standings ordered by points
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Standing'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get(
      '/standings/tournament/:tournamentId',
      this.standingController.getStandingsByTournament.bind(this.standingController)
    );

    /**
     * @swagger
     * /standings/tournament/{tournamentId}/match/{matchId}:
     *   post:
     *     summary: Update standings after a match result is loaded
     *     tags: [Standings]
     *     parameters:
     *       - in: path
     *         name: tournamentId
     *         required: true
     *         schema:
     *           type: string
     *       - in: path
     *         name: matchId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Standings updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Standings updated successfully
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      '/standings/tournament/:tournamentId/match/:matchId',
      this.standingController.updateStandingsAfterMatch.bind(this.standingController)
    );

    /**
     * @swagger
     * /standings/tournament/{tournamentId}/recalculate:
     *   post:
     *     summary: Recalculate all standings for a tournament from scratch
     *     tags: [Standings]
     *     parameters:
     *       - in: path
     *         name: tournamentId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Standings recalculated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Standings recalculated successfully
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      '/standings/tournament/:tournamentId/recalculate',
      this.standingController.recalculateStandings.bind(this.standingController)
    );
  }
}