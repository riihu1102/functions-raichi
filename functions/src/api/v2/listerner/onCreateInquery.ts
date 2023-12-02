import {error, info} from "firebase-functions/logger";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {getJobData} from "../../v1/lib/jobInfo";
import {linePushMsg} from "../../v1/lib/linePushMsg";


type InquiryData = {
  jobId?: string;
  affiliatorId: string;
  lineProfile: {
    name: string
    picture: string
    sub: string
  }
};

/* 女の子が登録した後に送るLINE処理 */
export const onCreateInquery = onDocumentCreated(
  {
    document: "submit_histries/{id}",
    region: "asia-northeast1",
    maxInstances: 10,
  },
  async (event) => {
    info("問い合わせDBリスナー作動");
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data() as InquiryData;
    const jobData = await getJobData(data.jobId ?? "");
    if (!jobData) {
      error("ジョブデータがありません jobid:" + data.jobId);
      return;
    }
    info(jobData.job.lineFlexMsgCard);
    const msg2 = {
      type: "text",
      text: `
この度はライチ求人の案件にご応募いただき誠にありがとうございます✨
案件詳細をご確認いただいた上、撮影希望日を第三希望までお送りください🙇‍♂️
また何か気になる点やご質問などありましたらぜひお気軽にご相談ください🤲
`,
    };

    info(msg2, data.lineProfile.sub);

    await linePushMsg({
      to: data.lineProfile.sub,
      message: [msg2],
      channelSecret: process.env.JOBSEEKER_LINE_LOGIN_CLIENT_SECRET ?? "",
      channelAccessToken:
        process.env.JOBSEEKER_MESSAGING_API_ACCESS_TOKEN ?? "",
    });

    info("LINE送信を完了しました. line name:" + data.lineProfile.name);
  }
);
