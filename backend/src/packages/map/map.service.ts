import { type Client, type Distance, TravelMode } from './libs/types/types.js';

class MapService {
  private client: Client;

  private key: string;

  public constructor(client: Client, key: string) {
    this.client = client;
    this.key = key;
  }

  public async getDistance(
    startPoint: string,
    endPoint: string,
  ): Promise<Distance> {
    const response = await this.client.distancematrix({
      params: {
        key: this.key,
        origins: [startPoint],
        destinations: [endPoint],
        mode: TravelMode.driving,
      },
    });

    return response.data.rows[0].elements[0].distance;
  }

  public async getPriceByDistance({
    startPoint,
    endPoint,
    pricePerKm,
  }: {
    startPoint: string;
    endPoint: string;
    pricePerKm: number;
  }): Promise<number> {
    const distance = await this.getDistance(startPoint, endPoint);
    const km = distance.value / 1000;

    return +(pricePerKm * km).toFixed(2);
  }
}

export { MapService };
