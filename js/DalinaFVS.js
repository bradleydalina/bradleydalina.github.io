'use strict';
/*
  Copyright (C) Bradley B Dalina 2026
  Distributed under the MIT License (license terms are at http://opensource.org/licenses/MIT).
*/
/*
  <input type="checkbox">
  <input type="color">
  <input type="date">
  <input type="datetime-local">
  <input type="email">
  <input type="file">
  <input type="hidden">
  <input type="image">
  <input type="month">
  <input type="number">
  <input type="password">
  <input type="radio">
  <input type="range">
  <input type="search">
  <input type="tel">
  <input type="text">
  <input type="time">
  <input type="url">
  <input type="week">
  //Escape
  <input type="button">
  <input type="reset">
  <input type="submit">
*/
(function (d, w) {
  function DalinaFVS(form, options) {	 
    const self = this;
	options = options || {};
    const _listeners = new WeakMap();
    const _errors =[];
    let _mounted = false;
    // let _disabled = false;
    let _validators = [];
    //Callbacks
    let _successCallback = null;
    let _errorCallback = null;
    let _validateCallback=null;

    let _firstInvalid = null;
    //Detector
    let _isManualInput = false;
    let _keyboardEvents = 0;
    let _mouseEvents = 0;
    let _options = Object.freeze({
        //Security
        bait: (options && options.bait) || false,
        defaultKey: (options && options.defaultKey) || '000-00-0000',
        //Helper
        log: (options && options.log) || false,
        debug: (options && options.debug) || false,
        //Style
        style: (options && options.style) || null
      });
    let _form = document.querySelector(form) || null;
    let _button = null;
    let _inputs = [];
    const _cStyle = '.__formDalinaFVS';    
    function _logMessenger(_m) {
        if (_options.log) {
          console.log(_m);
        }
      }
    function _createHiddenInput(name, value = null, attributes = []) {
        _logMessenger(`Creating hidden input element ${name}...`);
        const newInput = d.createElement('input');
        newInput.name = name;
        newInput.setAttribute("type", "hidden");
        newInput.setAttribute("autocomplete", "off");
        newInput.value = value;
        attributes.forEach(obj => {
          Object.entries(obj).forEach(([key, value]) => {
            newInput.setAttribute(key, value);
          });
        });
        _form.prepend(newInput);
      }
    function _removeIfExists(selector) {
        let removeInput = d.querySelector(selector);
        if (removeInput) removeInput.remove();
      }
    function _setupSubmitHandler() {
        _logMessenger('Activating form submit handler...');
        _firstInvalid = null;
        const unTrusted = d.querySelector('input[name="unTrusted"]');
        _logMessenger('Setting up listeners...');
        _inputs.forEach((_i) => {
            _setupListeners(_i);
          });
        if (_button instanceof HTMLElement &&
          _button &&
          _button.nodeType === 1 &&
          typeof _button.nodeName === 'string') {
            _button.addEventListener('click', (e) => {
              
              _logMessenger('Submit button was triggered...');
              if (_validateCallback && typeof _validateCallback === "function") {
                  _validateCallback();
                }
              _button.classList.add('loading');
              if (!e.isTrusted && unTrusted) {
                unTrusted.value = true;
              }
              self.validate();
              //self.disable();
              if (!_form.checkValidity()) {
                _form.reportValidity();
                if (_options.log) console.table(self.getData());
                setTimeout(() => {
                  _button.classList.remove('loading');
                  //self.enable();
                }, 500);
                _errors.push(self.getValidationErrors());
                if(_options.debug) throw self.getValidationErrors();  
              }
            }); 
          }
        _form.addEventListener('submit', (e) => {          
              if (!e.isTrusted && unTrusted) {
                  unTrusted.value = true;
                }
              _removeIfExists('input[name="pragmatic"]');          
              _createHiddenInput("pragmatic", !_isUserTyping());            
              // run validation on all
              if (!_form.checkValidity()) {
                  _errors.push(new Error(`Form validation failed.`));
                  if (_options.debug) throw new Error(`Form validation failed.`);
                  e.preventDefault();
                  _form.reportValidity();
                }
              if (_successCallback && typeof _successCallback === "function") {
                  e.preventDefault();
                  _successCallback(self.getData());
                  _button.classList.remove('loading');
                }
              if (_options.log) console.table(self.getData());
              _button.classList.remove('loading');
            });
      }
    function _setupListeners(_i) {      
        const handlers = {
          keydown(e) {
              _keyboardEvents++;
            },
          keyup(e) {
              _isManualInput = true;
              _logMessenger(`Validating user input ${_getInputIdentifier(_i)}...`);
              _runValidation(_i);
            },
          paste(e) {
              _isManualInput = true;
              //_logMessenger(`Validating user input ${_getInputIdentifier(_i)}...`);
              _runValidation(_i);
            },
          focus(e) {
              _isManualInput = true;
            },
          change(e) {
              if (_keyboardEvents === 0) _isManualInput = false;
              if (e.isTrusted && e.target.value) _isManualInput = true;
              //_logMessenger(`Validating user input ${_getInputIdentifier(_i)}...`);
              _runValidation(_i);
            },
          input(e) {
              if (_keyboardEvents === 0) _isManualInput = false;
            //_logMessenger(`Validating user input ${_getInputIdentifier(_i)}...`);
              _runValidation(_i); 
            }
        };
        _listeners.set(_i, handlers);
        Object.entries(handlers).forEach(([event, fn]) => {
            _i.addEventListener(event, fn);
          });
      }
    function _appendStyle(_s) {
      _logMessenger('Adding validation indicator styles...');
      let cssText = `
	                                  ${_cStyle} [type=radio],
	                                  ${_cStyle} [type=checkbox] {
	                                    -webkit-appearance: none;
	                                    -moz-appearance:    none;
	                                    appearance:         none;
	                                  }
	                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not(:user-invalid):focus,
	                                  ${_cStyle} textarea:not(:user-invalid):focus,
	                                  ${_cStyle} select:not(:user-invalid):focus{
	                                      border:solid 1px #000;
	                                    }
	                                  ${_cStyle} [type=radio],
	                                  ${_cStyle} [type=checkbox] {
	                                    width: 20px;
	                                    height: 20px;
	                                    border: solid 1px #cccccc;
	                                    margin-right: 8px;
	                                    position: relative;
	                                  }
	                                  ${_cStyle} [type=radio]:checked::before,
	                                  ${_cStyle} [type=checkbox]:checked::before {
	                                    content: "";
	                                    width: 14px;
	                                    height: 14px;
	                                    background-color: rgb(3, 130, 5);;
	                                    position: absolute;
	                                    top: 2px;
	                                    left: 2px;
	                                  }
	                                  ${_cStyle} [type=checkbox]:user-invalid, ${_cStyle} [type=radio]:user-invalid{
	                                    border: solid 1px red;
	                                    background-color:#ff000024 !important;
	                                  }
	                                  ${_cStyle} [type=radio],
	                                  ${_cStyle} [type=radio]:checked::before{
	                                    border-radius: 100%;
	                                  }
	                                  ${_cStyle} input:not([type="radio"]):not([type="checkbox"]):user-invalid,
                                    ${_cStyle} input:not([type="radio"]):not([type="checkbox"]).invalid,
	                                  ${_cStyle} select:user-invalid,
                                    ${_cStyle} select.invalid,
                                    ${_cStyle} textarea:user-invalid,
	                                  ${_cStyle} textarea.invalid{
	                                        border: solid 1px #ff0000 !important;
	                                        /*padding-right: calc(1.5em + .75rem) !important;*/
	                                        background-color: #ffffff !important;
	                                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 16 16'%3E%3Cpath fill='%23ac0202' d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2a1 1 0 0 0 0-2z'/%3E%3C/svg%3E") !important;
	                                        background-repeat: no-repeat !important;
	                                        background-position: right calc(.375em + .1875rem) center !important;
	                                        background-size: calc(.75em + .375rem) calc(.75em + .375rem) !important;
	                                        appearance: none !important;
	                                        -webkit-appearance: none !important;
	                                      }
	                                  ${_cStyle} textarea.invalid,${_cStyle} textarea:user-invalid{background-position: right calc(.375em + .1875rem) top 10px !important;}
	                                  ${_cStyle} input.valid:-webkit-autofill,
	                                  ${_cStyle} input:valid:-webkit-autofill,
	                                  ${_cStyle} input.valid:-internal-autofill-selected,
	                                  ${_cStyle} input.valid:-internal-autofill-previewed,
	                                  ${_cStyle} input:valid:-internal-autofill-selected,
	                                  ${_cStyle} input:valid:-internal-autofill-previewed,
	                                  ${_cStyle} input:-internal-autofill-selected,
	                                  ${_cStyle} input:-internal-autofill-previewed,
	                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):user-valid,
	                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):valid,
	                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]).valid,
	                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):autofill:valid,
	                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]).valid:autofill,
	                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):-webkit-autofill:valid,
	                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):autofill,
	                                  ${_cStyle} input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="radio"]):not([type="checkbox"]):-webkit-autofill,
	                                  ${_cStyle} select:user-valid,
	                                  ${_cStyle} select:valid,
	                                  ${_cStyle} select.valid,
	                                  ${_cStyle} select:autofill:valid,
	                                  ${_cStyle} select.valid:autofill,
	                                  ${_cStyle} textarea:user-valid,
	                                  ${_cStyle} textarea:valid,
	                                  ${_cStyle} textarea.valid,
	                                  ${_cStyle} textarea.valid:autofill,
	                                  ${_cStyle} textarea:autofill:valid{
	                                        /*padding-right: calc(1.5em + .75rem) !important;*/
	                                        background-color: white !important;
	                                        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 12 12'%3E%3Cpath fill='%23038205' d='M6 0C2.69 0 0 2.69 0 6s2.69 6 6 6s6-2.69 6-6s-2.69-6-6-6m3.44 4.94l-3.5 3.5c-.12.12-.28.18-.44.18s-.32-.06-.44-.18l-2-2c-.24-.24-.24-.64 0-.88s.64-.24.88 0L5.5 7.12l3.06-3.06c.24-.24.64-.24.88 0c.25.24.25.64 0 .88'/%3E%3C/svg%3E") !important;
	                                        background-repeat: no-repeat !important;
	                                        background-position: right calc(.375em + .1875rem) center !important;
	                                        background-size: calc(.75em + .375rem) calc(.75em + .375rem) !important;
	                                        appearance: none !important;
	                                        -webkit-appearance: none !important;
	                                    }
										.__formDalinaFVS textarea:user-valid, .__formDalinaFVS textarea:valid, .__formDalinaFVS textarea.valid, .__formDalinaFVS textarea.valid:autofill, .__formDalinaFVS textarea:autofill:valid{
    										background-position: right calc(.375em + .1875rem) top 10px !important;
										}										
	                                  ${_cStyle} textarea.valid:autofill, ${_cStyle} textarea.valid,${_cStyle} textarea:user-valid,${_cStyle} textarea:valid,${_cStyle} textarea:autofill:valid{background-position: right calc(.375em + .1875rem) top 10px;}
	                                  ${_cStyle} button[type='submit'], ${_cStyle} input[type='submit']{
	                                      position:relative;
	                                      /*padding-right:.75rem;*/
	                                      line-height:1.6;
	                                      transition: padding 150ms ease-in;
	                                    }
	                                  ${_cStyle} button[disabled]:hover, ${_cStyle} input[disabled]:hover, ${_cStyle} select[disabled]:hover, ${_cStyle} textarea[disabled]:hover{
	                                        cursor: not-allowed !important;
	                                        pointer-events: all;
	                                    }
	                                  ${_cStyle} select[disabled],${_cStyle} input:not([type="submit"])[disabled], ${_cStyle} textarea[disabled] {
	                                      opacity: 0.5 !important;
	                                    }
	                                  ${_cStyle} button[type='submit'].loading, ${_cStyle} input[type='submit'].loading{
	                                      position:relative;
	                                      padding-right:40px;
	                                      transition: padding 150ms linear;
	                                      display: inline-flex;
	                                      align-items: center;
	                                      justify-content: center;
	                                      align-content: center;
	                                      justify-items: center;
	                                      column-gap: 10px;
	                                      opacity:0.8 !important;
	                                      cursor:not-allowed;
	                                      pointer-events: all;
	                                    }
	                                  ${_cStyle} button[type='submit'].loading::after, ${_cStyle} input[type='submit'].loading::after{
	                                      content:'';
	                                      display:block;
	                                      width:20px;
	                                      height:20px;
	                                      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 50 50'%3E%3Ccircle cx='25' cy='25' r='20' fill='none' stroke='%23ffffff' stroke-width='4' stroke-linecap='round' stroke-dasharray='90' stroke-dashoffset='60'%3E%3CanimateTransform attributeName='transform' type='rotate' from='0 25 25' to='360 25 25' dur='1s' repeatCount='indefinite'/%3E%3C/circle%3E%3C/svg%3E");
	                                    }
	                                  ${_cStyle} ::placeholder{
	                                        color:#545454;
	                                        font-size:12px !important;
	                                        font-weight:400;
	                                        vertical-align:middle;
	                                        display:block;
	                                        align-items:center;
	                                        justify-content:center;
	                                        justify-items:center;
	                                        align-content:center;
	                                      }
	                                  ${_cStyle} input:user-invalid::placeholder,
	                                  ${_cStyle} textarea:user-invalid::placeholder,
	                                  ${_cStyle} select:user-invalid{
	                                      color:#ff0000b0;
	                                      font-size:12px;
	                                      font-weight:400;
	                                      vertical-align:middle;
	                                      display:flex;
	                                      align-items:center;
	                                      justify-content:center;
	                                    }
	                                  `;
        cssText += _options.style || '';

        if (!d.getElementById('DalinaFVS-CSS')) {
          const style = d.createElement('style');
          style.id = 'DalinaFVS-CSS';
          style.textContent = cssText || '';
          d.head.appendChild(style);
        }
      }
    function _isUserTyping() {
        return _keyboardEvents > 0 && _isManualInput;
      }
    function _isPlainObject(_o) {
        return Object.prototype.toString.call(_o) === '[object Object]';
      }  
    function _objCheck(_o) {
        if (!_o.selector || !_o.rule) {
          _errors.push(new Error('Object does not properly contain the selector and rule keys.'));
          if (_options.debug)
            throw new Error(
              'Object does not properly contain the selector and rule keys.'
            );
          return;
        }
        Object.freeze(_o);
        _prepareValidator(_o.selector, _o.rule);
      }
    function _prepareValidator(_s, _r) {
        let _i;
        if (typeof _s === 'string') {
          _i = d.querySelector(_s);
          if (!(_i instanceof HTMLElement)) {
            _errors.push(new Error(`Element selector "${_s}" does not exists.`));
            if (_options.debug)
              throw new Error(`Element selector "${_s}" does not exists.`);
            return;
          }
        }
        if (
          _s instanceof HTMLElement &&
          _s &&
          _s.nodeType === 1 &&
          typeof _s.nodeName === 'string'
        ) {
          _i = _s;
        }
        _setValidator(_i, _r);
      }
    function _setValidator(_i, _r) {
        if (!_validators.has(_i)) {
            _validators.set(_i, []);
          }
        if (Array.isArray(_r)) {
            _r.forEach((r) => {
              _validators.get(_i).push(r);
            });
          } else {
              _validators.get(_i).push(_r);
            }
      }
    function _runValidation(_i) {
        const validators = _validators.get(_i) || [];
        const messages = [];

        // Always reset first
        _i.setCustomValidity("");

        for (const validate of validators) {
          const msg = validate(_i.value, _i);
          if (msg && !messages.includes(msg)) {
            messages.push(msg);
          }
        }

        // If we have errors, apply them
        if (messages.length) {
          _i.setCustomValidity(messages.join("\n"));
        }

        // Browser validity check
        if (!_i.checkValidity()) {
          _i.classList.remove("valid");
          _i.classList.add("invalid");
          _i.setAttribute("aria-invalid", "true");
        } else {
          _i.classList.remove("invalid");
          _i.classList.add("valid");
          _i.removeAttribute("aria-invalid");
        }
      }  
    function _getInputIdentifier(_i){
        return _i.name || _i.id || _getDomPath(_i);//Array.from(_i.parentNode.children).indexOf(_i);
      }
    function getFieldKey(el) {
        return (
          el.name ||
          el.id ||
          `field_${el.tagName.toLowerCase()}_${Array.from(el.parentNode.children).indexOf(el)}`
        );
      }
    function _getNodeIndex(el) {
        return Array.prototype.indexOf.call(el.parentNode.children, el);
      }
    function _getDomPath(el) {
        const path = [];
        while (el && el.nodeType === 1) {
            const index = _getNodeIndex(el);
            path.unshift(`${el.tagName.toLowerCase()}:nth-child(${index + 1})`);
            el = el.parentNode;
          }
        return path.join(" > ");
      }
    this.addValidator = function (_i, _r) {
        if (Array.isArray(_i)) {
            if (_i.every(_isPlainObject)) {
                _i.forEach((item) => {
                  _objCheck(item);
                });
              } else {
                  _errors.push(new Error('Array must contain only plain objects.'));
                  if (_options.debug) throw new Error('Array must contain only plain objects.');
                }
          }
        if (_isPlainObject(_i)) {
            _objCheck(_i);
          }
        _prepareValidator(_i, _r);
        return this;
      };
    this.onSuccess = function (_c) {
        _logMessenger('Form was successfully submitted...');
        if (_successCallback) {
            _errors.push(new Error("Success callback is already registered"));
            if (_options.debug) throw new Error("Success callback is already registered");
          }
        if (typeof _c === "function") {
            _successCallback = _c;
          }
        else if (_c !== null && _options.debug === true) {
            _errors.push(new Error('Callback is not a valid function and cannot be executed:"' + typeof _c + '"'));
            throw new Error('Callback is not a valid function and cannot be executed:"' + typeof _c + '"');
          }
        return this;
      };
    this.onError = function (_c) {
        _logMessenger('Form validation failed...');
        if (_errorCallback) {
          _errors.push(new Error("Error callback is already registered"));
          if (_options.debug) throw new Error("Error callback is already registered");
        }
        if (typeof _c === "function") {
          _errorCallback = _c;
        }
        else if (_c !== null && _options.debug === true) {
          _errors.push(new Error('Callback is not a valid function and cannot be executed:"' + typeof _c + '"'));
          throw new Error('Callback is not a valid function and cannot be executed:"' + typeof _c + '"');
        }
        return this;
      };  
    this.onValidate = function (_c) {
        _logMessenger('Form is being validated...');
        if (_validateCallback) {
          _errors.push(new Error("Validate callback is already registered"));
          if (_options.debug) throw new Error("Validate callback is already registered");
        }
        if (typeof _c === "function") {
          _validateCallback = _c;
        }
        else if (_c !== null && _options.debug === true) {
          _errors.push(new Error('Callback is not a valid function and cannot be executed:"' + typeof _c + '"'));
          throw new Error('Callback is not a valid function and cannot be executed:"' + typeof _c + '"');
        }
        return this;
      };  
    this.init = function () {
        if (_mounted) return this;

        _logMessenger('Initializing DalinaFVS...');
        _logMessenger(`Checking instance form element ${form}...`);

        if (_form instanceof HTMLFormElement &&
          _form &&
          _form.nodeType === 1 &&
          typeof _form.nodeName === 'string') {

          _form.classList.add(_cStyle.replace('.', ''));

          _removeIfExists('input[name="unTrusted"]');
          _createHiddenInput("unTrusted", false);

          if (_options.bait) {

            _removeIfExists('input[name="NFrmKey"]');
            _createHiddenInput("NFrmKey");

            _removeIfExists('input[name="DFrmKey"]');
            _createHiddenInput("DFrmKey", _options.defaultKey, [{ "required": "required" }]);

          }

          //_inputs = Array.from(_form.elements).filter(el => el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
          _inputs = Array.from(_form.elements).filter(el => ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
          // _inputs.forEach(_setupListeners);
          _inputs = Array.from(_inputs);
          _validators = new Map();
          _button = _form.querySelector('[type="submit"]');
          _appendStyle(form);
          _setupSubmitHandler();
          
          _mounted = true;
        } else {
          if (_options.debug) throw new Error(`Invalid HTMLFormElement "${form}"`);
        } 
        return this;
      };
    this.validate = function () {
        let valid = true;
        _inputs.forEach(el => {
            el.setCustomValidity("");
            if (!el.checkValidity()) valid = false;
          if (!el.checkValidity() && _errorCallback && typeof _errorCallback === "function") {
              _errorCallback(self.getErrors());
            }
            if (!_firstInvalid && !el.checkValidity()) {
                _firstInvalid = el;
              }  
          });
        return valid;
      }; 
    this.reset = function () {
        _inputs.forEach(el => {
          el.value = "";
          el.setCustomValidity("");
          el.classList.remove("valid", "invalid");
          el.removeAttribute("placeholder");
        });

        _firstInvalid = null; 
        _keyboardEvents = 0;
        _isManualInput = false;

        if (_form) _form.reset();

        return this;
      };
    this.clear = function () {
        _inputs.forEach(el => {
          el.setCustomValidity("");
          el.classList.remove("valid", "invalid");
          el.removeAttribute("placeholder");
        });
        return this;
      };
    this.getValidationErrors = function(){
        const errors = {};

        _inputs.forEach(el => {
            if (!el.checkValidity()) {
              errors[getFieldKey(el)] = el.validationMessage;
              }
          });

        const lines = ['\n'];

        Object.entries(errors).forEach(([field, message]) => {
          lines.push(`• ${field}`);
          lines.push(`   - ${message}`);
        });

        const err = new Error(lines.join("\n"));
        err.name = "DalinaFVS Error";
        err.errors = errors;
        return err;
      };   
    this.getErrors = function () { 
        return _errors;
        // throw err;
      };  
    this.getData = function () {
        const data = {};

        _inputs.forEach(el => {
          //if (!el.name) return;

          if (el.type === "checkbox") {
            data[getFieldKey(el)] = el.checked; 
          }
          else if (el.type === "radio") {
            if (el.checked) data[getFieldKey(el)] = el.value;
          }
          else {
            data[getFieldKey(el)] = el.value;
          }
        });

        return data;
      };       
    this.destroy = function () {
      if (!_mounted) return this;

      _inputs.forEach(el => {
        const handlers = _listeners.get(el);
        if (!handlers) return;

        Object.entries(handlers).forEach(([event, fn]) => {
          el.removeEventListener(event, fn);
        });

        _listeners.delete(el);
      });

      // _inputs.forEach(el => {
      //   const handlers = _listeners.get(el);
      //   if (!handlers) return;

      //   el.removeEventListener("keydown", handlers.keydown);
      //   el.removeEventListener("keyup", handlers.keyup);
      //   el.removeEventListener("paste", handlers.paste);
      //   el.removeEventListener("focus", handlers.focus);
      //   el.removeEventListener("change", handlers.change);
      //   el.removeEventListener("input", handlers.input);

      //   _listeners.delete(el);
      // });

      _validators.clear();
      _successCallback = null;
      _firstInvalid = null;
      _isManualInput = false;
      _keyboardEvents = 0;
      _mouseEvents = 0;
      _options = {};
      _form = null;
      _button = null;
      _inputs.length = 0;

      // Remove injected CSS
      const css = document.getElementById("DalinaFVS-CSS");
      if (css) css.remove();

      _button.removeEventListener("click");
      _form.removeEventListener("submit");
      return this;
    };
    this.refresh = function () {
      return this.destroy().init();
    };
    this.init();
  }
  w.DalinaFVS = DalinaFVS;
})(document, window);

// const DFVS = new DalinaFVS("#loginForm");
// DFVS.addValidator('[type="email"]', (v) => v && v.toString().endsWith('@gmail.com') ? null : `Value ${v} must ends with "@gmail.com".`)
//   .onSuccess(function (form) {
//     console.info('Form was validated');
//   });
//console.log(JSON.stringify(DFVS));

//https://jshint.com/
//https://validatejavascript.com/
// const fvs = new DalinaFVS("form");

// fvs.addValidator('input#fname', (v) => v && v.toString().startsWith('Bradley') ? null : `Value ${v} must starts with "Bradley".`) 
// .onValidate(function(){
//   console.info("Validating your form!");
// }).onSuccess(function(){
//   console.warn("Your form was successfully validated.");
// }).onError(function(){
//   console.error("Validation failed");
// });
// console.log(fvs.getData()); 
// console.log(document.querySelector('form:nth-child(3) > input:nth-child(8)').type); 
