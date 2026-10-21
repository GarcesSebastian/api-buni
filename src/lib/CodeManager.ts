class CodeManager {
  static Codes = new Map<string, number>();
  static Times = new Map<string, ReturnType<typeof setTimeout>>();
  static waitTime = 30 * 60 * 1000;

  static generateCode(): number {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code;
  }

  static addCode(id: string, code: number): void {
    if (this.Times.has(id)) {
      this.removeTime(id);
    }

    this.Codes.set(id, code);
    const timeOut = setTimeout(() => {
      this.expireCode(id);
    }, this.waitTime);
    this.Times.set(id, timeOut);
  }

  static removeCode(id: string): void {
    this.Codes.delete(id);
    this.removeTime(id);
  }

  static expireCode(id: string): void {
    // Secret-leaking logs removed (design §3.7): never log recovery codes or the code map.
    this.removeCode(id);
  }

  static removeTime(id: string): void {
    if (this.Times.has(id)) {
      clearTimeout(this.Times.get(id));
      this.Times.delete(id);
    }
  }

  static getCode(id: string): number | undefined {
    return this.Codes.get(id);
  }

  static verifyCode(id: string, code: number | string): boolean {
    const storedCode = this.getCode(id);
    return storedCode == code;
  }

  static getCodes(): Map<string, number> {
    return this.Codes;
  }
}

export { CodeManager };
