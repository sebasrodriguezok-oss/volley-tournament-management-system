import { Router } from 'express';
import { MatchController } from './match.controller';

export class MatchRoutes {

  public readonly router = Router();

  constructor(private readonly matchController: MatchController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    /**
     * @swagger
     * /matches:
     *   get:
     *     summary: Get all matches
     *     tags: [Matches]
     *     responses:
     *       200:
     *         description: List of matches
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Match'
     */
    this.router.get(
      '/matches',
      this.matchController.getMatches.bind(this.matchController)
    );

    /**
     * @swagger
     * /matches/tournament/{tournamentId}:
     *   get:
     *     summary: Get all matches for a tournament
     *     tags: [Matches]
     *     parameters:
     *       - in: path
     *         name: tournamentId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of matches for the tournament
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Match'
     *       404:
     *         description: Tournament not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get(
      '/matches/tournament/:tournamentId',
      this.matchController.getMatchesByTournament.bind(this.matchController)
    );

    /**
     * @swagger
     * /matches/{id}:
     *   get:
     *     summary: Get match by ID
     *     tags: [Matches]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Match found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Match'
     *       404:
     *         description: Match not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get(
      '/matches/:id',
      this.matchController.getMatch.bind(this.matchController)
    );

    /**
     * @swagger
     * /matches:
     *   post:
     *     summary: Create a new match
     *     tags: [Matches]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - tournamentId
     *               - homeTeamId
     *               - awayTeamId
     *               - round
     *               - status
     *             properties:
     *               tournamentId:
     *                 type: string
     *                 example: "64f1a2b3c4d5e6f7a8b9c0d1"
     *               homeTeamId:
     *                 type: string
     *                 example: "64f1a2b3c4d5e6f7a8b9c0d2"
     *               awayTeamId:
     *                 type: string
     *                 example: "64f1a2b3c4d5e6f7a8b9c0d3"
     *               round:
     *                 type: integer
     *                 example: 1
     *                 description: Round (matchday) of the tournament.
     *               matchDate:
     *                 type: string
     *                 format: date-time
     *                 nullable: true
     *                 example: "2026-08-10T20:00:00Z"
     *               status:
     *                 type: string
     *                 enum:
     *                   - scheduled
     *                   - in_progress
     *                   - finished
     *                 example: scheduled
     *               homeScore:
     *                 type: integer
     *                 nullable: true
     *                 example: 0
     *               awayScore:
     *                 type: integer
     *                 nullable: true
     *                 example: 0
     *     responses:
     *       201:
     *         description: Match created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Match'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
    '/matches',
    this.matchController.createMatch.bind(this.matchController)
    );

    /**
     * @swagger
     * /matches/{id}:
     *   put:
     *     summary: Update a match
     *     tags: [Matches]
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
     *             $ref: '#/components/schemas/Match'
     *     responses:
     *       200:
     *         description: Match updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Match'
     *       404:
     *         description: Match not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.put(
      '/matches/:id',
      this.matchController.updateMatch.bind(this.matchController)
    );

    /**
     * @swagger
     * /matches/{id}:
     *   delete:
     *     summary: Delete a match
     *     tags: [Matches]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       204:
     *         description: Match deleted successfully
     *       404:
     *         description: Match not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.delete(
      '/matches/:id',
      this.matchController.deleteMatch.bind(this.matchController)
    );

  }
}