import { Kafka, Consumer, logLevel, Producer } from "kafkajs";
import { IKafkaHandler } from "./interfaces/IKafkaHandler";
import { KafkaMessage, KafkaMessageResponse } from "./types/KafkaMessage";
import { v4 as uuidv4 } from "uuid";

const ip = require('ip')
const host = process.env.HOST_IP || ip.address()

class KafkaService {
  private kafka: Kafka;
  private topicRead: string;
  private topicWrite: string;
  private consumer: Consumer;
  private producer: Producer;
  private groupId: string;
  private fromBeginning: boolean;
  private resetOnce: boolean;
  private readonly errorTypes: String[] = ["unhandledRejection", "uncaughtException"];
  private readonly signalTraps: String[] = ["SIGTERM", "SIGINT", "SIGUSR2"];

  constructor(
    broker: string,
    endpoint: string,
    groupId: string,
    topicRead: string,
    topicWrite: string,
    fromBeginning: boolean
  ) {
    this.kafka = new Kafka({
      clientId: "worker",
      brokers: [`${host}:9092`],
      // ssl: true,
      // sasl: {
      //   mechanism: "plain", // scram-sha-256 or scram-sha-512
      //   username: "$ConnectionString",
      //   password: endpoint,
      // },
      retry: {
        initialRetryTime: 100,
        retries: 5,
      },
      logLevel: logLevel.INFO,
    });
    this.topicRead = topicRead;
    this.topicWrite = topicWrite;
    this.groupId = groupId;
    this.producer = this.kafka.producer();
    this.fromBeginning = fromBeginning;
    if (fromBeginning) {
      this.resetOnce = true;
    }
  }

  async run(service: IKafkaHandler): Promise<void> {
    this.consumer = this.kafka.consumer({
      groupId: this.groupId,
      retry: { initialRetryTime: 100, retries: 5 },
    });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topicRead, fromBeginning: true });

    await this.consumer.run({
      autoCommit: false,
      eachBatch: async ({ batch, commitOffsetsIfNecessary, heartbeat, isRunning, isStale }) => {
        for (let message of batch.messages) {
          if (!isRunning() || isStale()) {
            console.log("breaking");
            break;
          }

          console.log({
            topic: batch.topic,
            partition: batch.partition,
            highWatermark: batch.highWatermark,
            message: {
              offset: message.offset,
            },
          });

          const parsed: KafkaMessage[] = JSON.parse(message.value?.toString());

          let list = await service.run(parsed[0]);
          await this.Send({ restaurantes: list });

          commitOffsetsIfNecessary({
            topics: [
              {
                topic: this.topicRead,
                partitions: [{ offset: message.offset, partition: batch.partition }],
              },
            ],
          });

          await heartbeat();
        }
      },
    });

    //reset
    if (this.resetOnce) {
      const partitions = [0, 1];

      partitions.forEach((partition) => {
        this.consumer.seek({ topic: this.topicRead, offset: "-1", partition });
      });

      this.resetOnce = false;
    }

    this.errorTypes.map((type: any) => {
      process.on(type, async (e) => {
        try {
          console.log(`process.on ${type}`);
          console.error(e);
          await this.consumer.disconnect();
          process.exit(0);
        } catch (_) {
          process.exit(1);
        }
      });
    });

    this.signalTraps.map((type: any) => {
      process.once(type, async () => {
        try {
          await this.consumer.disconnect();
        } finally {
          process.kill(process.pid, type);
        }
      });
    });
  }

  async Send(message: KafkaMessageResponse): Promise<boolean> {
    try {
      await this.producer.connect();
      await this.producer.send({
        topic: this.topicWrite,
        messages: [{ key: uuidv4(), value: JSON.stringify(message) }],
      });
      console.log(`Event sent to topic: ${this.topicWrite}`);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default KafkaService;
