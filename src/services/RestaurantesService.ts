import RestaurantesMock from "../domain/mock/RestaurantesMock";

import { Restaurantes } from "../domain/Restaurantes";

class RestaurantesService {
  constructor() {}

  async findRestaurantes(latLong: string): Promise<Restaurantes[]> {
    return RestaurantesMock.filter((x) => x.latLong === latLong);
  }
}
export default RestaurantesService;
