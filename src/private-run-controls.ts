export interface PrivateRunControls {
  safeGenerat: "on" | "off";
  resultBase64: boolean;
}

let controls: PrivateRunControls = { safeGenerat: "on", resultBase64: false };

// These controls are intentionally parsed before Commander so they work with
// every generated agent command without appearing in command help output.
export function consumePrivateRunControls(argv: string[]): string[] {
  const remaining: string[] = [];
  controls = { safeGenerat: "on", resultBase64: false };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const bareAssignment = /^(safeGenerat|resultBase64)=(.*)$/.exec(argument);
    if (bareAssignment) {
      const [, name, value] = bareAssignment;
      if (name === "safeGenerat") {
        if (value !== "on" && value !== "off") {
          throw new Error("safeGenerat requires on or off");
        }
        controls.safeGenerat = value;
      } else {
        if (value !== "true" && value !== "false") {
          throw new Error("resultBase64 requires true or false");
        }
        controls.resultBase64 = value === "true";
      }
      continue;
    }

    const match = /^(--safe-generat|--safeGenerat|--result-base64|--resultBase64)(?:=(\S+))?$/.exec(argument);
    if (!match) {
      remaining.push(argument);
      continue;
    }

    const value = match[2] ?? argv[++index];
    if (match[1] === "--safe-generat" || match[1] === "--safeGenerat") {
      if (value !== "on" && value !== "off") {
        throw new Error(`${match[1]} requires on or off`);
      }
      controls.safeGenerat = value;
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
