import { ValidationRules } from 'aurelia-validation';

export function setupCustomValidationRules() {
    const integerRangeMessage = `\${$displayName} must be an integer between \${$config.min} and \${$config.max}.`;
    const integerRangeRule = (value, obj, min, max) => {
        return value === null || value === undefined
            || Number.isInteger(parseInt(value)) && parseInt(value) >= min && parseInt(value) <= max;
    };

    const otherThanMessage = `\${$displayName} must be selected.`;
    const otherThanRule = (value, obj, str, isOptional = false) => {
        const satisfiesRule = value !== null &&
            value !== undefined &&
            value !== '' &&
            value !== str;

        return isOptional ? true : satisfiesRule;
    };

    ValidationRules.customRule(
        'integerRange',
        integerRangeRule,
        integerRangeMessage,
        (min, max) => ({ min, max })
    );
    ValidationRules.customRule(
        'otherThan',
        otherThanRule,
        otherThanMessage
    );
}
