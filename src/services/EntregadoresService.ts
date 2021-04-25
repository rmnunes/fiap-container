import EntregadoresMock from "../domain/mock/EntregadoresMock";
import { Entregadores } from "../domain/Entregadores";

class EntregadoresService {
  constructor() {}

  async findEntregadores(latLong: string): Promise<Entregadores[]> {
    return EntregadoresMock.filter((x) => x.latLong === latLong);
  }

  async matchEntregadores(latLongCliente: string, latLongRestaurante: string): Promise<boolean> {
    let valid = EntregadoresMock.find((x) => x.latLong === latLongCliente);
    if (valid) {
      let valid2 = EntregadoresMock.find((x) => x.latLong === latLongRestaurante);
      if (valid2) {
        return true;
      } else return false;
    }
  }
}
export default EntregadoresService;
