export interface Tournament {
  id: string;
  name: string;
  type: 'round_robin';
  category: string;
  startDate: Date;
  endDate: Date;
  teamCount: number;
  status: 'pending' | 'in_progress' | 'finished';
}