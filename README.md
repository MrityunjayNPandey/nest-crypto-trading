# Nest Crypto Trading Application

## Description

This project is a NestJS-based cryptocurrency trading application backend. It is designed to handle order processing, manage user balances, and integrate with Kafka for asynchronous communication, simulating a limited real-world trading system. The application leverages TypeORM for database interactions and follows a modular architecture for scalability and maintainability.

## Project Architecture

The application is structured into several modules, each responsible for a specific domain:

- **Orders Module**: Manages trading orders, including creation, status updates, and retrieval.
- **Balances Module**: Handles user account balances.
- **Orders/Order Processor Module**: Contains the core logic for processing trading orders, interacting with external services or internal Kafka queues.
- **Kafka Integration**: Utilizes Kafka for asynchronous messaging, specifically for order processing, ensuring high throughput and decoupling of services.
- **Helpers**: Contains utility functions and transformers, such as `DecimalTransformer` for handling precise decimal values in the database.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **TypeORM**: An ORM that can run in NodeJS, Browser, Cordova, PhoneGap, Ionic, React Native, NativeScript, Expo, and Electron platforms and can be used with TypeScript and JavaScript (ES5, ES6, ES7, ES8).
- **Kafka**: A distributed streaming platform used for building real-time data pipelines and streaming applications.
- **Decimal.js**: A JavaScript library for arbitrary-precision decimal arithmetic.

## Project Setup

To set up and run the project locally, follow these steps:

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd nest-crypto-trading
    ```

2.  **Install dependencies**:
    This project uses `pnpm` as its package manager.

    ```bash
    pnpm install
    ```

3.  **Environment Configuration**:
    Create a `.env` file in the project root directory based on the provided `.env.sample`.

    ```bash
    cp .env.sample .env
    ```

    Update the `.env` file with your specific database and Kafka configurations:

    ```
    DB_HOST=127.0.0.1
    DB_PORT=1433
    DB_USERNAME=SA
    DB_PASSWORD=reallyStrongPwd123
    DB_DATABASE=CryptoTradingDB

    KAFKA_BROKER=127.0.0.1:9092
    KAFKA_CLIENT_ID=crypto-trading-app
    KAFKA_TOPIC=orders
    ```

    Ensure your database MsSQL and Kafka broker are running and accessible.

4.  **Ingest dummy data**:
    ```
    INSERT INTO balances (user_id, currency_symbol, balance) VALUES
    (1, 'BTC', 10.0),
    (1, 'ETH', 50.0),
    (2, 'BTC', 5.5),
    (3, 'ETH', 100.0);
    ```

## Compile and Run the Project

- **Development Mode**:

  ```bash
  pnpm run start:dev
  ```

  This will start the application in watch mode, recompiling and restarting on file changes.

- **Production Mode**:
  ```bash
  pnpm run start:prod
  ```
  This will compile the application for production and start it.

## API Endpoints

- `POST /orders`: Create a new trading order.

## Deployment

For deployment, refer to the official NestJS deployment documentation and consider using tools like NestJS Mau for AWS deployments.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
