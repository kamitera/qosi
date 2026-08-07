import { getStore } from '@netlify/blobs';

export const configStore = () => getStore('config');
export const submissionsStore = () => getStore('submissions');
export const brochuresStore = () => getStore('brochures');
