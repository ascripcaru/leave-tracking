import {
    RenderInstruction,
    ValidateResult
} from 'aurelia-validation';

export class BootstrapFormRenderer {
    render(instruction: RenderInstruction) {
        this.update(instruction.unrender, this.remove);
        this.update(instruction.render, this.add);
    }

    update(instruction, action) {
        for (let { result, elements } of instruction) {
            elements.forEach(e => action(e, result));
        }
    }

    add(element: Element, result: ValidateResult) {
        if (result.valid) {
            return;
        }

        const formGroup = element.closest('.form-group');
        if (!formGroup) {
            return;
        }

        // add the has-error class to the enclosing form-group div
        formGroup.classList.add('has-error');

        // add help-block
        const message = document.createElement('span');
        message.className = 'help-block validation-message col-xs-9 col-xs-offset-3';
        message.textContent = result.message;
        message.id = `validation-message-${result.id}`;
        formGroup.appendChild(message);
    }

    remove(element: Element, result: ValidateResult) {
        if (result.valid) {
            return;
        }

        const formGroup = element.closest('.form-group');
        if (!formGroup) {
            return;
        }

        // remove help-block
        const message = formGroup.querySelector(`#validation-message-${result.id}`);
        if (message) {
            formGroup.removeChild(message);

            // remove the has-error class from the enclosing form-group div
            if (formGroup.querySelectorAll('.help-block.validation-message').length === 0) {
                formGroup.classList.remove('has-error');
            }
        }
    }
}