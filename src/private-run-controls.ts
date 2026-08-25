export interface PrivateRunControls {
  safeGenerate: "on" | "off";
}

let controls: PrivateRunControls = { safeGenerate: "on" };

// These controls are intentionally parsed before Commander so they work with
// every generated agent command without appearing in command help output.
export function consumePrivateRunControls(argv: string[]): string[] {
  const remaining: string[] = [];
  controls = { safeGenerate: "on" };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const bareAssignment = /^safeGenerate=(.*)$/.exec(argument);
    if (bareAssignment) {
      const value = bareAssignment[1];
      if (value !== "on" && value !== "off") {
        throw new Error("safeGenerate requires on or off");
      }
      controls.safeGenerate = value;
      continue;
    }

    const match = /^(--safe-generate|--safeGenerate)(?:=(\S+))?$/.exec(argument);
    if (!match) {
      remaining.push(argument);
      continue;
    }

    const value = match[2] ?? argv[++index];
    if (value !== "on" && value !== "off") {
      throw new Error(`${match[1]} requires on or off`);
    }
    controls.safeGenerate = value;
  }

  return remaining;
}

export function privateRunControls(): PrivateRunControls {
  return controls;
}
