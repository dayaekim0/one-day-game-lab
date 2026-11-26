/**
 * 앱 전체의 데이터 진입점. UI는 여기서 export한 것만 사용합니다.
 *   import { api } from '@/lib/api';
 *   const places = await api.places.listPlaces({ regionId: 'sapporo' });
 */
import type { DataSource } from './contracts';
import { localDataSource } from './local';
import { createSupabaseDataSource } from './supabase';

function selectDataSource(): DataSource {
  switch (process.env.NEXT_PUBLIC_DATA_SOURCE) {
    case 'supabase':
      return createSupabaseDataSource();
    case 'local':
    default:
      return localDataSource;
  }
}

export const api: DataSource = selectDataSource();
export * from './contracts';
