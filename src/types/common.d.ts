export type RootSearchParams = {
  m: string; // modal
  lang: string;
  token: string;
};

export type ExpoLayoutType = 'audio' | 'video' | 'image' | 'literature';
export type LayoutType = 'article' | ExpoLayoutType;
export type FollowsFilter = 'all' | 'authors' | 'topics' | 'communities';
export type SortFunction<T> = (a: T, b: T) => number
export type FilterFunction<T> = (a: T) => boolean
