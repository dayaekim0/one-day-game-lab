import type { DataSource } from '../contracts';
import { localAuth } from './auth';
import { localPlaceRepository } from './places';
import { localReviewRepository } from './reviews';
import { localTripRepository } from './trips';

export const localDataSource: DataSource = {
  places: localPlaceRepository,
  trips: localTripRepository,
  reviews: localReviewRepository,
  auth: localAuth,
};
