import { Router } from "express";
import { FixtureController } from "./fixture.controller";

export class FixtureRoutes {

  public readonly router = Router();

  constructor(
    private readonly fixtureController: FixtureController
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {

    /**
     * @swagger
     * /fixtures/{tournamentId}/generate:
     *   post:
     *     summary: Generate the fixture for a round robin tournament
     *     tags: [Fixtures]
     *     parameters:
     *       - in: path
     *         name: tournamentId
     *         required: true
     *         schema:
     *           type: string
     *         description: Tournament identifier
     *     responses:
     *       201:
     *         description: Fixture generated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *                   example: Fixture generated successfully
     *                 rounds:
     *                   type: integer
     *                   example: 7
     *                 matches:
     *                   type: integer
     *                   example: 28
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    this.router.post(
      "/fixtures/:tournamentId/generate",
      this.fixtureController.generateFixture.bind(this.fixtureController)
    );

  }

}