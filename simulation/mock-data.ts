import { Location } from '../shared/types';

export const generateLocation = (baseLat: number, baseLon: number): Location => {
    return {
        lat: baseLat + (Math.random() - 0.5) * 0.1,
        lon: baseLon + (Math.random() - 0.5) * 0.1,
    };
};

export const generateSpeed = (): number => Math.floor(Math.random() * 120);

export const generateBatteryStatus = (): number => Math.floor(Math.random() * 100);
