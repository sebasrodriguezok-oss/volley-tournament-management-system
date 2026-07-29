import { Router } from 'express';
import { TeamController } from './team.controller';

export class TeamRoutes {

  public readonly router = Router();

  constructor(private readonly teamController: TeamController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    /**
     * @swagger
     * /teams:
     *   get:
     *     summary: Get all teams
     *     tags: [Teams]
     *     responses:
     *       200:
     *         description: List of teams
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Team'
     */
    this.router.get('/teams', this.teamController.getTeams.bind(this.teamController));

    /**
     * @swagger
     * /teams/{id}:
     *   get:
     *     summary: Get team by ID
     *     tags: [Teams]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Team found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Team'
     *       404:
     *         description: Team not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.get('/teams/:id', this.teamController.getTeam.bind(this.teamController));

    /**
     * @swagger
     * /teams:
     *   post:
     *     summary: Create a new team
     *     tags: [Teams]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - category
     *               - playerCount
     *             properties:
     *               name:
     *                 type: string
     *                 example: 'Club Atletico Voley'
     *               category:
     *                 type: string
     *                 example: 'Femenino Mayor'
     *               coach:
     *                 type: string
     *                 example: 'Juan Perez'
     *               playerCount:
     *                 type: number
     *                 example: 12
     *     responses:
     *       201:
     *         description: Team created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Team'
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post('/teams', this.teamController.createTeam.bind(this.teamController));

    /**
     * @swagger
     * /teams/{id}:
     *   put:
     *     summary: Update a team
     *     tags: [Teams]
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
     *               category:
     *                 type: string
     *               coach:
     *                 type: string
     *               playerCount:
     *                 type: number
     *     responses:
     *       200:
     *         description: Team updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Team'
     *       404:
     *         description: Team not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.put('/teams/:id', this.teamController.updateTeam.bind(this.teamController));

    /**
     * @swagger
     * /teams/{id}:
     *   delete:
     *     summary: Delete a team
     *     tags: [Teams]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       204:
     *         description: Team deleted successfully
     *       404:
     *         description: Team not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.delete('/teams/:id', this.teamController.deleteTeam.bind(this.teamController));
  }
}