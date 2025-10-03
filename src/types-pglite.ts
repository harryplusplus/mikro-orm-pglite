import type { PGlite, PGliteOptions } from "@electric-sql/pglite";
import type { Dictionary, MaybePromise } from "@mikro-orm/core";

export interface OnCreateOptionsContext {
  options: PGliteOptions;
  custom: Dictionary;
}

export interface OnCreateOptionsHandler {
  (context: OnCreateOptionsContext): MaybePromise<void>;
}

export interface ContextWithOwnedInstance {
  kind: "with-owned-instance";
  options: PGliteOptions;
  instance: PGlite;
  custom: Dictionary;
}

export interface ContextWithBorrowedInstance {
  kind: "with-borrowed-instance";
  instance: PGlite;
  custom: Dictionary;
}

export type Context = ContextWithOwnedInstance | ContextWithBorrowedInstance;

export interface OnCloseHandler {
  (context: ContextWithOwnedInstance): MaybePromise<void>;
}

export interface OptionsWithHandlers {
  onCreateOptions?: OnCreateOptionsHandler;
  onClose?: OnCloseHandler;
  instance?: never;
}

export interface OptionsWithBorrowedInstance {
  onCreateOptions?: never;
  onClose?: never;
  instance?: () => PGlite;
}

export type Options = OptionsWithHandlers | OptionsWithBorrowedInstance;
