import type { PGlite, PGliteOptions } from "@electric-sql/pglite";
import type { Configuration, Dictionary, MaybePromise } from "@mikro-orm/core";

export interface OnCreateOptionsContext {
  config: Configuration;
  options: PGliteOptions;
  custom: Dictionary;
}

export interface OnCreateOptionsHandler {
  (context: OnCreateOptionsContext): MaybePromise<void>;
}

export interface ContextWithOwnedInstance {
  kind: "with-owned-instance";
  config: Configuration;
  options: PGliteOptions;
  instance: PGlite;
  custom: Dictionary;
}

export interface ContextWithBorrowedInstance {
  kind: "with-borrowed-instance";
  config: Configuration;
  instance: PGlite;
  custom: Dictionary;
}

export type Context = ContextWithOwnedInstance | ContextWithBorrowedInstance;

export interface OnCloseContext {
  config: Configuration;
  options: PGliteOptions;
  instance: PGlite;
  custom: Dictionary;
}

export interface OnCloseHandler {
  (context: OnCloseContext): MaybePromise<void>;
}

export interface OptionsWithHandlers {
  onCreateOptions?: OnCreateOptionsHandler;
  onClose?: OnCloseHandler;
  instance?: never;
}

export interface InstanceProvider {
  (): MaybePromise<PGlite>;
}

export interface OptionsWithBorrowedInstance {
  onCreateOptions?: never;
  onClose?: never;
  instance?: InstanceProvider;
}

export type Options = OptionsWithHandlers | OptionsWithBorrowedInstance;
