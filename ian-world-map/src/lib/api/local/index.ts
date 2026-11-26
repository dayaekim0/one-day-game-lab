import type { DataSource } from '../contracts';
import { localAuth } from './auth';
import { localPlaceRepository } from './places';
import { localReviewRepository } from './reviews';

export const localDataSource: DataSource = {
  places: localPlaceRepository,
  reviews: localReviewRepository,
  auth: localAuth,
};
