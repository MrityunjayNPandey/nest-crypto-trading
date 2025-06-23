import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Partitioners, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class KafkaProducerService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID'),
      brokers: [this.configService.get<string>('KAFKA_BROKER')!],
    });
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
  }

  async onModuleInit() {
    const topic = this.configService.get<string>('KAFKA_TOPIC_ORDERS')!;
    const admin = this.kafka.admin();
    await admin.connect();

    const existingTopics = await admin.listTopics();
    if (!existingTopics.includes(topic)) {
      await admin.createTopics({
        topics: [
          {
            topic,
            numPartitions: 1, // adjust as needed
            replicationFactor: 1,
          },
        ],
      });
      console.log(`Created Kafka topic: ${topic}`);
    }

    await admin.disconnect();
    await this.producer.connect();
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }

  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }
}
