import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  kafka: Kafka;
  kafkaTopic: string;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID'),
      brokers: [this.configService.get<string>('KAFKA_BROKER')!],
    });
    this.kafkaTopic = this.configService.get<string>('KAFKA_TOPIC')!;
  }

  async onModuleInit() {
    const topic = this.kafkaTopic;
    const admin = this.kafka.admin();
    await admin.connect();

    const existingTopics = await admin.listTopics();
    if (!existingTopics.includes(topic)) {
      await admin.createTopics({
        topics: [
          {
            topic,
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      });
      console.log(`Created Kafka topic: ${topic}`);
    }

    await admin.disconnect();
  }
}
