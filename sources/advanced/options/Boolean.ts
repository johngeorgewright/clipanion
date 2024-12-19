import {CommandOptionReturn, GeneralOptionFlags, Resolver, makeCommandOption, rerouteArguments, resolve} from "./utils";

export type BooleanFlags = GeneralOptionFlags;

/**
 * Used to annotate boolean options.
 *
 * @example
 * --foo --no-bar
 *     ► {"foo": true, "bar": false}
 */
export function Boolean(descriptor: string, opts: BooleanFlags & {required: true}): CommandOptionReturn<boolean>;
export function Boolean(descriptor: string, opts?: BooleanFlags): CommandOptionReturn<boolean | undefined>;
export function Boolean(descriptor: string, initialValue: boolean | Resolver<boolean>, opts?: Omit<BooleanFlags, 'required'>): CommandOptionReturn<boolean>;
export function Boolean(descriptor: string, initialValueBase: BooleanFlags | boolean | Resolver<boolean> | undefined, optsBase?: BooleanFlags) {
  const [initialValue, opts] = rerouteArguments(initialValueBase, optsBase ?? {});

  const optNames = descriptor.split(`,`);
  const nameSet = new Set(optNames);

  return makeCommandOption({
    definition(builder) {
      builder.addOption({
        names: optNames,

        allowBinding: false,
        arity: 0,

        hidden: opts.hidden,
        description: opts.description,
        required: opts.required,
      });
    },

    async transformer(builer, key, state) {
      let currentValue: boolean | undefined;

      for (const {name, value} of state.options) {
        if (!nameSet.has(name))
          continue;

        currentValue = value;
      }

      currentValue ??= await resolve(initialValue);

      return currentValue;
    },
  });
}
