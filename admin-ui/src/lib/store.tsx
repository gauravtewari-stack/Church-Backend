import { useReducer, createContext, useContext } from 'react';
import type { ReactNode, StoreState, StoreAction } from './types';
import {
  sermons,
  events,
  categories,
  donationCampaigns,
  spiritualResources,
  hymns,
  radioStations,
  liveStreams,
  mediaFiles,
  users,
} from './mock-data';

const initialState: StoreState = {
  sermons,
  events,
  categories,
  donations: donationCampaigns,
  spiritualResources,
  hymns,
  radioStations,
  liveStreams,
  mediaFiles,
  users,
};

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { module, item } = action.payload;
      const moduleKey = module as keyof StoreState;
      return {
        ...state,
        [moduleKey]: [...(state[moduleKey] as any[]), item],
      };
    }
    case 'UPDATE_ITEM': {
      const { module, id, updates } = action.payload;
      const moduleKey = module as keyof StoreState;
      return {
        ...state,
        [moduleKey]: (state[moduleKey] as any[]).map((item) =>
          item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
        ),
      };
    }
    case 'DELETE_ITEM': {
      const { module, id } = action.payload;
      const moduleKey = module as keyof StoreState;
      return {
        ...state,
        [moduleKey]: (state[moduleKey] as any[]).filter((item) => item.id !== id),
      };
    }
    case 'DUPLICATE_ITEM': {
      const { module, id } = action.payload;
      const moduleKey = module as keyof StoreState;
      const items = state[moduleKey] as any[];
      const itemToDuplicate = items.find((item) => item.id === id);
      if (!itemToDuplicate) return state;
      const duplicated = {
        ...itemToDuplicate,
        id: `${itemToDuplicate.id}-copy-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'draft',
      };
      return {
        ...state,
        [moduleKey]: [...items, duplicated],
      };
    }
    case 'BULK_ACTION': {
      const { module, ids, action: actionType, updates } = action.payload;
      const moduleKey = module as keyof StoreState;
      const items = state[moduleKey] as any[];

      if (actionType === 'DELETE') {
        return {
          ...state,
          [moduleKey]: items.filter((item) => !ids.includes(item.id)),
        };
      }

      if (actionType === 'UPDATE') {
        return {
          ...state,
          [moduleKey]: items.map((item) =>
            ids.includes(item.id)
              ? { ...item, ...updates, updated_at: new Date().toISOString() }
              : item
          ),
        };
      }

      return state;
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: StoreState;
  dispatch: (action: StoreAction) => void;
} | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
