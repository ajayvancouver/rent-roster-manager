
import { documentQueries } from './documentQueries';
import { documentMutations } from './documentMutations';

export const documentsService = {
  ...documentQueries,
  ...documentMutations
};
