import { Restaurantes } from "../../domain/Restaurantes";
import { KafkaMessage } from "../types/KafkaMessage";

export interface IKafkaHandler {
  run(kafkaMessage: KafkaMessage): Promise<Restaurantes[]>;
}
