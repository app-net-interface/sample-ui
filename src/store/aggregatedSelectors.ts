import { createSelector } from 'reselect';
import { RootState } from './store';

export const selectVmsByProvider = (state: RootState) => state.infraResources.instances || {};

export const selectAggregatedVms = createSelector(
  [(state: RootState) => state.infraResources.instances || {}],
  (vmsByProvider): any[] => Object.values(vmsByProvider).flat()
);