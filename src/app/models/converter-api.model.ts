import type { components } from '../generated/3dime-api';

type ApiSchemas = components['schemas'];

export type ConversionRequest = ApiSchemas['ConverterRequest'];
export type ConversionResponse = ApiSchemas['ConverterResponse'];
export type QuotaStatus = ApiSchemas['Quota'];
export type QuotaStatusResponse = ApiSchemas['QuotaStatusResponse'];
export type PlanInfo = ApiSchemas['PlanInfo'];

/** UI preparation metadata; only the ImageFile fields are serialized by the API client. */
export type FileData = ApiSchemas['ImageFile'] & {
  dataUrl: string;
  name: string;
  type: string;
};
