import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Volley Tournament Management System API',
      version: '1.0.0',
      description: 'API for managing volleyball tournaments, teams, matches and enrollments'
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Tournament: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            name: { type: 'string', example: 'Torneo Apertura 2025' },
            type: { type: 'string', enum: ['round_robin', 'group_stage'] },
            category: { type: 'string', example: 'Femenino Mayor' },
            startDate: { type: 'string', format: 'date', example: '2025-08-01' },
            endDate: { type: 'string', format: 'date', example: '2025-09-30' },
            teamCount: { type: 'number', example: 8 },
            status: { type: 'string', enum: ['pending', 'in_progress', 'finished'] }
          }
        },
        Team: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2' },
            name: { type: 'string', example: 'Club Atletico Voley' },
            category: { type: 'string', example: 'Femenino Mayor' },
            coach: { type: 'string', example: 'Juan Perez' },
            playerCount: { type: 'number', example: 12 }
          }
        },
        Enrollment: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d3' },
            teamId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2' },
            tournamentId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            enrollmentDate: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'withdrawn', 'cancelled'] }
          }
        },
        Match: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d4'},
            tournamentId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1'},
            homeTeamId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2'},
            awayTeamId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d3'},
            round: { type: 'integer', example: 1},
            matchDate: { type: 'string', format: 'date-time', nullable: true, example: '2026-08-15T18:00:00Z'},
            status: {
              type: 'string',
              enum: [
                'scheduled',
                'in_progress',
                'finished'
              ],
              example: 'scheduled'
            },
            homeScore: { type: 'integer', nullable: true, example: 3},
            awayScore: { type: 'integer', nullable: true, example: 1}
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message here' }
          }
        }
      }
    }
  },
  apis: ['./src/modules/**/*.routes.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
