"use strict";
/**
 * Input Component
 *
 * Form input with consistent styling.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const React = __importStar(require("react"));
const cn_js_1 = require("../utils/cn.js");
const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
    return (<input type={type} className={(0, cn_js_1.cn)('flex h-10 w-full rounded-md border bg-white px-3 py-2', 'text-sm text-neutral-900 placeholder:text-neutral-400', 'transition-colors duration-150', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0', 'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50', error
            ? 'border-error-500 focus-visible:ring-error-500'
            : 'border-neutral-300 focus-visible:ring-brand-500', className)} ref={ref} {...props}/>);
});
exports.Input = Input;
Input.displayName = 'Input';
//# sourceMappingURL=input.js.map