export interface Tournament {
  id: string;
  name: string;
  type: 'round_robin' | 'group_stage';
  category: string;
  startDate: Date;
  endDate: Date;
  teamCount: number;
  status: 'pending' | 'in_progress' | 'finished';
}