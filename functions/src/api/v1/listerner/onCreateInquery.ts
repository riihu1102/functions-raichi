import {error} from "firebase-functions/logger";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {HistoryData} from "../attribute/types";
import {JobInfo, getJobData} from "../lib/jobInfo";
import {linePushMsg} from "../lib/linePushMsg";
import * as consts from "../attribute/consts";

/* 女の子が登録した後に送るLINE処理 */
export const onCreateInquery = onDocumentCreated(
  {
    document: "submit_histries/{id}",
    region: "asia-northeast1",
    maxInstances: 10,
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data() as HistoryData;
    const jobDataResult: JobInfo | undefined = await getJobData(data.jobId);
    if (!jobDataResult) {
      error("ジョブデータが存在しません");
      return;
    }

    const jobInfo = jobDataResult as JobInfo;
    const msg1 = JSON.parse(jobInfo.lineCard);
    const msg2 = {
      type: "text",
      text: `この度はライチ求人の案件にご応募いただき誠にありがとうございます！
      こちらお問い合わせいただいた案件詳細になりますので、
      内容をご確認の上、撮影希望日を第三希望までお送りください🙇‍♂️
      \n案件について気になる点やご質問など、お気軽にご連絡ください✨
    `,
    };

    await linePushMsg({
      to: data.lineId,
      message: [msg1, msg2],
      channelSecret: consts.JOB_SEEKER_LINE_CLIENT_SECRET,
      channelAccessToken: consts.JOB_SEEKER_LINE_ACCESS_TOKEN,
    });
  }
);


