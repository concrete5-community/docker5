export interface DockerPort {
  name: string;
  expose: boolean;
  guest: number;
  host: number;
}
