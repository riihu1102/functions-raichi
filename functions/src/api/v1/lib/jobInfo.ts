import { getFirestore } from "firebase-admin/firestore";
import { error } from "firebase-functions/logger";
import { Job } from "../register/job";

export const getJobData = async (jobId: string): Promise<Job | undefined> => {
  const doc = await getFirestore().collection("jobs").doc(jobId).get();
  if (!doc.exists) {
    error("ジョブデータがありません");
    return undefined;
  }
  const data = doc.data();
  return data as Job;
};
