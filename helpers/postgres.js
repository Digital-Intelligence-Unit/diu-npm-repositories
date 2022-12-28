class Postgres {
    static marshallAttribute(attribute) {
        if (attribute == null) {
            // Handle nullables
            return attribute;
        }

        if (attribute instanceof Array) {
            // Handle arrays
            return "{" + attribute.join(",") + "}";
        }

        if (typeof attribute === "object") {
            // Handle json columns
            return "'" + JSON.stringify(attribute) + "'";
        }

        // if (typeof attribute === 'string') {
        //     //Handle string
        //     return "" + attribute + "";
        // }

        return attribute;
    }

    static marshallAttributes(attributes) {
        for (const column in attributes) {
            attributes[column] = this.marshallAttribute(attributes[column]);
        }
        return attributes;
    }
}

module.exports = Postgres;
