
export type MediaItem = {
  url: string;
  title: string;
  body: string;
  source?: string; // for image
  pic?: string;

  // audio specific properties
  date?: string;
  genre?: string;
  artist?: string;
  lyrics?: string;
};
