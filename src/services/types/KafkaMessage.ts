import { Restaurantes } from "../../domain/Restaurantes";
export type KafkaMessage = {
  clientId: string;
  latLong: string;
};

export type KafkaMessageResponse = {
  restaurantes: Restaurantes[];
};
