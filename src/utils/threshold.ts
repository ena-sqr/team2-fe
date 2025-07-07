export type DistanceMetric = "cosine" | "euclidean" | "euclidean_l2";

export type ModelThresholds = {
  [metric in DistanceMetric]?: number;
} & {
  description: string;
};

export type ModelsConfig = {
  distance_metrics: DistanceMetric[];
  models: {
    [modelName: string]: ModelThresholds;
  };
  recommended_distance_metric: DistanceMetric;
  recommended_model: string;
  success: boolean;
};

export const getThresholdForModel = (
  config: ModelsConfig,
  model: string,
  metric: DistanceMetric
): number | null => config?.models?.[model]?.[metric] ?? null;
