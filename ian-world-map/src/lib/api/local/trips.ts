import { filterTrips } from '../../trips';
import type { PlaceVisit } from '../../types';
import type { TripRepository } from '../contracts';
import { TRIP_BUNDLES } from './trips-registry';

const bundles = TRIP_BUNDLES.slice().sort((a, b) => b.trip.startDate.localeCompare(a.trip.startDate));

export const localTripRepository: TripRepository = {
  async listTripBundles(filter) {
    const ids = new Set(filterTrips(bundles, filter).map((b) => b.trip.id));
    return bundles.filter((b) => ids.has(b.trip.id));
  },

  async getTripBundle(id) {
    return bundles.find((b) => b.trip.id === id) ?? null;
  },

  async listPlaceVisits() {
    const visits: Record<string, PlaceVisit[]> = {};
    for (const { trip, itinerary } of bundles) {
      const ages = trip.party.children.map((c) => c.ageMonths);
      for (const day of itinerary) {
        for (const item of day.items) {
          if (!item.placeId) continue;
          const list = (visits[item.placeId] ??= []);
          if (!list.some((v) => v.tripId === trip.id && v.date === day.date)) {
            list.push({ tripId: trip.id, date: day.date, childAgesMonths: ages });
          }
        }
      }
    }
    return visits;
  },
};
