export type RootSearchParams = {
  m: string; // modal
  lang: string;
  token: string;
};

export type LayoutType = 'article' | 'audio' | 'video' | 'image' | 'literature';
export type FollowsFilter = 'all' | 'authors' | 'topics' | 'communities';
export type SortFunction<T> = (a: T, b: T) => number
export type FilterFunction<T> = (a: T) => boolean
