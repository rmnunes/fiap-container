import { Cliente } from "../domain/Cliente";

import LocationService from "./LocationService";
import RestaurantesService from "./RestaurantesService";
import EntregadoresService from "./EntregadoresService";
import { Restaurantes } from "../domain/Restaurantes";

class EngineService {
  private locationService: LocationService;
  private restaurantesService: RestaurantesService;
  private entregadoresService: EntregadoresService;

  constructor() {
    this.locationService = new LocationService();
    this.restaurantesService = new RestaurantesService();
    this.entregadoresService = new EntregadoresService();
  }

  async find(cliente: Cliente): Promise<Restaurantes[]> {
    const valid = await this.locationService.validateLocation(cliente.latLong);

    if (valid) {
      let restaurantesList = await this.restaurantesService.findRestaurantes(cliente.latLong);
      let finalList: Restaurantes[] = [];
      for (var item of restaurantesList) {
        let found = await this.entregadoresService.matchEntregadores(cliente.latLong, item.latLong);
        if (found) {
          finalList.push(item);
        }
      }
      return finalList;
    }
  }
}

export default EngineService;
