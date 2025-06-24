import { Injectable } from '@nestjs/common';
import { Partitioners, Producer, ProducerRecord } from 'kafkajs';
import { KafkaService } from 'src/kafka/kafka.service';

@Injectable()
export class KafkaProducerService {
  private readonly producer: Producer;

  constructor(private readonly kafkaService: KafkaService) {
    this.producer = this.kafkaService.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }

  async addMessageIntoQueue(message: string) {
    const record: ProducerRecord = {
      topic: this.kafkaService.kafkaTopic,
      messages: [{ value: message }],
    };
    await this.producer.send(record);
  }
}
