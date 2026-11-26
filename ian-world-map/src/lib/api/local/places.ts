import placesJson from '@data/places.json';
import regionsJson from '@data/regions.json';
import { filterPlaces } from '../../filters';
import type { Place, PlaceSubmission, Region } from '../../types';
import type { PlaceRepository } from '../contracts';
import { localAuth } from './auth';
import { newId, readJSON, writeJSON } from './storage';

const places = placesJson as Place[];
const regions = (regionsJson as Region[]).slice().sort((a, b) => a.order - b.order);

const SUBMISSIONS_KEY = 'submissions:v1';

export const localPlaceRepository: PlaceRepository = {
  async listPlaces(filter) {
    return filterPlaces(places, filter);
  },

  async getPlace(id) {
    return places.find((p) => p.id === id) ?? null;
  },

  async listRegions() {
    return regions;
  },

  async getRegion(id) {
    return regions.find((r) => r.id === id) ?? null;
  },

  async submitPlace(input) {
    const user = await localAuth.getCurrentUser();
    const submission: PlaceSubmission = {
      ...input,
      id: newId(),
      submitterId: user?.id ?? null,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const all = readJSON<PlaceSubmission[]>(SUBMISSIONS_KEY, []);
    writeJSON(SUBMISSIONS_KEY, [submission, ...all]);
    return submission;
  },
};
