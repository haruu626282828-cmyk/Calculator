export type AngleMode = "DEG" | "RAD";

export class CalculatorError extends Error {}

type TokenType =
  | "NUMBER"
  | "PLUS"
  | "MINUS"
  | "MUL"
  | "DIV"
  | "POW"
  | "MOD"
  | "LPAREN"
  | "RPAREN"
  | "FACTORIAL"
  | "PERCENT"
  | "SQUARE"
  | "CUBE"
  | "INVERSE"
  | "CONST_PI"
  | "CONST_E"
  | "FUNC";

interface Token {
  type: TokenType;
  value?: string;
}

const FUNCTION_NAMES = [
  "asin",
  "acos",
  "atan",
  "sin",
  "cos",
  "tan",
  "log",
  "ln",
  "sqrt",
  "cbrt",
  "exp",
  "abs",
];

const SYMBOL_FUNCTIONS: Record<string, string> = {
  "√": "sqrt",
  "∛": "cbrt",
};

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function isLetter(ch: string): boolean {
  return /[a-zA-Z]/.test(ch);
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (ch === " " || ch === "\u00A0") {
      i++;
      continue;
    }

    if (isDigit(ch) || ch === ".") {
      let start = i;
      let sawDot = false;
      while (
        i < input.length &&
        (isDigit(input[i]) || (input[i] === "." && !sawDot))
      ) {
        if (input[i] === ".") sawDot = true;
        i++;
      }
      tokens.push({ type: "NUMBER", value: input.slice(start, i) });
      continue;
    }

    if (ch === "π") {
      tokens.push({ type: "CONST_PI" });
      i++;
      continue;
    }

    if (ch === "√" || ch === "∛") {
      tokens.push({ type: "FUNC", value: SYMBOL_FUNCTIONS[ch] });
      i++;
      continue;
    }

    if (ch === "²") {
      tokens.push({ type: "SQUARE" });
      i++;
      continue;
    }

    if (ch === "³") {
      tokens.push({ type: "CUBE" });
      i++;
      continue;
    }

    if (input.startsWith("⁻¹", i)) {
      tokens.push({ type: "INVERSE" });
      i += 2;
      continue;
    }

    if (isLetter(ch)) {
      let start = i;
      while (i < input.length && isLetter(input[i])) i++;
      const word = input.slice(start, i);
      const lower = word.toLowerCase();

      if (lower === "mod") {
        tokens.push({ type: "MOD" });
        continue;
      }
      if (lower === "pi") {
        tokens.push({ type: "CONST_PI" });
        continue;
      }
      if (lower === "e") {
        tokens.push({ type: "CONST_E" });
        continue;
      }
      if (FUNCTION_NAMES.includes(lower)) {
        tokens.push({ type: "FUNC", value: lower });
        continue;
      }
      throw new CalculatorError(`Unknown token: ${word}`);
    }

    switch (ch) {
      case "+":
        tokens.push({ type: "PLUS" });
        i++;
        break;
      case "-":
      case "\u2212":
        tokens.push({ type: "MINUS" });
        i++;
        break;
      case "*":
      case "\u00D7":
        tokens.push({ type: "MUL" });
        i++;
        break;
      case "/":
      case "\u00F7":
        tokens.push({ type: "DIV" });
        i++;
        break;
      case "^":
        tokens.push({ type: "POW" });
        i++;
        break;
      case "(":
        tokens.push({ type: "LPAREN" });
        i++;
        break;
      case ")":
        tokens.push({ type: "RPAREN" });
        i++;
        break;
      case "!":
        tokens.push({ type: "FACTORIAL" });
        i++;
        break;
      case "%":
        tokens.push({ type: "PERCENT" });
        i++;
        break;
      default:
        throw new CalculatorError(`Unexpected character: ${ch}`);
    }
  }

  return tokens;
}

class Parser {
  private pos = 0;
  private tokens: Token[];
  private angleMode: AngleMode;

  constructor(tokens: Token[], angleMode: AngleMode) {
    this.tokens = tokens;
    this.angleMode = angleMode;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(type?: TokenType): Token {
    const token = this.tokens[this.pos];
    if (!token) {
      throw new CalculatorError("Unexpected end of expression");
    }
    if (type && token.type !== type) {
      throw new CalculatorError(`Expected ${type} but got ${token.type}`);
    }
    this.pos++;
    return token;
  }

  parse(): number {
    if (this.tokens.length === 0) {
      throw new CalculatorError("Empty expression");
    }
    const result = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new CalculatorError("Unexpected trailing tokens");
    }
    return result;
  }

  private parseExpression(): number {
    let value = this.parseTerm();
    while (this.peek()?.type === "PLUS" || this.peek()?.type === "MINUS") {
      const op = this.consume();
      const rhs = this.parseTerm();
      value = op.type === "PLUS" ? value + rhs : value - rhs;
    }
    return value;
  }

  private parseTerm(): number {
    let value = this.parseUnary();
    while (
      this.peek()?.type === "MUL" ||
      this.peek()?.type === "DIV" ||
      this.peek()?.type === "MOD"
    ) {
      const op = this.consume();
      const rhs = this.parseUnary();
      if (op.type === "MUL") value = value * rhs;
      else if (op.type === "DIV") {
        if (rhs === 0) throw new CalculatorError("Division by zero");
        value = value / rhs;
      } else {
        if (rhs === 0) throw new CalculatorError("Division by zero");
        value = value % rhs;
      }
    }
    return value;
  }

