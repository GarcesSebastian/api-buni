class CodeManager {
    static Codes = new Map();
    static Times = new Map();
    static waitTime = 30 * 60 * 1000;

    static generateCode() {
        const code = Math.floor(100000 + Math.random() * 900000);
        return code;
    }

    static addCode(id, code) {
        if (this.Times.has(id)) {
            this.removeTime(id);
        }

        this.Codes.set(id, code);
        const timeOut = setTimeout(() => { this.expireCode(id) }, this.waitTime);
        this.Times.set(id, timeOut);
    }

    static removeCode(id) {
        this.Codes.delete(id);
        this.removeTime(id);
    }

    static expireCode(id) {
        const code = this.getCode(id);
        this.removeCode(id);
        console.log('Código expirado', code, id);
        console.log(this.Codes);
    }

    static removeTime(id) {
        if (this.Times.has(id)) {
            clearTimeout(this.Times.get(id));
            this.Times.delete(id);
        }
    }

    static getCode(id) {
        return this.Codes.get(id);
    }

    static verifyCode(id, code) {
        const storedCode = this.getCode(id);
        return storedCode == code;
    }

    static getCodes() {
        return this.Codes;
    }
}

export { CodeManager }