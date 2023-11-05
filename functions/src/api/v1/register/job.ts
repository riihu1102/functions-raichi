import { Response } from "express";
import { onRequest, Request } from "firebase-functions/v2/https";

// type Job = {
//     job: {
//         /* 案件ID */
//         jobId: string,
//         /* 案件見出し */
//         title: string,
//         /* サブタイトル */
//         subtitle: string,
//         /* 案件イメージ画像 */
//         imageUrl: string,
//         /* LINE Flex MessageのJSON文字列 */
//         lineFlexMsgCard: string,
//         /* フォーマット */
//         format: string,

//         /* 仕事条件・内容等 */
//         info: {
//             /* 撮影場所 */
//             shootingLocation: string,
//             /* 拘束時間 */
//             totalHours: string,
//             /* スキン(S着・外出し可など) */
//             skin: string,
//             /* 報酬受け渡しのタイミング */
//             paymentTiming: string,
//             /* 撮影内容 */
//             shootingScenes: string[],
//         }
//     },
// }

export const job = onRequest(
  { region: "asia-northeast1", maxInstances: 10 },
  async (request: Request, response: Response) => {
    response.json("job追加OK");
  }
);
