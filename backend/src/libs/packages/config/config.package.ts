import convict, { type Config as TConfig } from 'convict';
import { config } from 'dotenv';

import { AppEnvironment } from '~/libs/enums/enums.js';
import { ConfigValidationError } from '~/libs/exceptions/exceptions.js';
import { type ILogger } from '~/libs/packages/logger/logger.js';

import { FormatRegex } from './libs/enums/enums.js';
import { type IConfig } from './libs/interfaces/interfaces.js';
import { type EnvironmentSchema } from './libs/types/types.js';

class Config implements IConfig {
  private logger: ILogger;

  public ENV: EnvironmentSchema;

  public constructor(logger: ILogger) {
    this.logger = logger;

    config();

    this.envSchema.load({});
    this.envSchema.validate({
      allowed: 'strict',
      output: (message) => this.logger.info(message),
    });

    this.ENV = this.envSchema.getProperties();
    this.logger.info('.env file found and successfully parsed!');
  }

  private get envSchema(): TConfig<EnvironmentSchema> {
    convict.addFormat({
      name: 'boolean_string',
      validate: (value: string, schema: convict.SchemaObj) => {
        if (value !== 'true' && value !== 'false') {
          throw new ConfigValidationError({
            message: `Invalid ${schema.env ?? ''} format`,
          });
        }
      },
    });

    convict.addFormat({
      name: 'email',
      validate: (value: string, schema: convict.SchemaObj) => {
        if (!FormatRegex.EMAIL.test(value)) {
          throw new ConfigValidationError({
            message: `Invalid ${schema.env ?? ''} format`,
          });
        }
      },
    });

    return convict<EnvironmentSchema>({
      APP: {
        ENVIRONMENT: {
          doc: 'Application environment',
          format: Object.values(AppEnvironment),
          env: 'NODE_ENV',
          default: null,
        },
        PORT: {
          doc: 'Port for incoming connections',
          format: Number,
          env: 'PORT',
          default: null,
        },
      },
      JWT: {
        SECRET: {
          doc: 'Secret key for token generation',
          format: String,
          env: 'JWT_SECRET',
          default: null,
        },
        ISSUER: {
          doc: 'Issuer of token processing',
          format: String,
          env: 'JWT_ISSUER',
          default: null,
        },
        ACCESS_LIFETIME: {
          doc: 'Jwt key lifetime',
          format: String,
          env: 'JWT_ACCESS_LIFETIME',
          default: '24h',
        },
      },
      DB: {
        CONNECTION_STRING: {
          doc: 'Database connection string',
          format: String,
          env: 'DB_CONNECTION_STRING',
          default: null,
        },
        POOL_MIN: {
          doc: 'Database pool min count',
          format: Number,
          env: 'DB_POOL_MIN',
          default: null,
        },
        POOL_MAX: {
          doc: 'Database pool max count',
          format: Number,
          env: 'DB_POOL_MAX',
          default: null,
        },
      },
      MAILER: {
        SENDGRID_API_KEY: {
          doc: 'Twilio SendGrid API key',
          format: String,
          env: 'SENDGRID_API_KEY',
          default: null,
        },
        SENDGRID_USER: {
          doc: 'Twilio SendGrid SMTP username',
          format: String,
          env: 'SENDGRID_USER',
          default: 'apikey',
        },
        SMTP_TLS: {
          doc: 'Whether SMTP connection uses TLS',
          env: 'SMTP_TLS',
          format: 'boolean_string',
          default: true,
        },
        SENDGRID_SENDER_EMAIL: {
          doc: 'Sendgrid verified sender email',
          env: 'SENDGRID_SENDER_EMAIL',
          format: 'email',
          default: null,
        },
      },
      API: {
        GOOGLE_MAPS_API_KEY: {
          doc: 'Key for Google maps API',
          format: String,
          env: 'VITE_APP_GOOGLE_MAPS_API_KEY',
          default: null,
        },
      },
    });
  }
}

export { Config };
