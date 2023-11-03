import {getFirestore} from "firebase-admin/firestore";
import {error} from "firebase-functions/logger";

export type JobInfo = {
  lineCard: string
}
export const getJobData = async (jobId: string)
    : Promise<JobInfo | undefined> => {
  const doc = await getFirestore().collection("jobs").doc(jobId).get();
  if (!doc.exists) {
    error("ジョブデータがありません");
    return;
  }
  const data = doc.data() as JobInfo;
  return data;
};


