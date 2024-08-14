import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedResourcesState {
    selectedAccountId: string;
    selectedRegion: string;
    selectedProvider: string;
    selectedVpc: string;
}

const initialState: SelectedResourcesState = {
    selectedAccountId: '',
    selectedRegion: '',
    selectedProvider: '',
    selectedVpc: ''
};

export const selectedResourcesSlice = createSlice({
    name: 'selectedResources',
    initialState,
    reducers: {
        setSelectedProvider: (state, action: PayloadAction<string>) => {
            state.selectedProvider = action.payload;
        },
        setSelectedAccountId: (state, action: PayloadAction<string>) => {
            state.selectedAccountId = action.payload;
        },
        setSelectedRegion: (state, action: PayloadAction<string>) => {
            state.selectedRegion = action.payload;
        },
        setSelectedVpc: (state, action: PayloadAction<string>) => {
            state.selectedVpc = action.payload;
        }
    },
});

export const { setSelectedAccountId, setSelectedRegion, setSelectedProvider, setSelectedVpc } = selectedResourcesSlice.actions;

export default selectedResourcesSlice.reducer;