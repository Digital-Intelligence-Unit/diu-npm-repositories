class Stringg {
    static rand(length = 6) {
        let generatedCode = "";
        for (let index = 0; index < length; index++) {
            generatedCode += Math.floor(Math.random() * 10)
                .toString()
                .substr(0, 1);
        }
        return generatedCode;
    }

    static sidBufferToString(buf) {
        const pad = function (s) {
            if (s.length < 2) {
                return `0${s}`;
            } else {
                return s;
            }
        };
        let asc; let end;
        let i;

        if (buf == null) {
            return null;
        }

        const version = buf[0];
        const subAuthorityCount = buf[1];
        const identifierAuthority = parseInt(
            (() => {
                const result = [];
                for (i = 2; i <= 7; i++) {
                    result.push(buf[i].toString(16));
                }
                return result;
            })().join(""),
            16
        );

        let sidString = `S-${version}-${identifierAuthority}`;

        for (i = 0, end = subAuthorityCount - 1, asc = end >= 0; asc ? i <= end : i >= end; asc ? i++ : i--) {
            const subAuthOffset = i * 4;
            const tmp =
                pad(buf[11 + subAuthOffset].toString(16)) +
                pad(buf[10 + subAuthOffset].toString(16)) +
                pad(buf[9 + subAuthOffset].toString(16)) +
                pad(buf[8 + subAuthOffset].toString(16));
            sidString += `-${parseInt(tmp, 16)}`;
        }

        return sidString;
    }
}

module.exports = Stringg;
