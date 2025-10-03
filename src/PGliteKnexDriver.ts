import { PGlite } from "@electric-sql/pglite";
import type { Types } from ".";
import { PGliteKnexDialect } from "./PGliteKnexDialect";

export class PGliteKnexDriver {
  private context: Types.PGlite.Context | null = null;
  private connectPromise: Promise<void> | null = null;
  private readonly knexDialect: PGliteKnexDialect;

  constructor(knexDialect: PGliteKnexDialect) {
    this.knexDialect = knexDialect;
  }

  async connect(): Promise<void> {
    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = this.connectInternal();
    return this.connectPromise;
  }

  async close(): Promise<void> {
    if (
      this.context &&
      this.context.kind === "with-owned-instance" &&
      !this.context.instance.closed
    ) {
      const { onClose } = this.getOptions();
      await onClose?.(this.context);
      await this.context.instance.close();
    }

    this.context = null;
    this.connectPromise = null;
  }

  acquire(): PGlite {
    if (!this.context || !this.context.instance.ready) {
      throw new Error("Context is not initialized.");
    }

    return this.context.instance;
  }

  release(_connection: PGlite): void {
    // noop
  }

  private async connectInternal(): Promise<void> {
    const { onCreateOptions, ...options } = this.getOptions();
    if (options.instance) {
      const instance = await options.instance();
      await instance.waitReady;
      this.context = {
        kind: "with-borrowed-instance",
        config: this.knexDialect.ormConfig,
        instance,
        custom: {},
      };
      return;
    }

    const context: Types.PGlite.OnCreateOptionsContext = {
      config: this.knexDialect.ormConfig,
      options: {},
      custom: {},
    };
    if (onCreateOptions) {
      await onCreateOptions(context);
    }

    const instance = new PGlite(context.options);
    await instance.waitReady;
    this.context = {
      ...context,
      kind: "with-owned-instance",
      instance,
    };
  }

  private getOptions(): Types.PGlite.Options {
    const { pglite } = this.knexDialect.ormConfig.get<
      "driverOptions",
      Types.Driver.OptionsWithPGliteOptions
    >("driverOptions");
    return pglite ?? {};
  }
}
