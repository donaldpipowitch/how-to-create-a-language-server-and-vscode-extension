import { connection, documents } from './setup';
import { configureCompletion } from './completion';

configureCompletion(connection, documents);
