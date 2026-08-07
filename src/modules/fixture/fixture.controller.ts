import { Request, Response } from "express";
import { FixtureService } from "./fixture.service";

export class FixtureController {

  constructor(
    private readonly fixtureService: FixtureService
  ) {}

  public async generateFixture(
    req: Request<{ tournamentId: string }>,
    res: Response
  ): Promise<void> {

    try {

      // Generate the fixture for the selected tournament
      const result = await this.fixtureService.generateFixture(
        req.params.tournamentId
      );

      res.status(201).json(result);

    } catch (error: any) {

      console.error("Error generating fixture:", error);

      res.status(400).json({
        error: error.message
      });

    }

  }

}