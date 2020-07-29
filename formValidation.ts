const form = document.getElementById('form') as HTMLFormElement | undefined;

let formElements: HTMLInputElement | HTMLTextAreaElement;

interface validateValue {
  min?: number;
  max?: number;
  value: number;
}

interface errorArgs {
  input: typeof formElements;
  message?: string;
}

interface formValidation {
  validate (form: HTMLFormElement): boolean;
  isValid (fields: boolean[]): boolean;
  validateFields (fields:(HTMLInputElement | HTMLTextAreaElement)[]): [boolean];
  isPhoneValid (input: HTMLInputElement): boolean;
  isEmailValid (input: HTMLInputElement): boolean;
  isLengthValid (input: typeof formElements): boolean;
  isValidLength (args: validateValue): boolean;
  handleError (args: errorArgs): void;
  createErrorMessage (args: errorArgs): void;
  removeError (input: typeof formElements): true;
  getInputLabel (input: typeof formElements): HTMLLabelElement;
  removeErrorMessage (input: typeof formElements): void;
  displayError (form: HTMLFormElement): void;
  focusOnFirstError(): void;  
  displayValid (form: HTMLFormElement): void;
}

if (form) {
  form.addEventListener('submit', function (e: Event) {
    e.preventDefault();

    if (! formValidation.validate(form)) {
      formValidation.displayError(form)
    } else {
      formValidation.displayValid(form);
    }
  });

  form.addEventListener('change', function (e: Event){
    const test = formValidation.validateFields([e.target as typeof formElements]);
  });
}

const formValidation: formValidation = {

  validate: function (form) {
    const formInputs = form.getElementsByTagName('input');
    const formTextareas = form.getElementsByTagName('textarea');

    const textareasArray: HTMLTextAreaElement[] = Array.prototype.slice.call(formTextareas);
    const inputsArray: HTMLInputElement[] = Array.prototype.slice.call(formInputs);
  
    return this.isValid(
      this.validateFields([...inputsArray, ...textareasArray])
    );
  },

  validateFields: function (fields) {
    return fields.map((input: HTMLInputElement | HTMLTextAreaElement) => {
      if (input.type === 'email') {
        return this.isEmailValid(input as HTMLInputElement);
      }
      else if (input.dataset.validation === 'phone') {
        return this.isPhoneValid(input as HTMLInputElement);
      }
      else if (input.dataset.minLength || input.dataset.maxLength) {
        return this.isLengthValid(input);
      }
    }) as [boolean];
  },

  isValid: function (fields) {
    for (let value of fields) {
      if (typeof value !== undefined && value === false) return false;
    }
    return true;
  },

  isPhoneValid: function (input) {
    const cleanPhone = input.value.replace(/[^0-9+]/g, '');
  
    if (cleanPhone.length < 9) {
      this.handleError({input: input, message: 'Phone number is not valid'});
      return false;
    };

    this.removeError(input);
    return true;
  },

  isEmailValid: function (input) {
    const regEx = /^[A-Z0-9._%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
  
    if (!regEx.test(input.value)) {
      this.handleError({input: input, message: 'Email address is not valid'});
      return false;
    };

    this.removeError(input);
    return true;
  },

  isLengthValid: function (input) {
    const minLength: string | undefined = input.dataset.minLength;
    const maxLength: string | undefined = input.dataset.maxLength;
    let inputValue: number = input.value.length;
    let args:validateValue = {value: inputValue};
  
    const inputLabel: HTMLLabelElement = this.getInputLabel(input);
    let errorMessage: string = `${inputLabel.innerText} must be `;
  
    if (minLength) {
      args.min = +minLength;
      errorMessage += `over ${minLength} characters long.`;
    }
  
    if (maxLength) {
      args.max = +maxLength;
      errorMessage += `under ${maxLength} characters long.`;
    }
  
    if (maxLength && minLength) {
      errorMessage += `between ${minLength} and ${maxLength} characters long.`;
    }
  
    if (this.isValidLength(args) ) {
      this.removeError(input);
      return true;
    } else {
      this.handleError({input: input, message: errorMessage});
      return false;
    }
  },

  isValidLength: function (args) {
    let result: boolean = false;
  
    if (args.min && args.max) {
      result = args.value >= args.min && args.value <= args.max;
    } 
    else if (args.min) result = args.value >= args.min;
    else if (args.max) result = args.value <= args.max;
  
    return result;
  },

  handleError: function (args) {
    if (args.message) this.createErrorMessage(args);
    return args.input.classList.add('field--error');
  },

  createErrorMessage: function (args) {
    const parentElement = args.input.parentElement;
    let textNode = parentElement?.getElementsByClassName('field--error__message')[0] as HTMLSpanElement | undefined;
  
    if (! textNode) {
      textNode = document.createElement('span');
      textNode.innerText = args.message!;
      textNode.classList.add('field--error__message')
      parentElement!.appendChild(textNode);
    }
  },

  getInputLabel: function (input) {
    const children = input.parentElement!.children;
    const childrenArray = Array.prototype.slice.call(children);
    
    return childrenArray.filter((child: HTMLElement) : boolean => {
      return child.nodeName === 'LABEL';
    })[0];
  },

  removeError: function (input) {
    input.classList.remove('field--error');
    this.removeErrorMessage(input);
    return true;
  },

  removeErrorMessage: function (input) {
    const parent = input.parentElement;
    const message = parent!.getElementsByClassName('field--error__message')[0];
    if (message) message.remove();
  },

  displayError: function (form) {
    let errorMessage = form.getElementsByClassName('form__error')[0] as HTMLSpanElement | undefined;

    if (! errorMessage) {
      errorMessage = document.createElement('span')
      errorMessage.classList.add('form__error');
      errorMessage.innerText = 'Error: please check fields below';
      form!.prepend(errorMessage);
    }
    this.focusOnFirstError();
  },

  focusOnFirstError: function () {
    const formError = form!.getElementsByClassName('field--error')[0] as HTMLInputElement;
    formError.focus();
    formError.scrollIntoView({ behavior: 'smooth', block: 'nearest'});
  },

  displayValid: function (form) {
    let message = form.getElementsByClassName('form__error')[0] as HTMLElement | undefined;
    if (message) {
      message.classList.remove('form__error');
      message.classList.add('form__success');
      message.innerText = 'Form submitted successfully';
    }
    return;
  }
};
