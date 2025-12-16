export interface Project {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  environments?: any[];
}
