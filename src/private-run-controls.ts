export interface PrivateRunControls {
  safeGenerate: "on" | "off";
  resultBase64: boolean;
}

let controls: PrivateRunControls = { safeGenerate: "on", resultBase64: false };

// These controls are intentionally parsed before Commander so they work with
// every generated agent command without appearing in command help output.
export function consumePrivateRunControls(argv: string[]): string[] {
  const remaining: string[] = [];
  controls = { safeGenerate: "on", resultBase64: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const bareAssignment = /^(safeGenerate|resultBase64)=(.*)$/.exec(argument);
    if (bareAssignment) {
      const [, name, value] = bareAssignment;
      if (name === "safeGenerate") {
        if (value !== "on" && value !== "off") {
          throw new Error("safeGenerate requires on or off");
        }
        controls.safeGenerate = value;
      } else {
        if (value !== "true" && value !== "false") {
          throw new Error("resultBase64 requires true or false");
        }
        controls.resultBase64 = value === "true";
      }
      continue;
    }

    const match = /^(--safe-generate|--safeGenerate|--result-base64|--resultBase64)(?:=(\S+))?$/.exec(argument);
    if (!match) {
      remaining.push(argument);
      continue;
    }

    const value = match[2] ?? argv[++index];
    if (match[1] === "--safe-generate" || match[1] === "--safeGenerate") {
      if (value !== "on" && value !== "off") {
        throw new Error(`${match[1]} requires on or off`);
      }
      controls.safeGenerate = value;
    } else {
      if (value !== "true" && value !== "false") {
        throw new Error(`${match[1]} requires true or false`);
      }
      controls.resultBase64 = value === "true";
    }
  }

  return remaining;
}

export function privateRunControls(): PrivateRunControls {
  return controls;
}
