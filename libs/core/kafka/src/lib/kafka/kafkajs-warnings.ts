const KAFKAJS_TIMEOUT_WARNING_PATCHED = Symbol.for(
  'kafka-base-implementation.kafkajs-timeout-warning-patched',
);

type PatchedProcess = NodeJS.Process & {
  [KAFKAJS_TIMEOUT_WARNING_PATCHED]?: boolean;
};

export function suppressKafkaJsTimeoutNegativeWarning(): void {
  const patchedProcess = process as PatchedProcess;

  if (patchedProcess[KAFKAJS_TIMEOUT_WARNING_PATCHED]) {
    return;
  }

  const emitWarning = process.emitWarning.bind(process);

  process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
    if (isKafkaJsTimeoutNegativeWarning(warning, args)) {
      return;
    }

    return emitWarning(warning, ...(args as []));
  }) as typeof process.emitWarning;

  patchedProcess[KAFKAJS_TIMEOUT_WARNING_PATCHED] = true;
}

function isKafkaJsTimeoutNegativeWarning(
  warning: string | Error,
  args: unknown[],
): boolean {
  if (warning instanceof Error) {
    return (
      warning.name === 'TimeoutNegativeWarning' &&
      warning.message.includes('negative number')
    );
  }

  const warningType = args.find(
    (argument): argument is string => typeof argument === 'string',
  );

  return (
    warningType === 'TimeoutNegativeWarning' &&
    warning.includes('negative number')
  );
}
