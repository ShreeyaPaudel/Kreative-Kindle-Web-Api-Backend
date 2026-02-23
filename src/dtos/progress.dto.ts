// ── DTOs for Progress & Favourites ───────────────────────────────

export interface CompleteActivityDto {
  activityId:    number;
  activityTitle: string;
  category:      string;
}

export interface SaveFavouriteDto {
  activityId:    number;
  activityTitle: string;
  category:      string;
  age:           string;
  image:         string;
}