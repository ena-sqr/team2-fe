export const distanceMetricDescriptions: Record<string, string> = {
  cosine:
    "Measures the angle between face vectors. Lower values mean higher similarity. Commonly used in deep learning.",
  euclidean:
    "Calculates straight-line distance between facial features. Sensitive to scale and alignment.",
  euclidean_l2:
    "A normalized version of Euclidean distance. Reduces the effect of face size or brightness."
};