import {factory, Logger} from '@hopin/logger';

export const logger: Logger = factory.getLogger('hoping-markdown', {
  prefix: '@hopin/markdown',
});