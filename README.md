# Nest Crypto Trading Application

## Description

This project is a NestJS-based cryptocurrency trading application backend. It is designed to handle order processing, manage user balances, and integrate with Kafka for asynchronous communication, simulating a limited real-world trading system. The application leverages TypeORM for database interactions and follows a modular architecture for scalability and maintainability.

## Project Architecture

The application is structured into several modules, each responsible for a specific domain:

-   **Orders Module**: Manages trading orders, including creation, status updates, and retrieval.
-   **Balances Module**: Handles user account balances and currency management.
-   **Order Processor Module**: Contains the core logic for processing trading orders, potentially interacting with external services or internal Kafka queues.
-   **Kafka Integration**: Utilizes Kafka for asynchronous messaging, specifically for order processing, ensuring high throughput and decoupling of services.
-   **Helpers**: Contains utility functions and transformers, such as `DecimalTransformer` for handling precise decimal values in the database.

## Technologies Used

-   **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
-   **TypeORM**: An ORM that can run in NodeJS, Browser, Cordova, PhoneGap, Ionic, React Native, NativeScript, Expo, and Electron platforms and can be used with TypeScript and JavaScript (ES5, ES6, ES7, ES8).
-   **Kafka**: A distributed streaming platform used for building real-time data pipelines and streaming applications.
-   **Decimal.js**: A JavaScript library for arbitrary-precision decimal arithmetic.

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
    KAFKA_TOPIC_ORDERS=orders
    ```
    Ensure your database (e.g., SQL Server, PostgreSQL, MySQL as configured in TypeORM) and Kafka broker are running and accessible.

4.  **Database Migrations (if applicable)**:
    If you have TypeORM migrations, run them to set up your database schema:
    ```bash
    # Example: pnpm run typeorm migration:run
    ```
    (Note: Specific migration commands might vary based on your `package.json` scripts and TypeORM setup.)

## Compile and Run the Project

-   **Development Mode**:
    ```bash
    pnpm run start:dev
    ```
    This will start the application in watch mode, recompiling and restarting on file changes.

-   **Production Mode**:
    ```bash
    pnpm run start:prod
    ```
    This will compile the application for production and start it.

## API Endpoints (Example)

Once the application is running, you can interact with its API. Here are some example endpoints you might find:

-   `POST /orders`: Create a new trading order.
-   `GET /orders/:id`: Retrieve details of a specific order.
-   `GET /balances/:userId`: Get the balance for a specific user.

(Note: Please refer to the specific controllers and DTOs in the `src/orders` and `src/balances` modules for exact endpoint paths and request/response structures.)

## Run Tests

-   **Unit Tests**:
    ```bash
    pnpm run test
    ```

-   **End-to-End Tests**:
    ```bash
    pnpm run test:e2e
    ```

-   **Test Coverage**:
    ```bash
    pnpm run test:cov
    ```

## Deployment

For deployment, refer to the official NestJS deployment documentation and consider using tools like NestJS Mau for AWS deployments.

## Potential Improvements and Future Work

As a senior NestJS engineer, here are some areas for potential improvements:

-   **Error Handling**: Implement more robust and centralized error handling, possibly using NestJS exception filters.
-   **Logging**: Integrate a more advanced logging solution (e.g., Winston, Pino) with structured logging and appropriate log levels.
-   **Monitoring**: Add health checks, metrics (e.g., Prometheus), and tracing (e.g., OpenTelemetry) for better observability.
-   **Security**: Enhance security measures, including input validation (using class-validator), authentication (JWT, OAuth), and authorization.
-   **Performance Optimization**: Profile the application to identify bottlenecks and optimize critical paths, especially in order processing.
-   **Scalability**: Explore horizontal scaling strategies for Kafka consumers and NestJS instances.
-   **Documentation**: Generate API documentation using Swagger/OpenAPI.
-   **Testing**: Expand test coverage, especially for edge cases and integration points with Kafka and the database.
-   **Configuration Management**: Utilize a more sophisticated configuration management solution for different environments.
-   **Domain Events**: Further leverage domain events for complex business logic and inter-service communication.

## Resources

-   Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
-   For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
-   To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
-   Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
-   Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
-   Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
-   To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
-   Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

-   Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
-   Website - [https://nestjs.com](https://nestjs.com/)
-   Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
