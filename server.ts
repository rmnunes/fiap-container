import KafkaService from "./src/services/KafkaService";
import KafkaHandler from "./src/services/KafkaHandler";

require("dotenv").config();

const eventHubBroker = process.env.EVENT_HUB_BROKER || "";
const eventHubConnectionString = process.env.EVENT_HUB_CONNECTION_STRING || "";
const eventHubTopicReadName = process.env.EVENT_HUB_TOPIC_READ || "";
const eventHubTopicWriteName = process.env.EVENT_HUB_TOPIC_WRITE || "";
const eventHubConsumerGroup = process.env.EVENT_HUB_CONSUMER_GROUP_NAME || "";
const fromBeginning: boolean =
  process.env.EVENT_HUB_AUTO_OFFSET_RESET === "earliest" ? true : false;

let kafkaService: KafkaService;
let kafkaHandler: KafkaHandler;

export async function main() {
  console.log(`Execution has started. ${new Date()}`);

  kafkaHandler = new KafkaHandler();

  kafkaService = new KafkaService(
    eventHubBroker,
    eventHubConnectionString,
    eventHubConsumerGroup,
    eventHubTopicReadName,
    eventHubTopicWriteName,
    fromBeginning
  );

  await kafkaService.run(kafkaHandler).catch(async (e) => {
    console.error(`[${eventHubTopicReadName}/${eventHubConsumerGroup}] ${e.message}`, e);
  });
}

main().catch((error) => {
  console.error("Error running:", error);
});