  private parseUnary(): number {
    if (this.peek()?.type === "MINUS") {
      this.consume();
      return -this.parseUnary();
    }
    if (this.peek()?.type === "PLUS") {
      this.consume();
      return this.parseUnary();
    }
    return this.parsePower();
  }

  private parsePower(): number {
    const base = this.parsePostfix();
    if (this.peek()?.type === "POW") {
      this.consume();
      const exponent = this.parseUnary();
      return Math.pow(base, exponent);
    }
    return base;
  }

  private parsePostfix(): number {
    let value = this.parsePrimary();
    while (true) {
      const next = this.peek();
      if (!next) break;
      if (next.type === "FACTORIAL") {
        this.consume();
        value = factorial(value);
      } else if (next.type === "PERCENT") {
        this.consume();
        value = value / 100;
      } else if (next.type === "SQUARE") {
        this.consume();
        value = value * value;
      } else if (next.type === "CUBE") {
        this.consume();
        value = value * value * value;
      } else if (next.type === "INVERSE") {
        this.consume();
        if (value === 0) throw new CalculatorError("Division by zero");
        value = 1 / value;
      } else {
        break;
      }
    }
    return value;
  }

  private parsePrimary(): number {
    const token = this.peek();
    if (!token) throw new CalculatorError("Unexpected end of expression");

    if (token.type === "NUMBER") {
      this.consume();
      return parseFloat(token.value ?? "0");
    }

    if (token.type === "CONST_PI") {
      this.consume();
      return Math.PI;
    }

    if (token.type === "CONST_E") {
      this.consume();
      return Math.E;
    }

    if (token.type === "LPAREN") {
      this.consume();
      const value = this.parseExpression();
      this.consume("RPAREN");
      return value;
    }

    if (token.type === "FUNC") {
      this.consume();
      this.consume("LPAREN");
      const arg = this.parseExpression();
      this.consume("RPAREN");
      return this.applyFunction(token.value ?? "", arg);
    }

    throw new CalculatorError(`Unexpected token: ${token.type}`);
  }

  private applyFunction(name: string, arg: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    switch (name) {
      case "sin":
        return Math.sin(this.angleMode === "DEG" ? toRad(arg) : arg);
      case "cos":
        return Math.cos(this.angleMode === "DEG" ? toRad(arg) : arg);
      case "tan":
        return Math.tan(this.angleMode === "DEG" ? toRad(arg) : arg);
      case "asin": {
        if (arg < -1 || arg > 1) throw new CalculatorError("Invalid input for asin");
        const r = Math.asin(arg);
        return this.angleMode === "DEG" ? toDeg(r) : r;
      }
      case "acos": {
        if (arg < -1 || arg > 1) throw new CalculatorError("Invalid input for acos");
        const r = Math.acos(arg);
        return this.angleMode === "DEG" ? toDeg(r) : r;
      }
      case "atan": {
        const r = Math.atan(arg);
        return this.angleMode === "DEG" ? toDeg(r) : r;
      }
      case "log":
        if (arg <= 0) throw new CalculatorError("Invalid input for log");
        return Math.log10(arg);
      case "ln":
        if (arg <= 0) throw new CalculatorError("Invalid input for ln");
        return Math.log(arg);
      case "sqrt":
        if (arg < 0) throw new CalculatorError("Invalid input for sqrt");
        return Math.sqrt(arg);
      case "cbrt":
        return Math.cbrt(arg);
      case "exp":
        return Math.exp(arg);
      case "abs":
        return Math.abs(arg);
      default:
        throw new CalculatorError(`Unknown function: ${name}`);
    }
  }
}

function factorial(n: number): number {
  if (n < 0) throw new CalculatorError("Factorial of negative number");
  if (!Number.isInteger(n)) throw new CalculatorError("Factorial requires an integer");
  if (n > 170) return Infinity;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

export function evaluateExpression(expression: string, angleMode: AngleMode): number {
  const tokens = tokenize(expression);
  const parser = new Parser(tokens, angleMode);
  const result = parser.parse();
  if (Number.isNaN(result)) throw new CalculatorError("Invalid calculation");
  if (!Number.isFinite(result)) {
    if (result === Infinity) return Infinity;
    if (result === -Infinity) return -Infinity;
    throw new CalculatorError("Invalid calculation");
  }
  return result;
}

export function formatResult(value: number): string {
  if (value === Infinity) return "Infinity";
  if (value === -Infinity) return "-Infinity";
  if (Number.isNaN(value)) return "Error";

  const abs = Math.abs(value);

  if (abs !== 0 && (abs >= 1e15 || abs < 1e-9)) {
    return value.toExponential(9).replace(/\.?0+e/, "e");
  }

  const rounded = Math.round(value * 1e12) / 1e12;

  if (Number.isInteger(rounded)) {
    return rounded.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  const [intPart, decPart] = rounded.toString().split(".");
  const formattedInt = Number(intPart).toLocaleString("en-US");
  return decPart ? `${formattedInt}.${decPart}` : formattedInt;
}
