import {error, info} from "firebase-functions/logger";
import {Strategy} from "./base/Strategy";
import {verifyCSRFToken} from "../comm/verifyCSRFToken";
import * as c from "../consts";
import {suffixWith} from "../comm/tmpl";
import {generateRedirectUrl} from "../comm/generateRedirectUrl ";
import {LineProfile} from "../comm/line-login-api/verifyLineToken";
import {getLineProfile} from "../comm/line-login-api/getLineProfile";
import {addInqueryMistress} from "../comm/repository/addInqueryMistress";

/**
 * LINEログインAPIのクエリパラメータ型定義。
 */
type QueryParams = {
  type: string;
  code: string;
  state: string;
  jobId: string;
  affiliatorId: string;
};

/**
 * ActressStrategyは、Strategyインターフェースを実装するクラスです。
 * LINEログインAPIを使用してユーザー認証プロセスを処理します。
 */
export class ActressStrategy implements Strategy {
  private code = "";
  private state = "";
  private jobId = "";
  private affiliatorId = "";
  private type = "";
  private profile: LineProfile = {
    iss: "",
    sub: "",
    aud: "",
    exp: 0,
    iat: 0,
    nonce: "",
    amr: [],
    name: "",
    picture: "",
  };
  private clientId = c.STAGING_LINE_CLIENT_ID1;
  private clientSecret = c.STAGING_LINE_CLIENT_SECRET1;

  /**
   * クエリパラメータを検証し、必要な情報をクラスプロパティに格納します。
   *
   * @param {QueryParams} {type, code, state, jobId, affiliatorId}
   *  - 検証するクエリパラメータ。
   * @throws {Error} 必須パラメータが不足している場合にエラーを投げます。
   */
  validate({type, code, state, jobId, affiliatorId}: QueryParams): void {
    const msg = suffixWith(`[クエリパラメータ] type: ${type} code:${code}
       state:${state} jobId:${jobId} affiliatorId:${affiliatorId}`);

    info(msg("[バリデーション開始]"));

    const isVerify = type && code && state && jobId && affiliatorId;
    if (!isVerify) {
      error(msg("バリデーション開始"));
      throw new Error(msg("バリデーションエラー"));
    }

    this.type = type;
    this.code = code;
    this.state = state;
    this.jobId = jobId;
    this.affiliatorId = affiliatorId;

    info(msg("[バリデーション 正常終了]"));
    return;
  }

  /**
   * CSRFトークンの検証を行うセキュリティチェックを実行します。
   *
   * @throws {Error} CSRFトークンの検証に失敗した場合にエラーを投げます。
   */
  async securityCheck(): Promise<void> {
    const msg = suffixWith(`[state]: ${this.state}`);
    info(msg("[CSRFトークン認証開始]"));

    try {
      await verifyCSRFToken(this.state);
      info(msg("[SCRFトークン認証 正常終了]"));
      return;
    } catch (e: unknown) {
      error(msg("SCRFのトークン認証に失敗しました}"), e);
      return;
    }
  }


  /**
   * LINEログインAPIを使用してLINEプロフィールを取得します。
   * redirectUriには、LINEログイン後にリダイレクトされるURLが設定されます。
   *
   * @throws {Error} LINEプロフィールの取得に失敗した場合にエラーを投げます。
   */
  async lineProfile(): Promise<void> {
    info("[LINE PROFILE取得処理開始]");
    const redirectUri = generateRedirectUrl({
      base: c.LINE_WEBHOOK_REDIRECT_URL,
      params: {
        jobId: this.jobId,
        affiliatorId: this.affiliatorId,
        type: this.type,
      },
    });
    info("リダイレクトURL: " + redirectUri);

    info(`LINE LOGIN API呼び出し clientId: ${this.clientId} 
    clientSecret: ${this.clientSecret} 
    code: ${this.code} redirectUrl: ${redirectUri}`);

    const res: LineProfile = await getLineProfile({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      code: this.code,
      redirectUri,
    });

    this.profile = res;
    console.log("________");
    console.log("________");
    console.log("________");
    info(this.profile);
    console.log("________");
    console.log("________");
    console.log("________");

    return;
  }

  /**
   * LINEプロフィール情報をもとにユーザー登録処理を行います。
   * 登録には、addInqueryMistress関数を使用し、必要なデータを渡します。
   *
   * @throws {Error} ユーザー登録処理に失敗した場合にエラーを投げます。
   */
  async register(): Promise<void> {
    info("[start] 登録処理 " + this.profile);
    await addInqueryMistress({
      profile: this.profile,
      jobId: this.jobId,
      affiliatorId: this.affiliatorId,
    });
    info("[END] 登録処理");
    return;
  }


  /**
   * 処理の終了時にログを出力し、リソースの解放やクリーンアップを行います。
   */
  end(): void {
    console.log(`
      ___関数終了___
      機能名: Line Login Web hooks
      [入力]
      type: ${this.type}
      code: ${this.code}
      state: ${this.state}
      jobId: ${this.jobId}
      affiliatorId: ${this.affiliatorId}

      [LINE データ]
      iss: ${this.profile.iss},
      sub: ${this.profile.sub},
      aud: ${this.profile.aud},
      exp: ${this.profile.exp},
      iat: ${this.profile.iat},
      nonce: ${this.profile.nonce},
      amr: ${this.profile.amr},
      name: ${this.profile.name},
      picture: ${this.profile.picture}
      ____________
    `);
  }
}
