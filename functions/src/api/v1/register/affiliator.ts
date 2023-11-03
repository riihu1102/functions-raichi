import {Response} from "express";
import {error, info} from "firebase-functions/logger";
import {onRequest, Request} from "firebase-functions/v2/https";
import {addAffiliator} from "../lib/addAffiliator";
import {getLineId} from "../lib/lineId";
import {getLineLoginIdToken} from "../lib/lineLoginIdToken";
import {encryptSha256} from "../lib/sha256";
import {validateAffiliatorQuery} from "../lib/validateRequestQuery copy";
import {verifyCSRFToken} from "../lib/verifyCSRFToken";
import * as consts from "../attribute/consts";
import {LineIdToken, LineId} from "../attribute/types";

export const affiliator = onRequest(
  {region: "asia-northeast1", maxInstances: 10},
  async (request: Request, response: Response) => {
    try {
      // バリデーション
      const validateResult = validateAffiliatorQuery(
        request.query
      );
      if (!validateResult) {
        error(`ユーザーからの入力値が不正です。\n入力値:\n${request.query}`);
        return;
      }
      const validatedQuery = validateResult as {state: string, code: string};

      // CSRFトークンの検証
      const isCSRFverify = await verifyCSRFToken(validatedQuery.state);

      // ///////ローカル検証時コメントアウト
      if (!isCSRFverify) {
        // error(`CSRF検証エラーです。state:\n${validatedQuery.state}`);
        // return;
      }

      const lineIdTokenResult: LineIdToken | undefined =
        await getLineLoginIdToken({
          grantType: "authorization_code",
          code: validatedQuery.code,
          clientId: consts.AFFILIATOR_LINE_CLIENT_ID,
          clientSecret: consts.AFFILIATOR_LINE_CLIENT_SECRET,
          redirectUri: consts.AFFILIATOR_LINE_CALLBACK_URI,
        });
      if (!lineIdTokenResult) {
        error(
          `LINE IDトークンの取得に失敗しました。
          state:${validatedQuery.state}code:${validatedQuery.code}`
        );
        return;
      }
      const lineIdToken = lineIdTokenResult as LineIdToken;

      // LINE LINE ID取得
      const lineIdResult: LineId | undefined = await getLineId(
        lineIdToken,
        consts.AFFILIATOR_LINE_CLIENT_ID
      );
      if (!lineIdResult) {
        error(`LINE IDの取得に失敗しました。:${lineIdResult}`);
        return;
      }
      const lineId = lineIdResult as LineId;

      // TODO: 余裕があれば
      // アフィリエイターデータ保存(ユーザー認証情報はクライアントで保持しない)
      // アフィリエイトコードはlineidのsha256ハッシュ。漏洩モーマンタイ。
      addAffiliator(lineId, encryptSha256(lineId));

      info(
        `アフィリエイター登録の受付を完了しました。${lineId}`
      );

      response.redirect(`${consts.RESULT_REDIRECT_URL}?ar=true`); // job result
    } catch (e) {
      error("全体エラー", e);
      response.json({result: "エラー"});
    }
  }
);
