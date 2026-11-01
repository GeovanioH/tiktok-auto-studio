import { Queue, QueueOptions } from "bullmq";
import Redis from "ioredis";
import { env } from "../../config/env";

export interface PublishJobData {
  postId: string;
}

let redisConnection: Redis | undefined;

export function getRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true
    });
  }
  return redisConnection;
}

export const QUEUE_NAME = "tiktok-publish-queue";

export function createPublishQueue(customRedis?: Redis): Queue<PublishJobData> {
  const connection = customRedis || getRedisConnection();
  return new Queue<PublishJobData>(QUEUE_NAME, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 60 * 1000 // 1 minute, puis 5 min, puis 15 min
      },
      removeOnComplete: {
        age: 7 * 24 * 3600 // 7 jours
      },
      removeOnFail: {
        age: 30 * 24 * 3600 // 30 jours
      }
    }
  });
}

export const publishQueue = createPublishQueue();

/**
 * Planifie un job de publication avec idempotence absolue (jobId: post_<id>).
 */
export async function schedulePostJob(postId: string, scheduledAt: Date): Promise<string> {
  const delay = Math.max(0, scheduledAt.getTime() - Date.now());
  const jobId = `post_${postId}`;

  const job = await publishQueue.add(
    "publish_post",
    { postId },
    {
      delay,
      jobId
    }
  );

  return job.id!;
}
