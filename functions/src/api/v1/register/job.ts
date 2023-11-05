import { Response } from "express";
import { onRequest, Request } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { error } from "firebase-functions/logger";

type Job = {
  job: {
    /* 案件見出し */
    title: string;
    /* サブタイトル */
    subtitle: string;
    /* 案件イメージ画像 */
    imageUrl: string;
    /* LINE Flex MessageのJSON文字列 */
    lineFlexMsgCard: string;
    /* フォーマット */
    format: string;

    /* 仕事条件・内容等 */
    info: {
      /* 撮影場所 */
      shootingLocation: string;
      /* 拘束時間 */
      totalHours: string;
      /* スキン(S着・外出し可など) */
      skin: string;
      /* 報酬受け渡しのタイミング */
      paymentTiming: string;
      /* 撮影内容 */
      shootingScenes: string[];
      /* 案件説明文・ライティング文章 */
      desctiptionContents: string[];
    };
  };
};

const _TEST_DATA_: Job = {
  job: {
    title: "テスト案件2",
    subtitle: "テスト用サブタイトル2",
    imageUrl: "https://example.com/image.jpg222",
    lineFlexMsgCard:
      '{"type":"flex","altText":"Test Card","contents":{"type":"bubble","body":{"type":"box","layout":"vertical","contents":[{"type":"text","text":"Test Card","weight":"bold","size":"xl"}]}}}',
    format: "JPEG",
    info: {
      shootingLocation: "テスト撮影場所",
      totalHours: "4時間",
      skin: "S着可",
      paymentTiming: "撮影後",
      shootingScenes: ["デート風の外撮り1時間", "絡み×2回"],
      desctiptionContents: ["説明文1", "説明文2"],
    },
  },
};

export const job = onRequest(
  { region: "asia-northeast1", maxInstances: 10 },
  async (request: Request, response: Response) => {
    // const job = request.body as Job;
    await add();
    response.json("test");
  }
);

// TODO: 構造体で型チェックしたいけどこれ以前変えるのめんどいからとりあえずこのまま。
export const add = async () => {
  try {
    // 応募データ保存(ユーザー認証情報はクライアントで保持しない)
    // TODO: 余裕があれば
    await getFirestore().collection("jobs").add(_TEST_DATA_);
  } catch (e) {
    error("job data add error.");
    throw new Error("jobdata add エラー");
  }
};
