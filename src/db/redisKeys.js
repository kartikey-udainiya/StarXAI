export const redisKeys = {
  listJobs: (userId) => `user:${userId}:jobs`,
  JobById: (userId, jobId) => `user:${userId}:job:${jobId}`,
};

export const CACHE_TTL = {
  JOB_LIST: 60,
  JOB_DETAILS: 60,
};