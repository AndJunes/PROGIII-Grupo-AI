// Validadores de formularios
export class Validators {
    static required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    }

    static minLength(value, min) {
        return value && value.length >= min;
    }

    static maxLength(value, max) {
        return value && value.length <= max;
    }

    static email(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    static phone(value) {
        const phoneRegex = /^\+?[\d\s-()]{10,}$/;
        return phoneRegex.test(value.replace(/\s/g, ''));
    }

    static number(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    static minValue(value, min) {
        return parseFloat(value) >= min;
    }

    static maxValue(value, max) {
        return parseFloat(value) <= max;
    }

    static date(value) {
        return !isNaN(Date.parse(value));
    }

    static futureDate(value) {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    }

    static time(value) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(value);
    }

    static validateForm(formData, rules) {
        const errors = {};
        
        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = formData[field];
            
            for (const rule of fieldRules) {
                if (rule === 'required' && !this.required(value)) {
                    errors[field] = 'Este campo es requerido';
                    break;
                }
                
                if (rule.startsWith('minLength:')) {
                    const min = parseInt(rule.split(':')[1]);
                    if (!this.minLength(value, min)) {
                        errors[field] = `Mínimo ${min} caracteres`;
                        break;
                    }
                }
                
                if (rule.startsWith('maxLength:')) {
                    const max = parseInt(rule.split(':')[1]);
                    if (!this.maxLength(value, max)) {
                        errors[field] = `Máximo ${max} caracteres`;
                        break;
                    }
                }
                
                if (rule === 'email' && !this.email(value)) {
                    errors[field] = 'Email inválido';
                    break;
                }
                
                if (rule === 'phone' && !this.phone(value)) {
                    errors[field] = 'Teléfono inválido';
                    break;
                }
                
                if (rule === 'number' && !this.number(value)) {
                    errors[field] = 'Debe ser un número';
                    break;
                }
                
                if (rule.startsWith('minValue:')) {
                    const min = parseFloat(rule.split(':')[1]);
                    if (!this.minValue(value, min)) {
                        errors[field] = `Valor mínimo: ${min}`;
                        break;
                    }
                }
                
                if (rule.startsWith('maxValue:')) {
                    const max = parseFloat(rule.split(':')[1]);
                    if (!this.maxValue(value, max)) {
                        errors[field] = `Valor máximo: ${max}`;
                        break;
                    }
                }
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}