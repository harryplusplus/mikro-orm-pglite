import {
  type AbstractSqlConnection,
  type Knex,
  PostgreSqlConnection,
} from "@mikro-orm/postgresql";
import { PGliteKnexDialect } from "./PGliteKnexDialect";

export class PGliteConnection extends PostgreSqlConnection {
  override createKnex() {
    // NOTE: 실제 `knex`로 전달되는 타입 검증용
    const type: Knex.Config["client"] = PGliteKnexDialect;

    // NOTE: `@mikro-orm/knex`에 정의된 클래스 메서드 인자 타입 준수를 위한 캐스팅
    this.client = this.createKnexClient(
      type as unknown as Parameters<
        AbstractSqlConnection["createKnexClient"]
      >[0]
    );

    // TODO: 이유 적기
    this.connected = true;
  }

  override getDefaultClientUrl() {
    // NOTE: 실제 연결에 사용되지는 않지만 로그에 `postgresql://postgres@127.0.0.1:5432`에 연결됐다고 나오는 것이 인지적 혼란을 줘서 dummy url 임을 명시함.
    return "pglite://dummy.url";
  }
}
