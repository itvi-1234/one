import type { SchemaPositions } from "../types/one";

const escapePointerSegment = (segment: string): string =>
  segment.replace(/~/g, "~0").replace(/\//g, "~1");

export const computeJsonPositions = (text: string): SchemaPositions => {
  const positions: SchemaPositions = {};
  let i = 0;
  let line = 0;
  let col = 0;

  const advance = () => {
    if (text[i] === "\n") {
      line++;
      col = 0;
    } else {
      col++;
    }
    i++;
  };

  const skipWhitespace = () => {
    while (i < text.length && /\s/.test(text[i])) advance();
  };

  const SIMPLE_ESCAPES: Record<string, string> = {
    '"': '"',
    "\\": "\\",
    "/": "/",
    n: "\n",
    t: "\t",
    r: "\r",
    b: "\b",
    f: "\f",
  };

  const parseString = (): string => {
    let result = "";
    advance();
    while (i < text.length && text[i] !== '"') {
      if (text[i] === "\\") {
        advance();
        const escapeChar = text[i];
        if (escapeChar === "u") {
          const hex = text.slice(i + 1, i + 5);
          result += String.fromCharCode(parseInt(hex, 16));
          advance();
          advance();
          advance();
          advance();
          advance();
        } else {
          result += SIMPLE_ESCAPES[escapeChar] ?? escapeChar;
          advance();
        }
      } else {
        result += text[i];
        advance();
      }
    }
    advance();
    return result;
  };

  const parseValue = (pointer: string): void => {
    skipWhitespace();
    const startLine = line;
    const startCol = col;
    const ch = text[i];

    if (ch === "{") {
      advance();
      skipWhitespace();
      if (text[i] === "}") {
        advance();
      } else {
        for (;;) {
          skipWhitespace();
          const key = parseString();
          skipWhitespace();
          advance();
          parseValue(`${pointer}/${escapePointerSegment(key)}`);
          skipWhitespace();
          if (text[i] === ",") {
            advance();
            continue;
          }
          break;
        }
        skipWhitespace();
        advance();
      }
    } else if (ch === "[") {
      advance();
      skipWhitespace();
      if (text[i] === "]") {
        advance();
      } else {
        let index = 0;
        for (;;) {
          parseValue(`${pointer}/${index}`);
          index++;
          skipWhitespace();
          if (text[i] === ",") {
            advance();
            continue;
          }
          break;
        }
        skipWhitespace();
        advance();
      }
    } else if (ch === '"') {
      parseString();
    } else {
      while (i < text.length && !/[,}\]\s]/.test(text[i])) advance();
    }

    positions[pointer] = [startLine, startCol, line, col];
  };

  parseValue("");
  return positions;
};
