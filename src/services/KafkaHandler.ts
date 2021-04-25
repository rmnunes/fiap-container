import { IKafkaHandler } from "./interfaces/IKafkaHandler";
import { KafkaMessage } from "./types/KafkaMessage";
import { Cliente } from "../domain/Cliente";
import EngineService from "./EngineService";
import { Restaurantes } from "../domain/Restaurantes";

export default class KafkaHandler implements IKafkaHandler {
  private engineService: EngineService;
  constructor() {
    this.engineService = new EngineService();
  }

  async run(kafkaMessage: KafkaMessage): Promise<Restaurantes[]> {
    //parsing messasge
    const cliente: Cliente = {
      id: kafkaMessage.clientId,
      latLong: kafkaMessage.latLong,
    };
    try {
      return await this.engineService.find(cliente);
    } catch (error) {
      console.log(error);
    }
  }
}
