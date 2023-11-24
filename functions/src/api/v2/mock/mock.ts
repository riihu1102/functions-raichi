import {Response} from "express";
import {onRequest, Request} from "firebase-functions/v2/https";
import {linePushMsg} from "../../v1/lib/linePushMsg";
import {error} from "firebase-functions/logger";

export const mock = onRequest(
  {region: "asia-northeast1", maxInstances: 10, memory: "1GiB"},
  async (request: Request, response: Response) => {
    try {
      const msg3 = {
        type: "text",
        text: "すみませんテスト送信です。",
      };


      await linePushMsg({
        to: "",
        message: [msg3],
        channelSecret: "",
        channelAccessToken: "",
      });
    } catch (e) {
      error(e);
    }
    response.json("送信完了しました。");
  }
);


