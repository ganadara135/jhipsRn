import dayjs from 'dayjs';
import { IPhoto } from 'app/shared/model/photo.model';

export interface IPhotoProcessed {
  id?: number;
  title?: string | null;
  description?: string | null;
  created?: string | null;
  photo?: IPhoto | null;
}

export const defaultValue: Readonly<IPhotoProcessed> = {};
